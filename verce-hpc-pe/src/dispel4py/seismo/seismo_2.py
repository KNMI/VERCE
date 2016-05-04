from dispel4py.provenance import *
from dispel4py.core import NAME, TYPE, GenericPE
import uuid
import traceback
from obspy.core import Trace,Stream
from dispel4py.base import SimpleFunctionPE

try:
    from obspy.core.utcdatetime import UTCDateTime
except ImportError:
    pass

class SeismoPE(ProvenancePE):
    
 
    
    def __init__(self,*args,**kwargs):
        ProvenancePE.__init__(self,*args,**kwargs)
        self.outputconnections[OUTPUT_DATA][TYPE] = ['timestamp', 'location', 'streams']

        
    def extractItemMetadata(self,st):
        try:
             
            streammeta=list()
            for tr in st:
                metadic={}
                metadic.update({"prov:type":"waveform"});    
                metadic.update({"id":str(uuid.uuid1())});    
                for attr, value in tr.stats.__dict__.iteritems():
                    if attr=="mseed":
                        mseed={}
                        for a,v in value.__dict__.iteritems():
                            try:
                                if type(v)==UTCDateTime:
                                    mseed.update({a:str(v)});
                                else:
                                    mseed.update({a:float(v)});
                            except Exception,e:
                                mseed.update({a:str(v)});
                        metadic.update({"mseed":mseed});
                    else:
                        try:
                            if type(value)==UTCDateTime:
                                metadic.update({attr:str(value)});
                            else:
                                metadic.update({attr:float(value)});
                        except Exception,e:
                            metadic.update({attr:str(value)});
                streammeta.append(metadic);
        except Exception, err:
            streammeta=str(st);
        return streammeta   
   
   
class SeismoSimpleFunctionPE(ProvenancePE):
    
 
    
    def __init__(self,*args,**kwargs):
        self.__class__ = type(str(self.__class__),(self.__class__,ProvenanceSimpleFunctionPE,SeismoPE),{})
        ProvenanceSimpleFunctionPE.__init__(self,*args,**kwargs)
        self.outputconnections[OUTPUT_DATA][TYPE] = ['timestamp', 'location', 'streams']     
     
