import pprint
import pickle
import socket
import exceptions
import time
import uuid
import numpy as np
import threading
import os
import sys
import cStringIO
import io
import base64
import traceback
import gc
import json
import obspy
import datetime
from obspy.core import read,UTCDateTime,Stream,Trace
import multiprocessing  
import copy
from subprocess import *
from time import gmtime, strftime
from array import array 
#from prov.model import ProvDocument, Namespace, Literal, PROV, Identifier



def sampleWorker(input,pip,queue):
    pip[0].input=copy.deepcopy(input)
    exec("output=pip[0].process()") 
    pip[1].input=copy.deepcopy(output)
    exec("output=pip[1].process()")
    
    queue.put([output,[output["metadata"]]])
    queue.close()
    

def commandChain(commands,envhpc,queue=None):
         
         
        for cmd in commands:
            print cmd
            process = Popen(cmd, stdout=PIPE,stderr=PIPE,env=envhpc,shell=True) 
            stdoutdata, stderrdata=process.communicate()
             
             
        if queue!=None:
            queue.put([stdoutdata,stderrdata])
            queue.close()    
        else:
            return stdoutdata, stderrdata



def launchPipelines(inputs,pipelines):
    output = None
    bulkprov= []
    jobs =[]
    queues = []
    result_queue = multiprocessing.Queue()
    #pool = multiprocessing.Pool(processes=8)
    for pip in pipelines:
        
        p = multiprocessing.Process(target=pipelineWorker, args=(inputs.pop(0),pip,result_queue))
     #   pool.apply_async(pipelineWorker,(inputs.pop(0),pip,result_queue))
        jobs.append(p)
     #  queues.append(result_queue)
        print p
         
    
    for j in jobs:
        j.start()
        
    results=[]   
   
    for pip in pipelines:
        results.append(result_queue.get())
    
    for j in jobs:
        j.join()
        
        
    return results

def pipelineWorker(input,PEs,queue):
    output = None
    data=input
    bulkprov= []
    for pe in PEs:
        
        pe.input=data
        output=pe.process()
        bulkprov.append(output["metadata"])
      
        data=output
         
    
    queue.put([output,bulkprov])
    queue.close()
     
def num(s):
    try:
        return int(s)
    except exceptions.ValueError:
        return float(s)

class SeismoPreprocessingActivity(object):

    """
    Initiates class' properties by reading them from the hashmap map previously populated by the workflow engine
    """
    
    def __init__ (self,name="SeismoActivity",input=None,vercejson=None,params=None,stdoutredirect=True,caller=None,provon=True,iterationIndex=None,runId=None, username=None,iterationId=None, instanceId=None,mapping="simple"):
        
        try:
            self.mapping=mapping
            self.iterationIndex=0
            self.name=name
            self.metadata={};
            self.w3c_prov={};
            self._={};
            self.annotations={};
            self.stateful=False;
            self.inMetaStreams=None
            
            self.provon=provon;
            
            if provon!=False:
                if iterationId is None:
                    self.iterationId = name+self.__getUniqueId()
                if instanceId is None:
                    self.instanceId = 'Invoker-instance-'+socket.gethostname()
                 
                #self.iterationIndex=iterationIndex
                self.runId=vercejson["runId"]
                self.username=vercejson["username"]
 
            self.outputstreams=list();
            self.outputstreamsbulk=list();
            self.output=list()
            self.streams=list();
            self.derivationIds=list()
            self.streamItemsLocations={}
            self.streamItemsFormat={}
            self.streamItemsMeta={}
            self.streamItemsControl={}
            self.streamItemsAnnotations={}
            self.streamItemsPorts={}
            self.caller=caller;
            ' list of joinable subprocess '
            self.processes=[]
            
            
            self.error="";
            
            
            if name!=None:
                self.name=name;
         
            
            
            """
             Read the system-parameters JSON
            """
            
            if vercejson!=None:
                self.verce=vercejson
            elif stdoutredirect and len(sys.argv) >= 2:
                self.verce=json.loads(sys.argv[1])
            else:
                self.verce={}
            
            
            """ 
            Reads the user-parameters JSON
            
            """
            if params!=None:
                self.parameters=params;
            elif stdoutredirect and len(sys.argv) >= 3:
                self.parameters=json.loads(sys.argv[2])
            else:
                self.parameters={}
                
            """ 
            Read the input JSON
            
            """
             
            if stdoutredirect:
                 
                try:
                    self.input = json.loads(sys.stdin.readline().strip()) 
                except Exception, err:
                    self.input = input;
            else:
                self.input = input;
                
            self.stdoutredirect=stdoutredirect;
             
            self.outputdest=self.verce["outputdest"]
            self.rootpath=self.verce["inputrootpath"];
            self.outputid=self.verce["outputid"];
            
             
            if self.rootpath==None:
                self.rootpath="None"
            
            if self.outputdest==None:
                self.outputdest="None"
            
            
            
            
            
        except Exception, err:
                 
                self.error="";
                self.error+= self.name+" Initialisation  Error: "+traceback.format_exc();
