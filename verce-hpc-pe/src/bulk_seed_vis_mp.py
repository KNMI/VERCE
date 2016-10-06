import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid
import copy

 

from specfem3d2stream import *;
from wavePlot_INGV import *;
from streamToSeedFile import *;
from dataTransferIRODS import *;


class GeneralImporter():


    
    def __init__(self,args):
         
        self.input=args
    
    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'
    
     
    
    def runit(self):
        vercefile = open(self.input[1])
        stationsfile = self.input[2]
        data = json.loads(vercefile.read())
        '1- Data dict' 
        
       
        try:
            path = pickle.loads(data["streams"][0]["data"])
        except Exception,e:
            path = data["streams"][1]["data"];
        ' path= "../OUTPUT_FILES/waveform" '
        
        '2- System dict'
        verce={}
        verce.update({"inputrootpath":"./"});
        verce.update({"outputdest":"./"});
        verce.update({"username":data["metadata"]["username"]});
        verce.update({"runId":data["metadata"]["runId"]});
        

        ' 3- Params dict'
        parameters={"stations_file":stationsfile}
        
        
        
        
        
        
        metadatabulk = []
        pipelines = []
        results =[]
        inputs=[]
        for  dir_entry in os.listdir(path):
            dir_entry_path = os.path.join(path, dir_entry)
            if os.path.isfile(dir_entry_path):
                verce.update({"outputid": str(uuid.uuid1())});
                print verce["outputid"]
                pipeline = []
                indata=copy.deepcopy(data)
                indata["streams"][0]["data"]=dir_entry_path
                inputs.append(indata)
                ' Instantiate the PEs'
                pipeline.append(specfem3d2stream(name='specfem3d2stream',input=None,params=parameters,vercejson=verce,stdoutredirect=False,caller=self))
                 
                parameters={'filedestination':"../OUTPUT_FILES/TRANSFORMED/PLOT/"}
                pipeline.append(WavePlot_INGV(name='wavePlot_INGV',input=None,params=parameters,vercejson=verce,stdoutredirect=False,caller=self))
                
                 
                parameters={'filedestination':"../OUTPUT_FILES/TRANSFORMED/SEED/"}
                pipeline.append(StreamToSeedFile(name='streamToSeedFile',input=None,params=parameters,vercejson=verce,stdoutredirect=False,caller=self))
                
                 
                
                pipelines.append(pipeline)
                 
                
               
        parameters={'filedestination':"../OUTPUT_FILES/TRANSFORMED/PLOT/"}
               
        results=launchPipelines(inputs,pipelines)
         
        for x in results:
            metadatabulk = metadatabulk + x[1]
                
        
          
        filep = open("provout_transformed","wr")
        filep.write(json.dumps(metadatabulk))
                
                
 
         
        
        
if __name__ == "__main__":     
    proc = GeneralImporter(sys.argv)
    proc.runit()
