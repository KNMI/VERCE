# For executing the worklfow, you need to have first the correct paths of the
# data in the misfit_input.jsn file
# Type the following command, for running the workflow.
# python -m dispel4py.new.processor simple
# dispel4py/test/seismo/misfit_preprocess.py -f
# dispel4py/test/seismo/misfit_input.jsn

import glob
import inspect
import json
import os
import sys
import socket
import numpy as np
import obspy
#from dispel4py.seismo.seismo import *
from obspy.core.event import readEvents, ResourceIdentifier
from obspy.signal.invsim import c_sac_taper
from obspy.signal.util import _npts2nfft
import scipy.signal
import matplotlib.pyplot as plt
import matplotlib.dates as mdt
from dispel4py.core import GenericPE
from dispel4py.base import IterativePE, ConsumerPE, create_iterative_chain
import gc 
#from dispel4py.workflow_graph import WorkflowGraph


def get_event_time(event):
    """
    Extract origin time from event XML file.
    """
    if not isinstance(event, obspy.core.event.Event):
        event = obspy.readEvents(event)[0]
    origin = event.preferred_origin() or event.origins[0]
    return origin.time


def get_synthetics(synts, event_time):
    if isinstance(synts, list):
        file_names = synts
    else:
        file_names = glob.glob(synts)
    st = obspy.Stream()
    for name in file_names:
        st += obspy.read(name)

    # The start time of the synthetics might not be absolute. Grant a tolerance
    # of 10 seconds.
    if -10.0 <= st[0].stats.starttime.timestamp <= 0.0:
        for tr in st:
            offset = tr.stats.starttime - obspy.UTCDateTime(0)
            tr.stats.starttime = event_time + offset

    return st


def read_stream(data_files, sxml, event_file, event_id):
    print data_files
    stream = obspy.read(data_files)
    stations = obspy.read_inventory(sxml, format="STATIONXML")
    stream.attach_response(stations)
    events = readEvents(event_file)
    event = None
    resource_id = ResourceIdentifier(event_id)
    for evt in events:
        if evt.resource_id == resource_id:
            event = evt
    if event is None:
        event = events[0]
    return stream, stations, event


def get_event_coordinates(event):
    if not isinstance(event, obspy.core.event.Event):
        event = obspy.readEvents(event)[0]
    origin = event.preferred_origin() or event.origins[0]
    return origin.longitude, origin.latitude


def zerophase_chebychev_lowpass_filter(trace, freqmax):
    """
    Custom Chebychev type two zerophase lowpass filter useful for
    decimation filtering.

    This filter is stable up to a reduction in frequency with a factor of
    10. If more reduction is desired, simply decimate in steps.

    Partly based on a filter in ObsPy.

    :param trace: The trace to be filtered.
    :param freqmax: The desired lowpass frequency.

    Will be replaced once ObsPy has a proper decimation filter.
    """
    # rp - maximum ripple of passband, rs - attenuation of stopband
    rp, rs, order = 1, 96, 1e99
    ws = freqmax / (trace.stats.sampling_rate * 0.5)  # stop band frequency
    wp = ws  # pass band frequency

    while True:
        if order <= 12:
            break
        wp *= 0.99
        order, wn = scipy.signal.cheb2ord(wp, ws, rp, rs, analog=0)

    b, a = scipy.signal.cheby2(order, rs, wn, btype="low", analog=0,
                               output="ba")

    # Apply twice to get rid of the phase distortion.
    trace.data = scipy.signal.filtfilt(b, a, trace.data)


def aliasing_filter(tr, target_sampling_rate):
    while True:
        decimation_factor = int(1.0 / target_sampling_rate / tr.stats.delta)
        # Decimate in steps for large sample rate reductions.
        if decimation_factor > 8:
            decimation_factor = 8
        if decimation_factor > 1:
            new_nyquist = tr.stats.sampling_rate / 2.0 / float(
                decimation_factor)
            zerophase_chebychev_lowpass_filter(tr, new_nyquist)
            tr.decimate(factor=decimation_factor, no_filter=True)
        else:
            break


def sync_cut(data, synth, lenwin=None):
    """
    return cutted copy of data and synth

    :param data: Multicomponent stream of data.
    :param synth: Multicomponent stream of synthetics.
    :param sampling_rate: Desired sampling rate.
    """
    sampling_rate = min([tr.stats.sampling_rate for tr in (data + synth)])
    for tr in data:
        aliasing_filter(tr, sampling_rate)
    for tr in synth:
        aliasing_filter(tr, sampling_rate)

    starttime = max([tr.stats.starttime for tr in (data + synth)])
    endtime = min([tr.stats.endtime for tr in (data + synth)])

    if lenwin:
        if (endtime - starttime) < lenwin:
            raise ValueError("lenwin is larger than the data allows.")
        endtime = starttime + float(lenwin)

    npts = int((endtime - starttime) * sampling_rate)
    
    

    data.interpolate(sampling_rate=sampling_rate, method="cubic",
                     starttime=starttime, npts=npts)
    synth.interpolate(sampling_rate=sampling_rate, method="cubic",
                      starttime=starttime, npts=npts)

    return data, synth


def rotate_data(stream, stations, event):
    """
    Rotates the data to ZRT.
    """
    n = stream.select(component='N')
    e = stream.select(component='E')

    stations = stations.select(network=stream[0].stats.network,
                               station=stream[0].stats.station)

    if len(e) and len(n):
        #print "COORD:"+str(get_event_coordinates(event))
        lon_event, lat_event = get_event_coordinates(event)
        lon_station, lat_station = stations[0][0].longitude, \
            stations[0][0].latitude
        dist, az, baz = obspy.core.util.geodetics.base.gps2DistAzimuth(
            float(lat_event), float(lon_event), float(lat_station),
            float(lon_station))
        stream.rotate('NE->RT', baz)
    else:
        raise ValueError("Could not rotate data")
    return stream