#                sys.stderr.write('ERROR: '+ self.name+' Initialisation  Error: %s\n' % str(err))
                 
                traceback.print_exc(file=sys.stderr)    
    
    def __toW3Cprov_api(self):
        
        g = ProvDocument()
        ve = Namespace('ve', "http://verce.eu")
        g.add_namespace("ve", "http://verce.eu")
        g.agent('_ag:'+self.username, {'prov:type': PROV["Person"]})
        g.activity('_ac:'+self.iterationId, startTime=str(self.startTime), endTime=str(self.endTime), other_attributes={
                                  've:iterationIndex':self.iterationIndex,
                                  've:instanceId':self.instanceId,
                                  've:stateful':self.stateful,
                                  've:site':socket.gethostname(),
                                  've:errors':self.error[:500],
                                  've:pid':'%s' % (os.getpid()),
                                  've:parameters':str(self.parameters),
                                  've:name':self.name,
                                  've:type':'lineage'}
                                   )
        
        for x in self.metadata["streams"]:
            i=0
            print x
            g.entity('_e:'+x["id"],other_attributes={
                                              "ve:annotations": str(x["annotations"]),
                                              "ve:location": str(x["location"]),
                                              "ve:format": str(x["format"])}
                                             )
            g.wasGeneratedBy("_:wgb-"+self.iterationId+str(i),'_e:'+x["id"],self.endTime)
            i=i+1
            
                                             
         
        return json.loads(g.serialize())
    
    def __toW3Cprov(self):
        W3CDic={}
        W3CDic.update({"prefix": {
                                    "ve": "http://verce.eu",
                                    "prov":"http://w3c-prov.org"
                                  }
                       })
        W3CDic.update({"agent":{self.username:{}}})
        
        W3CDic.update({"activity":{self.iterationId:{
                                  've:iterationIndex':self.iterationIndex,
                                  've:instanceId':self.instanceId,
                                  've:annotations':self.dicToKeyVal(self.annotations,True),
                                  've:stateful':self.stateful,
                                  've:site':socket.gethostname(),
                                  've:parameters':self.dicToKeyVal(self.parameters),
                                  've:errors':self.error[:500],
                                  've:pid':'%s' % (os.getpid()),
                                  've:name':self.name,
                                  'prov:startTime':str(self.startTime),
                                  'prov:endTime':str(self.endTime),
                                  've:type':'lineage'}
                                   }})
        
        W3CDic.update({"entity":{}})
        W3CDic.update({"wasGeneratedBy":{}})
        i=0
        
        for x in self.metadata["streams"]:
            i=0
            W3CDic["entity"].update({x["id"]:{"ve:content":x["content"]}})
            W3CDic["entity"][x["id"]].update({
                                              "ve:annotations": x["annotations"],
                                              "ve:location": x["location"],
                                              "ve:format": x["format"]}
                                             )
            W3CDic["wasGeneratedBy"].update({"_:wgb-"+self.iterationId+x["id"]:{"prov:entity":x["id"],
                                                                   "prov:activity": self.iterationId}})
            
        
        
        W3CDic.update({"wasDerivedFrom":{}})
        
        i=0
        for d in self.derivationIds:
            W3CDic["wasDerivedFrom"].update({"_:wdf-"+self.iterationId :{"prov:entity":x["id"],
                                                                            "prov:activity": self.iterationId}}) 
                
        W3CDic.update({"wasAssociatedWith":{}})
            
        
        return W3CDic
    
    def __getUniqueId(self):
        return socket.gethostname()+"-"+str(os.getpid())+"-"+str(uuid.uuid1())
        
    """
    Imports Input metadata if available, the metadata will be available in the self.inMetaStreams property as a Dictiinary"
    
    """
    def __importInputMetadata(self):
        try:
            
            self.inMetaStreams=self.input["metadata"]["streams"];
             
        except Exception,err:
            None
            
    """ 
    TBD: Produces a bulk output with data,location,format,metadata: to be used in exclusion of
    self.streamItemsLocations 
    self.streamItemsFormat
    self.outputstreams
    
    """
    def addOutput(self,data, location="", format="", metadata={},control={}):
        
        self.outputstreams.append(data)
        self.streamItemsLocations[str(id(data))]=location
        self.streamItemsFormat[str(id(data))]=format
        self.streamItemsMeta[str(id(data))]=metadata
        self.streamItemsControl[str(id(data))]=control
    """ 
    Reads and formats the steream's metadata
    
    """
    def __getMetadataWrapper(self):
        try:
            
             
            if (len(self.outputstreams)==0):
                self.outputstreams=self.streams
            
            if self.provon!=False:
                self.metadata.update({"streams":self.getMetadata()})
            
            
            
        except Exception, err:
                streamlist=list()
                streamItem={}
                streammeta=list()
                streamItem.update({"content": streammeta})
                streamItem.update({"id":self.__getUniqueId()});
                streamlist.append(streamItem)
                self.metadata.update({"streams":streamlist});
                self.error+=self.name+" Metadata extraction  Error: "+str(err);
