'''
Created on June 2, 2014

@author: mdavid@ipgp.fr
@author: INGV
@author: WHISPER

PEs used in the reference DI workflow
Only GapCorr accepts an obspy stream, the others are numpy ndarrays
'''
import scipy.signal
import scipy.fftpack
import numpy
import time
from obspy.core import read, trace, stream, UTCDateTime
from obspy.signal.cross_correlation import xcorr

'''
gapcorr = 0 fill gaps with 0s
gapcorr = 1 fill gaps with interpolation

tlength: time length of raw data in seconds
tlength = 86400 for Laquila dataset
'''
def PEGapCorr(pe, stream, gapcorr, tlength):
    if (gapcorr == 1): # by default gaps are filled with zero: gapcorr=0
        print 'Not yet implemented if gapcorrection is other then fill gaps with 0'
    freqIn = int(pe.attr['sampling_rate'])
    npts = tlength*freqIn
    stream = stream.astype(float)
    
    # this is a tricky part to get the correct day
    # some traces have a starttime in the previous day - 2010-01-15T23:59:59.999999Z
    # the alignemnt of the trace should be implemented here
    # stream will be aligned to a start time of 00:00:00.0000
    # For now it is assumed that the trace corresponds to the day
    # given in starttime+1 second
    rawstime = UTCDateTime(pe.attr['starttime']) # start data-time of raw trace
    sdt = rawstime + 1.0
    stime = UTCDateTime(sdt.date) # start data-time of aligned trace
    etime = UTCDateTime(stime) + (npts-1) * 1.0 / freqIn
    # HERE update the start date time of the aligned trace pe.attr['starttime'] = str(stime)
    if (stime >= rawstime):
        idxs = 0
    else:
        idxs = int (freqIn * (UTCDateTime(rawstime) - UTCDateTime(stime)))
        stream = numpy.concatenate( (numpy.zeros(idxs), stream) )
    lenRaw = len(stream)
    if (lenRaw >= npts):
        stream = stream[:npts]
    else:
        stream = numpy.concatenate( (stream, numpy.zeros(npts-lenRaw)) )
    pe.attr['starttime'] = str(stime)
    pe.attr['npts'] = len(stream)
    pe.attr['endtime'] = str(etime)
    pe._timestamp['starttime'] = pe.attr['starttime']
    pe._timestamp['endtime'] = pe.attr['endtime']
    pe.outputattr = [pe.attr] # Need to wrap up attr into a list outputattr to be available to the other PEs
    return stream

'''
All further PEs the stream is a numpy ndarray
'''
def PEMeanSub(pe, stream):
    pe.outputattr = [pe.attr]
    return scipy.signal.detrend(stream, type='constant')

def PEDetrend(pe, stream):
    pe.outputattr = [pe.attr]
    return scipy.signal.detrend(stream, type='linear')

def PEClip(pe, stream, factor):
    """
    Clips the trace to +- rmsTr*factor
    """
    pe.outputattr = [pe.attr]
    clipFactor = factor*numpy.std(stream)
    return numpy.clip(stream, -clipFactor, clipFactor)

'''
Adapted from Whiten_INGV.py
'''
def PEWhite(pe, stream, flo, fhi):
    ti = time.time()
    nsamp = pe.attr['sampling_rate']

    n = len(stream)
    frange = fhi-flo
    nsmo = int( numpy.fix( min(0.01, 0.5*(frange) ) * float(n)/nsamp) )
    f = numpy.arange(n)*nsamp/(n-1.)
    JJ = ( (f > flo) & (f < fhi) ).nonzero()[0]
                
    # signal FFT
    FFTs = numpy.fft.fft(stream)
    FFTsW = numpy.zeros(n) + 1j *numpy.zeros(n)

    # Apodization to the left with cos^2 (to smooth the discontinuities)
    smo1 = numpy.cos( numpy.linspace(numpy.pi/2, numpy.pi,nsmo+1) )**2
    espo1 = numpy.exp( 1j*numpy.angle(FFTs[ JJ[0] : JJ[0]+nsmo+1 ]) )
    FFTsW[ JJ[0] : JJ[0]+nsmo+1 ] = smo1 * espo1
    
    espoM = numpy.exp( 1j*numpy.angle(FFTs[ JJ[0]+nsmo+1 : JJ[-1]-nsmo ]) )
    FFTsW[ JJ[0]+nsmo+1 : JJ[-1]-nsmo ] = numpy.ones( len(JJ)-2*(nsmo+1) ) * espoM

    # Apodization to the right with cos^2 (to smooth the discontinuities)
    smo2 = numpy.cos( numpy.linspace(0., numpy.pi/2., nsmo+1.) )**2
    espo = numpy.exp( 1j*numpy.angle(FFTs[ JJ[-1]-nsmo : JJ[-1]+1 ]) )
    FFTsW[ JJ[-1]-nsmo : JJ[-1]+1 ] = smo2*espo
    
    stream = 2.*numpy.fft.ifft(FFTsW).real
    tf = time.time()
    dt = tf-ti
    print '='*120
    print 'PEWhite dt = %f\tTSTAMP = %f\tTRACE = %s %s' %(dt, tf, pe.attr['station'], pe.attr['starttime'])
    print '='*120
    pe.outputattr = [pe.attr]
    return stream