def remove_response(stream, pre_filt=(0.01, 0.02, 8.0, 10.0),
                    response_output="DISP"):
    """
    Removes the instrument response.

    Assumes stream.attach_response has been called before.
    """
    stream.remove_response(pre_filt=pre_filt,
                           output=response_output,
                           zero_mean=False, taper=False)
    return stream


def pre_filter(stream, pre_filt=(0.02, 0.05, 8.0, 10.0)):
    """
    Applies the same filter as remove_response without actually removing the
    response.
    """
    for tr in stream:
        data = tr.data.astype(np.float64)
        nfft = _npts2nfft(len(data))
        fy = 1.0 / (tr.stats.delta * 2.0)
        freqs = np.linspace(0, fy, nfft // 2 + 1)

        # Transform data to Frequency domain
        data = np.fft.rfft(data, n=nfft)
        data *= c_sac_taper(freqs, flimit=pre_filt)
        data[-1] = abs(data[-1]) + 0.0j
        # transform data back into the time domain
        data = np.fft.irfft(data)[0:tr.stats.npts]
        # assign processed data and store processing information
        tr.data = data
    return stream


def detrend(stream, method='linear'):
    stream.detrend(method)
    return stream


def taper(stream, max_percentage=0.05, taper_type="hann"):
    stream.taper(max_percentage=max_percentage, type=taper_type)
    return stream


def filter_lowpass(stream, frequency, corners, zerophase):
    stream.filter("lowpass", freq=frequency, corners=corners,
                  zerophase=zerophase)
    return stream


def filter_highpass(stream, frequency, corners, zerophase):
    stream.filter("highpass", freq=frequency, corners=corners,
                  zerophase=zerophase)
    return stream


def filter_bandpass(stream, min_frequency, max_frequency, corners, zerophase):
    stream.filter("bandpass", freqmin=min_frequency,
                  freqmax=max_frequency, corners=corners,
                  zerophase=zerophase)
    return stream


def plot_stream(stream,output_dir,source,tag):
    try:
        stats = stream[0].stats
        filename = source+"-%s.%s.%s.png" % (
                                     stats['network'], stats['station'], tag)
        
        
        path = os.environ['STAGED_DATA']+'/'+output_dir
        
        if not os.path.exists(path):
            try:
                os.makedirs(path)
            except:
                pass
        
        name=str(stats.network) + "." + stats.station + "." + stats.channel
            
        t0=719164.
    #    self.outputdest=self.outputdest+"/"+name+".png"
        #self.log("FFF:"+self.outputdest)
        if mdt.date2num(stream[0].stats.starttime) > t0:
            date="Date: " + str(stream[0].stats.starttime.date)
        else:
            date=""
        fig = plt.figure()
        fig.set_size_inches(12,6)
        fig.suptitle(name)
        plt.figtext(0.1, 0.95,date)

        ax = fig.add_subplot(len(stream),1,1)
        for i in xrange (len(stream)):

            plt.subplot(len(stream),1,i+1,sharex=ax)
            t0=719163.
            t2=mdt.date2num(stream[i].stats.endtime)
            t1=mdt.date2num(stream[i].stats.starttime)
            #print t1,t2,stream[i].stats.npts,(t2-t1)/stream[i].stats.npts
            t=np.linspace(0,stream[i].stats.npts*stream[i].stats.delta,
            stream[i].stats.npts)
            #print stream[i].stats
            #print stream[0].stats.starttime.datetime
            #t=np.linspace(mdt.date2num(stream[i].stats.starttime) ,
            #mdt.date2num(stream[i].stats.endtime) ,
            #stream[i].stats.npts)
            
            plt.plot(t, stream[i].data,color='gray')
            
            #ax.set_xlim(mdt.date2num(stream[0].stats.starttime), mdt.date2num(stream[-1].stats.endtime))
            ax.set_xlim(0,stream[i].stats.npts*stream[i].stats.delta)

            #ax.xaxis.set_major_formatter(mdt.DateFormatter('%I:%M %p'))
            #ax.format_xstream = mdt.DateFormatter('%I:%M %p')


        dest=os.path.join(path, filename)
        fig1 = plt.gcf()
         
        plt.draw()
        
        fig1.savefig(dest)

        __file = open(dest)

        plt.close(fig1)
        fig1.clf()
        plt.close(fig1)
        #del t, stream[i].data
        gc.collect()



        
        #stream.plot(outfile=dest)
        prov={'location':"file://"+socket.gethostname()+"/"+dest, 'format':'image/png','metadata':{'prov:type':tag,'source':source,'station':stats['station']}}
        
    except:
        traceback.print_exc()
        #None


     
    return stream, prov

def store_stream(stream,output_dir,source,tag):
    
    stats = stream[0].stats
    filename = source+"-%s.%s.%s.%s.seed" % (
            stats['network'], stats['station'], stats['channel'], tag)
    
    path = os.environ['STAGED_DATA']+'/'+output_dir
    
    if not os.path.exists(path):
        os.makedirs(path)
    
    dest=os.path.join(path, filename)
    stream.write(dest, format='MSEED')
    prov={'location':"file://"+socket.gethostname()+"/"+dest, 'format':'application/octet-stream','metadata':{'prov:type':tag}}
    return stream, prov
    