#                sys.stderr.write('ERROR: '+ self.name+' Metadata extraction  Error: %s\n' % str(err))
#                traceback.print_exc(file=sys.stderr)
    
    def extractItemMetadata(self,st):
        try:
            streammeta=list()
            for tr in st:
                    metadic={}
                    metadic.update({"id":str(uuid.uuid1())});    
                            
                    for attr, value in tr.stats.__dict__.iteritems():
                        if attr=="mseed":
                            mseed={}
                            for a,v in value.__dict__.iteritems():
                                try:
                                    if type(v)==obspy.core.utcdatetime.UTCDateTime:
                                        mseed.update({a:str(v)});
                                    else:
                                        mseed.update({a:float(v)});
                                except Exception,e:
                                   mseed.update({a:str(v)});
                            
                            metadic.update({"mseed":mseed});
                        
                        else:
                            try:
                                 
                                if type(value)==obspy.core.utcdatetime.UTCDateTime:
                                    metadic.update({attr:str(value)});
                                else:
                                    metadic.update({attr:float(value)});
                                    
                            except Exception,e:
                                 
                                metadic.update({attr:str(value)});
                        
                     
                    
                    streammeta.append(metadic);
            
        except Exception, err:
            streammeta=str(st);
             
        
        return streammeta            
             
    def getMetadata(self):
        
        streamlist=list()
        i=0               
        for st in self.outputstreams:
            
            streamItem={}
            streammeta={}
            
#            try:
#                if len(st)>0:
            try:
                if (len(self.streamItemsMeta[str(id(st))].keys())!=0):
                    streammeta=self.streamItemsMeta[str(id(st))]
                else:
                    streammeta=self.extractItemMetadata(st);
            except Exception, err:
                traceback.print_exc(file=sys.stderr) 
                streammeta=self.extractItemMetadata(st);
            
            
                

            if type(streammeta) != list:
                streamItem.update({"content": [streammeta]})
            else:
                streamItem.update({"content": streammeta})
