from obspy.core import read
sta1 = 'http://escience8.inf.ed.ac.uk:8080/laquila/SAC/A25A.TA..BHZ.2011.025.00.00.00.000-2011.026.00.00.39.000.rm.scale-AUTO.SAC'
sta2 = 'http://escience8.inf.ed.ac.uk:8080/laquila/SAC/BMN.LB..BHZ.2011.025.00.00.00.023-2011.026.00.00.38.998.rm.scale-AUTO.SAC'

from dispel4py.base import SimpleFunctionPE, IterativePE, create_iterative_chain
from dispel4py.seismo.seismo import *
from dispel4py.provenance import *

def stream_producer(data):
    
    filename = data
    st = read(filename)
     
    return st

def extractStation(st):
    station_name = st[0].stats['station']
     
    return [station_name, st]


def decimate(st, sps):
    print 'in decimate: '+str(type(st))
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




from dispel4py.workflow_graph import WorkflowGraph
streamProducer = ProvenancePE(stream_producer)
sta = ProvenancePE(extractStation) 

preprocess_trace = create_iterative_chain([
    (decimate, {'sps':4}), 
    detrend, 
    demean,
    spectralwhitening],FunctionPE_class=ProvenancePE)

graph = WorkflowGraph()
graph.connect(streamProducer, 'output', preprocess_trace, 'input')
graph.connect(preprocess_trace, 'output', sta, 'input')
InitiateNewRun(graph,ProvenanceRecorderToService,input=[{'test':'1','blah':'3'}],username="aspinuso",workflowId="173",description="test",system_id="xxxx",workflowName="postprocessing",runId="stami8",w3c_prov=False)




from dispel4py import simple_process
input_data = [ {'input' : sta1 },{'input' : sta2 }]
simple_process.process(graph, input_data)