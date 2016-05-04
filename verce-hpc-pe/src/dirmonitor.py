import os, time
import sys
from globusTransferPE import *

path_to_watch = sys.argv[1]
sourcebasepath = sys.argv[2]
targetbasepath = sys.argv[3]

before = dict ([(f, None) for f in os.listdir (path_to_watch)])
while 1:
  time.sleep (10)
  after = dict ([(f, None) for f in os.listdir (path_to_watch)])
  added = [f for f in after if not f in before]
  removed = [f for f in before if not f in after]
  if added: 
      print "Added: ", ", ".join (added)
      control={}
      control.update({"inputrootpath":"./"});
      control.update({"outputdest":"./"});
      control.update({"username":""});
      control.update({"runId":""});
      control.update({"outputid":str(uuid.uuid1())});
      for x in added:
          if x=="exitf":
              sys.exit()
              
          parameters={"source":sourcebasepath+path_to_watch+"/"+x,"target":targetbasepath+"/"+x,"options":"-cd -r"};
       
          proc = globusTransferPE(name='globusTransferPE',input={"streams":[]},params=parameters,vercejson=control,stdoutredirect=False,caller=None);
          print proc.process()
  if removed: print "Removed: ", ", ".join (removed)
  before = after