#            except Exception, err:
#                streammeta=str(st)
             
           
            streamItem.update({"id":self.__getUniqueId()});
            streamItem.update({"format":""})
            streamItem.update({"location":""})
            streamItem.update({"annotations":[]})
             
            if (len(self.streamItemsPorts)!=0):
                streamItem.update({"port": self.streamItemsPorts.pop(0)})
        
            if (self.streamItemsControl!={}):
                streamItem.update(self.streamItemsControl[str(id(st))])
            if (self.streamItemsLocations!={}):
                streamItem.update({"location": self.streamItemsLocations[str(id(st))]})
            if (self.streamItemsFormat!={}):
                streamItem.update({"format": self.streamItemsFormat[str(id(st))]})
            if (self.streamItemsAnnotations!={}):
                streamItem.update({"annotations": self.dicToKeyVal(self.streamItemsAnnotations[str(id(st))],True)})
            streamlist.append(streamItem)
            
        return streamlist
            
                        
    
    def buildDerivation(self,data):
        try:
            derivation={'DerivedFromDatasetID':data['id'],'TriggeredByProcessIterationID':data['TriggeredByProcessIterationID']}
             
            self.derivationIds.append(derivation)
          
        except Exception, err:
            if self.provon!=False:
                self.error+= "Build Derivation  Error:"+str(err);
            
    """
    Read the input data from an base64 encoded seed stream, if fails passes the data to the user that will take care of decoding accordingly to the expected input

    """
    
    
    
    
    def importInputData(self):

        try:
             
            i=0
            self.streams=list();
             
            while (self.input["streams"]):
                streamItem=self.input["streams"].pop(0);
                data=None
                
                if "data" not in streamItem:
                    continue
                
                try:
                     
                    if self.stdoutredirect==True:
                        data=read(cStringIO.StringIO(base64.b64decode(streamItem["data"]))) 
                    else:
                        data=pickle.loads(streamItem["data"])
                    
                     
                except Exception, err:
                    data=streamItem["data"];
                finally:
                    
                    self.streams.append(data)
                
                if self.provon!=False:
                    self.buildDerivation(streamItem)
                    
                    
                     
                 
                 
                    
                
                 
        except Exception, err:
                self.output="";
        
                self.error+= "Reading Input Error:"+str(err);
#                sys.stderr.write('ERROR: '+ self.name+' Reading Input Error: %s\n' % str(err))
                
                traceback.print_exc(file=sys.stderr)    
                 
                
        
    """
    Performs the actual analysis

    """
    def __computewrapper(self):
        
        try:
            
             
            if len(self.streams)==1:
                self.st=self.streams[0];
            
             
            self.startTime=datetime.datetime.utcnow()
            try:
                self.compute()
                
                
                
                'checks if there are subprocesses still running and joins them'
                
                
                        
                
                    
                    
                        
            except Exception, err:
                traceback.print_exc(file=sys.stderr)
                self.error+=" Compute Error: %s\n" % traceback.format_exc()
   
            self.endTime=datetime.datetime.utcnow()
            
            
            
            
        except Exception, err:
            self.error+=" Compute Wrapper Error: %s\n" % traceback.format_exc()
#            sys.stderr.write(self.name+" Compute Wrapper Error: %s\n" % str(err))
            traceback.print_exc(file=sys.stderr)
            
        finally:
            self.__getMetadataWrapper()
            
        
             
    
    def compute(self):
        try:
 
            output=None;
        
        except Exception, err:
            self.error+=self.name+" Computation Failed: "+str(err);
                
            sys.stderr.write(self.name+" Computation Failed: %s\n" % str(err))
            
        
        return output
            
    
    """
    Controls all the different phases of the execution of the script

    """
    def process (self):
        try:
            
            self.iterationIndex += 1
            self.importInputData()
            self.__importInputMetadata()
            
            self.__computewrapper()
            self.__writeOutputwrapper();
            return self.packageAll();
            
        except Exception, err:
            self.__getMetadataWrapper()
            
            output={"class":"eu.admire.seismo.metadata.Verce","streams":[{"data":None}],"metadata":self.metadata,"error":self.error,"pid":"%s" % (os.getpid(),)}

#            sys.stderr.write(self.name+" pid= %s" % (os.getpid(),)+" : metadata: "+json.dumps(self.metadata)+"\n")
            
            if self.stdoutredirect==True:
                sys.stdout.write(json.dumps(output)+"\n");
                sys.stdout.flush();
                sys.stdout.close();
                
            return self.packageAll();
             
        
    """
    Writes the output results in memory
    
    """
    def __writeOutputwrapper(self):
        try:
            
            self.writeOutput()
        
        except Exception, err:
                 
                self.error+=self.name+" Writing output Error: "+str(err);
                sys.stderr.write('ERROR: '+self.name+' Writing output Error: '+str(err))
#                self.map.put("output","");
                traceback.print_exc(file=sys.stderr)
                raise
    
    def writeOutput(self):
        try:
            self.memory_file = cStringIO.StringIO(); 
