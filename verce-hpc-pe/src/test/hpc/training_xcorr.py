from obspy.core import read
sta1 = 'http://escience8.inf.ed.ac.uk:8080/laquila/SAC/A25A.TA..BHZ.2011.025.00.00.00.000-2011.026.00.00.39.000.rm.scale-AUTO.SAC'
sta2 = 'http://escience8.inf.ed.ac.uk:8080/laquila/SAC/BMN.LB..BHZ.2011.025.00.00.00.023-2011.026.00.00.38.998.rm.scale-AUTO.SAC'

from dispel4py.base import SimpleFunctionPE, IterativePE, create_iterative_chain
from dispel4py.seismo.seismo import *
from dispel4py.provenance import *
import matplotlib.pyplot as plt
import matplotlib.dates as mdt
import numpy as np

def stream_producer(data):
    
    filename = data
    st = read(filename)
    prov={'location':"http://dataarchive.me/filename", 'format':'application/octet-stream', 'metadata':{'my_feature1':2,'my_feature2':'test'}}
    return {'prov':prov,'data':st}

def readstats(st):
    station_date = st[0].stats['starttime'].date
    station_day = station_date.strftime('%d-%m-%Y')
    station = st[0].stats['station']
     
    return [station_day, station, st]

def extractStation(st):
    station_name = st[0].stats['station'] 
    return [station_name, st]


def decimate(st, sps):
    
    result=st.decimate(int(st[0].stats.sampling_rate/sps))
    
    return result
     

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


class MatchPE(ProvenancePE):
    def __init__(self):
        ProvenancePE.__init__(self)
        self._add_input('input1', grouping=('prov',[0]))
        self._add_input('input2', grouping=('prov',[0]))
        self._add_output('output')
        self.data = {}
    def _process(self, inputs):
        
        try:
            tup = inputs['input1']
            key='input1'
        except KeyError:
            tup = inputs['input2']
        date = tup[0]
        station = tup[1]
        try:
            matching = self.data[date]
            result = [date, tup[2], matching[2]]
            return self.write('output', result,metadata={'sta1':str(result[1]),'sta2':str(result[2])})
        except:
            self.data[date] = tup
            
            
            
from obspy.signal.cross_correlation import xcorr
import numpy
def xcorrelation(data, maxlag):
    print "XCORRR: "+str(data)
    st1 = data[1]
    st2 = data[2]
    tr1 = st1[0].data
    tr2 = st2[0].data
    tr1 = tr1/numpy.linalg.norm(tr1)
    tr2 = tr2/numpy.linalg.norm(tr2)
    return xcorr(tr1, tr2, maxlag, full_xcorr=True)[2]

def stackPlot(data,s_rate):
        sampling_rate=float("%s" % (s_rate,));
        
        outputdest="stack.png"
        fig = plt.figure()
        fig.set_size_inches(12,6)
        fig.suptitle("Stack")

        # NB .size assumes there's only 1 row in array!
        bound = np.floor(data.size/2.)/sampling_rate
        t = np.linspace(-bound, bound, data.size)

        plt.plot(t, data,color='gray')
        plt.xlabel("time [s]")

        fig1 = plt.gcf()
         
        plt.draw()
        fig1.savefig(outputdest)
        prov={'location':"file://"+socket.gethostname()+"/"+outputdest, 'format':'image/png', 'metadata':{'my_term':'my_value'}}
        return {'prov':prov,'data':data}
         

from dispel4py.workflow_graph import WorkflowGraph
streamProducer = SeismoSimpleFunctionPE(stream_producer)
stats1 = SeismoSimpleFunctionPE(readstats)
stats2 = SeismoSimpleFunctionPE(readstats)
stackp =SeismoSimpleFunctionPE(stackPlot,{'s_rate':4})

match_traces=MatchPE()
xcorrelation_traces= SeismoSimpleFunctionPE(xcorrelation, {'maxlag':1000})


pipeline = [
    #(decimate, {'sps':4}), 
    #detrend, 
    #demean, 
    #(filter, {'freqmin':0.01, 'freqmax':1., 'corners':4, 'zerophase':False}),
    #spectralwhitening,
    readstats]
preprocess_trace_1 = create_iterative_chain(pipeline,FunctionPE_class=SeismoSimpleFunctionPE)
preprocess_trace_2 = create_iterative_chain(pipeline,FunctionPE_class=SeismoSimpleFunctionPE)
graph = WorkflowGraph()
graph.connect(streamProducer, 'output', preprocess_trace_1, 'input')
graph.connect(streamProducer, 'output', preprocess_trace_2, 'input')
graph.connect(preprocess_trace_1, 'output', match_traces, 'input1')
graph.connect(preprocess_trace_2, 'output', match_traces, 'input2')
graph.connect(match_traces, 'output', xcorrelation_traces, 'input')
graph.connect(xcorrelation_traces, 'output', stackp, 'input')

InitiateNewRun(graph,ProvenanceRecorderToService,input={"url": "http://test.verce.eu/stations", "mime-type": "application/xml", "name": "stations"},username="aspinuso",workflowId="173",description="test22",system_id="xxxx",workflowName="postprocessing",runId="dispel4py_training004",w3c_prov=False)

#from dispel4py.visualisation import display



#from dispel4py import simple_process
#input_data = [ {'input' : sta1 },{'input' : sta2 }]
#simple_process.process(graph, input_data)