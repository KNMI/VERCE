from obspy.core import read
sta1 = 'http://escience8.inf.ed.ac.uk:8080/laquila/SAC/A25A.TA..BHZ.2011.025.00.00.00.000-2011.026.00.00.39.000.rm.scale-AUTO.SAC'
sta2 = 'http://escience8.inf.ed.ac.uk:8080/laquila/SAC/BMN.LB..BHZ.2011.025.00.00.00.023-2011.026.00.00.38.998.rm.scale-AUTO.SAC'

from dispel4py.base import SimpleFunctionPE, IterativePE, create_iterative_chain
def stream_producer(data):
    filename = data
    st = read(filename)
    return st

def readstats(st):
    station_date = st[0].stats['starttime'].date
    station_day = station_date.strftime('%d-%m-%Y')
    station = st[0].stats['station']
    return [station_day, station, st]


def decimate(st, sps):
    st.decimate(int(st[0].stats.sampling_rate/sps))
    return st

def detrend(st):
    st.detrend('simple')
    return st

def demean(st):
    st.detrend('demean')
    return st

def filter(st, freqmin=0.01, freqmax=1., corners=4, zerophase=False):
    st.filter('bandpass', freqmin=freqmin, freqmax=freqmax, corners=corners, zerophase=zerophase)
    return st


from numpy import arange, sqrt, abs, multiply, conjugate, real
from obspy.signal.util import nextpow2
from scipy.fftpack import fft, ifft

def spectralwhitening(st):
    """
    Apply spectral whitening to data.
    Data is divided by its smoothed (Default: None) amplitude spectrum.
    """
    
    for trace in arange(len(st)):
        data = st[trace].data
        
        n = len(data)
        nfft = nextpow2(n)
        
        spec = fft(data, nfft)
        spec_ampl = sqrt(abs(multiply(spec, conjugate(spec))))
        
        spec /= spec_ampl  #Do we need to do some smoothing here?
        ret = real(ifft(spec, nfft)[:n])
        
        st[trace].data = ret
        
    return st

from dispel4py.core import GenericPE
class MatchPE(GenericPE):
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input1', grouping=[0])
        self._add_input('input2', grouping=[0])
        self._add_output('output')
        self.data = {}
    def process(self, inputs):
        try:
            tup = inputs['input1']
        except KeyError:
            tup = inputs['input2']
        date = tup[0]
        station = tup[1]
        try:
            matching = self.data[date]
            result = [date, tup[2], matching[2]]
            self.write('output', result)
        except:
            self.data[date] = tup
            
            
            
from obspy.signal.cross_correlation import xcorr
import numpy
def xcorrelation(data, maxlag):
    st1 = data[1]
    st2 = data[2]
    tr1 = st1[0].data
    tr2 = st2[0].data
    tr1 = tr1/numpy.linalg.norm(tr1)
    tr2 = tr2/numpy.linalg.norm(tr2)
    return xcorr(tr1, tr2, maxlag, full_xcorr=True)[2]


from dispel4py.workflow_graph import WorkflowGraph
streamProducer = SimpleFunctionPE(stream_producer)
stats1 = SimpleFunctionPE(readstats) 
stats2 = SimpleFunctionPE(readstats) 
match_traces=MatchPE()
xcorrelation_traces= SimpleFunctionPE(xcorrelation, {'maxlag':1000}) 

pipeline = [
    (decimate, {'sps':4}), 
    detrend, 
    demean, 
    (filter, {'freqmin':0.01, 'freqmax':1., 'corners':4, 'zerophase':False}),
    spectralwhitening,
    readstats]
preprocess_trace_1 = create_iterative_chain(pipeline)
preprocess_trace_2 = create_iterative_chain(pipeline)

graph = WorkflowGraph()
graph.connect(streamProducer, 'output', preprocess_trace_1, 'input')
graph.connect(streamProducer, 'output', preprocess_trace_2, 'input')
graph.connect(preprocess_trace_1, 'output', match_traces, 'input1')
graph.connect(preprocess_trace_2, 'output', match_traces, 'input2')
graph.connect(match_traces, 'output', xcorrelation_traces, 'input')
 


#from dispel4py import simple_process
#input_data = [ {'input' : sta1 },{'input' : sta2 }]
#simple_process.process(graph, input_data)