#            if (self.st!=None):    
#                for tr in self.st:
#                    tr.data=np.int32(tr.data);
            i=0
            for st in self.outputstreams:
                
                self.streamtransfer={}
                if self.provon!=False:
                    self.streamtransfer={"data":pickle.dumps(st),"id":self.metadata["streams"][i]["id"],"TriggeredByProcessIterationID":self.iterationId}
                else:
                    self.streamtransfer={"data":pickle.dumps(st)}

                
                self.output.append(self.streamtransfer);

                i=i+1
            
             
            
        except Exception, err:
                 
                self.error+=self.name+" Writing output Error: "+str(err);
                sys.stderr.write('ERROR: '+self.name+' Writing output Error: '+str(err))
#                self.map.put("output","");
                traceback.print_exc(file=sys.stderr)    
                raise
                
                
    def dicToKeyVal(self,dict,valueToString=False):
        try:
            alist=list()
            for k, v in dict.iteritems():
                adic={}
                adic.update({"key":str(k)})
                if valueToString:
                    adic.update({"val":str(v)})
                else:
                     
                    try: 
                        v =num(v)
                        adic.update({"val":v})
                    except Exception,e:
                        adic.update({"val":str(v)})
                        
                    
                    
                alist.append(adic)
        
            return alist
        except Exception, err:
                 
                self.error+=self.name+" dicToKeyVal output Error: "+str(err);
                sys.stderr.write('ERROR: '+self.name+' dicToKeyVal output Error: '+str(err))
#                self.map.put("output","");
                traceback.print_exc(file=sys.stderr)    
                 
    """
    Packages everything into the JSON. Its content will be handed over to the workflow engine after the script execution terminates.

    """
    def packageAll(self):
        
        try:
            if self.provon!=False:
                self.metadata.update({'actedOnBehalfOf': self.name})
                self.metadata.update({'_id':self.iterationId})
                self.metadata.update({'worker': socket.gethostname()})
                self.metadata.update({'iterationIndex':self.iterationIndex})
                self.metadata.update({'iterationId':self.iterationId})
                self.metadata.update({'instanceId':self.name+"-Instance-"+socket.gethostname()+self.__getUniqueId()})
                self.metadata.update({'annotations':self.dicToKeyVal(self.annotations,True)})
                self.metadata.update({'stateful':self.stateful})
                self.metadata.update({'site':str("")})
                self.metadata.update({'parameters':self.dicToKeyVal(self.parameters)})
                self.metadata.update({'errors':self.error[:500]})
                self.metadata.update({'pid':'%s' % (os.getpid())})
                self.metadata.update({'derivationIds':self.derivationIds})
                self.metadata.update({'name':self.name})
                self.metadata.update({'runId':self.runId})
                self.metadata.update({'username':self.username})
                self.metadata.update({'startTime':str(self.startTime)})
                self.metadata.update({'endTime':str(self.endTime)})
                self.metadata.update({'mapping': self.mapping})
                self.metadata.update({'type':'lineage'})
                
                #if self.provon=="W3C":
                #    self.w3c_prov=self.__toW3Cprov_api()
            
            
            output={"class":"eu.admire.seismo.metadata.Verce","streams": self.output,"metadata":self.metadata,"error":self.error[:500],"pid":"%s" % (os.getpid(),)}
             
            if self.stdoutredirect==True:
                sys.stdout.write(json.dumps(output));
                sys.stdout.flush();
                sys.stdout.close();
                
            return output;
             
             
            
        except Exception, err:
                
            self.error+=" Packaging Error: "+str(err)+"\n" ;
#            sys.stderr.write('ERROR: '+self.name+' Packaging output Error: '+str(err))
#            traceback.print_exc(file=sys.stderr)
            raise
    
    def joinChains(self):
     #   print "NUM process a="+str(len(self.processes))
     #   print "joining...."
        if len(self.processes)>0:
            
            
            for p,q in self.processes:
                stdoutdata, stderrdata = q.get()
      #          print "READ process ="+str(p)
                self.error+=stderrdata
            
            self.processes=[]
      #      print "NUM process b="+str(len(self.processes))
        
                
        
    def launchParallelCommandsChain(self,arguments):
        queue = multiprocessing.Queue()
        arguments.append(queue)
        p = multiprocessing.Process(target=commandChain, args=tuple(arguments))
        self.processes.append((p,queue))
        p.start()
        print p
        
     #  
