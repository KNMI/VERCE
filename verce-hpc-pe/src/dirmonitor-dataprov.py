import os, time
import sys
from globusTransferPE import *
from urlparse import urlsplit
import types
import uuid

def getUniqueId():
        return str(os.getpid())+"-"+str(uuid.uuid1())

path_to_watch = sys.argv[1]
prov_sourcebaseurl = sys.argv[2]
prov_targetbaseurl = sys.argv[3]
data_targetbaseurl = sys.argv[4]
pool = multiprocessing.Pool(processes=8)

before = dict ([(f, None) for f in os.listdir (path_to_watch)])
firstround=True
print "Starting watching dir: "+path_to_watch+" ..."
check=True
while check:
  time.sleep (5)
  after = dict ([(f, None) for f in os.listdir (path_to_watch)])
  #print "Before: ",",".join(before)
  #print "After: ",",".join(after)
  added = [f for f in after if not f in before]
  removed = [f for f in before if not f in after]
  rank=0
  bulkprov=[]
  if added or firstround: 
      if firstround:
          added=before
          firstround=False
      else:
          before = after
      print "Added: ", ", ".join (added)
      control={}
      control.update({"inputrootpath":"./"});
      control.update({"outputdest":"./"});
      control.update({"username":""});
      control.update({"runId":""});
      control.update({"outputid":str(uuid.uuid1())});
      ' loops on new files'
      
      pipelines=[]
      pipeline = []
      pipesize=0
      for x in added:
          
          if x=="exitf":
              print "exitf file found.. last update cycle.."
              check=False
              continue
          
              
              
          try:
              
              provjson=json.load(open(path_to_watch+'/'+x));
              provlist=list()
              if type(provjson) is list:
                  provlist=provjson
              else:
                  provlist.append(provjson)
#              
              ' enlarge bulk for multiple upload '
               
              bulkprov=bulkprov+provlist
#              
              'loops on provenance items'
              for prov in provlist:
                  'loops on datastreams'
                  inputs=[]
                  if 'streams' in prov:
                      for d in prov["streams"]:
                      
                          try:
                              transfer=False
                          
                              if "location" in d and "con:immediateAccess" in d and d["con:immediateAccess"]=="true" :
                                  transfer=True
                          
                              if transfer and type(d["location"])!=list and d["location"]!="":
                                  dataloc=d["location"]
                                  parameters={"source":dataloc,"target":data_targetbaseurl+"/"+urlsplit(dataloc)[2],"options":"-cd -r"};
                                  t=globusTransferPE(name='globusTransferPE',input={"streams":[]},params=parameters,vercejson=control,stdoutredirect=False,caller=None);
                                  t.process()
                              if transfer and type(d["location"])==list:
                                  dataloclist=d["location"]
                                  
                                  for dataloc in dataloclist:
                                      parameters={"source":dataloc,"target":data_targetbaseurl+"/"+urlsplit(dataloc)[2],"options":"-cd -r"};
                                      t=globusTransferPE(name='globusTransferPE',input={"streams":[]},params=parameters,vercejson=control,stdoutredirect=False,caller=None);
                                      t.process()

          
                          except Exception, err:
                              None
                              #traceback.print_exc()
              
              
              
               
              
          
          except Exception, err:
                print "Error on file:"+x
 #               traceback.print_exc()
  
  if len(bulkprov)>0:
      bt="bulk_transfer_"+getUniqueId()+".jsn"
      file = open(bt,"wr")
      file.write(json.dumps(bulkprov))
      file.flush()
      parameters={"source":bt,"target":prov_targetbaseurl+bt,"options":"-cd -r -v -c -fast -cc 4 -stall-timeout 30 "};
      proc = globusTransferPE(name='globusTransferPE',input={"streams":[]},params=parameters,vercejson=control,stdoutredirect=False,caller=None);
      
      proc.process()
      bulkprov=list()
                  
  if removed: print "Removed: ", ", ".join (removed)
  
  
  


'python dirmonitor-dataprov.py ../test/ gsiftp://gino gsiftp://pino gsiftp://alberto'