'''
Decimation function adapted from Whisper trace library
'''
def PEDecim(pe, stream, freqOut):
    """
    Return the stream decimated.

    .. Note::
    
        freqIn and freqOut are floats
        The ratio freqIn/freqOut must be either a float or a product 
        of powers of numeral in {2, 3, 4, 5, 6, 7, 8}.
                    
    """
    freqIn = pe.attr['sampling_rate']
    rateFreq = freqIn/freqOut
    if numpy.round(rateFreq, 3) == numpy.round(rateFreq, 0):
        #decimate does not work if rateFreq is not a multiple of {2,3,...,8}
        listDiv = [8,7,6,5,4,3,2]
        while rateFreq > 8:
            for divis in listDiv:
                ratio = rateFreq/divis
                if numpy.round(ratio, 3) == numpy.round(ratio, 0):
                    stream = scipy.signal.decimate(stream, divis)
                    freqIn = freqIn/divis
                    rateFreq = freqIn/freqOut
                    break    #In order to choose the bigger divis
        stream = scipy.signal.decimate(stream, int(freqIn/freqOut))
    else:
        stream.resample(freqOut)

    npts = len(stream)
    stime = pe.attr['starttime']
    etime = UTCDateTime(stime) + (npts-1) * 1.0 / freqOut
    pe.attr['sampling_rate'] = freqOut
    pe.attr['npts'] = npts
    pe.attr['endtime'] = str(etime)
    pe.outputattr = [pe.attr]
    return stream

'''
My own attemp at the XCorr PE
The traces are normalized and calculate xcorr with obspy.signal.cross_correlation
author mdavid@ipgp.fr
'''
def PEXCorr1(st1, st2, maxlag):
    st1 = st1/numpy.linalg.norm(st1)
    st2 = st2/numpy.linalg.norm(st2)
    return xcorr(st1, st2, maxlag, full_xcorr=True)[2]

'''
This one adapted from MSNoise - NOT WORKING properly at the moment
MSNoise is a joint project of the Royal Observatory of Belgium (Thomas Lecocq and Corentin Caudron) and ISTerre + IPGP (Florent Brenguier)
http://www.msnoise.org/
'''
def PEXCorr2(st1, st2, maxlag):
    """
    This function takes ndimensional *data* array, computes the cross-correlation in the frequency domain
    and returns the cross-correlation function between [-*maxlag*:*maxlag*].
    !add a line on the +++++----- to -----++++++

    :param numpy.ndarray data: This array contains the fft of each timeseries to be cross-correlated.
    :param int maxlag: This number defines the number of samples (N=2*maxlag + 1) of the CCF that will be returned.

    :rtype: numpy.ndarray
    :returns: The cross-correlation function between [-maxlag:maxlag]
"""

    fft1 = scipy.fftpack.fft(st1)
    fft2 = scipy.fftpack.fft(st1)
    data = numpy.array([fft1, fft2])

    normalized = True

    # maxlag = numpy.round(maxlag)
    #~ print "np.shape(data)",np.shape(data)
    if numpy.shape(data)[0] == 2:
        K = numpy.shape(data)[0]
        #couples de stations
        couples = numpy.concatenate((numpy.arange(0, K), K + numpy.arange(0, K)))

    Nt = numpy.shape(data)[1]
    Nc = 2 * Nt - 1
    
    # next power of 2
    Nfft = 2 ** numpy.ceil( numpy.log2(numpy.abs(Nc)) )

    # corr = scipy.fftpack.fft(data,int(Nfft),axis=1)
    corr = data
    corr = numpy.conj(corr[couples[0]]) * corr[couples[1]]
    corr = numpy.real(scipy.fftpack.ifft(corr)) / Nt
    corr = numpy.concatenate((corr[-Nt + 1:], corr[:Nt + 1]))
    E = numpy.sqrt(numpy.mean(scipy.fftpack.ifft(data, axis=1) ** 2, axis=1))
    normFact = E[0] * E[1]
    if normalized:
        corr /= numpy.real(normFact)
    if maxlag != Nt:
        tcorr = numpy.arange(-Nt + 1, Nt)
        dN = numpy.where(numpy.abs(tcorr) <= maxlag)[0]
        corr = corr[dN]
    del data
    return corr

################################################
# Codes developed for the Whisper Project,
# FP7 ERC Advanced grant 227507
# by Xavier Briand: xav.briand.whisper@gmail.com
# with Michel Campillo and Philippe Roux.
################################################
'''
Adapted rom WHISPER
We will set GoodNumber = LenTrace+maxlag parameter
'''
def PEXCorr3(st1, st2, maxlag):
    """
    Return the correlation of trace01 and trace02 normalized.

    :Parameters:
        **trace01**, **trace02**: numpy array
            the traces for the correlation:

    .. Note:: 
        **Requirement**:
        The trace **trace01** and **trace02** are supposed to have the **same length**.

    """
    LenTrace = len(st1)
    GoodNumber = LenTrace+maxlag
    tr2 = numpy.zeros(GoodNumber)
    tr2[0 : LenTrace] = st1
    tr2[0 : LenTrace] /= numpy.sqrt( numpy.sum(tr2[0 : LenTrace]**2) )
    tr2 = scipy.fftpack.fft(tr2, overwrite_x=True)
    tr2.imag *= -1
    tr1 = numpy.zeros(GoodNumber)
    tr1[maxlag : maxlag+LenTrace] = st2
    tr1[maxlag : maxlag+LenTrace] /= numpy.sqrt( numpy.sum(tr1[maxlag : maxlag+LenTrace]**2) )
    tr2 *= scipy.fftpack.fft(tr1, overwrite_x=True)
    return ( scipy.fftpack.ifft(tr2, overwrite_x=True)[0 : 2*maxlag+1].real )

