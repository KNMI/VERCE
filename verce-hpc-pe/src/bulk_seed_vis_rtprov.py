import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid
import copy
import shutil

' Test command line usage: '
'export PROV_PATH=prov' 
'python bulk_seed_vis_rtprov.py ../test-resources/testfiles/jsonout_run_specfem ../test-resources/testfiles/stations 3'
 
'  sys.path.append(os.path.abspath(scriptpath1)) '

from specfem3d2stream import *;
from wavePlot_INGV import *;
from streamToSeedFile import *;
from kmlGenerator_INGV import *;

class GeneralImporter():


    
    def __init__(self,args):
         
        self.input=args
    
    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'
    
     
    def storeMeta(self,fn,meta):
         
        filep = open(fn,"wr")
        filep.write(json.dumps([meta]))
        filep.flush()
        shutil.move(fn,os.environ['PROV_PATH']+"/"+fn)
        
        
    def runit(self):
        vercefile = open(self.input[1])
        stationsfile = self.input[2]
        eventIndex = self.input[3]
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
        
        
        
        
        
        
        
        
        pipelines = []
        results =[]
        inputs=[]

        for  dir_entry in os.listdir(path):
            dir_entry_path = os.path.join(path, dir_entry)
            if os.path.isfile(dir_entry_path):
                metadatabulk = []
                head,tail =  os.path.split(dir_entry_path)
                
                indata= {"streams":[copy.deepcopy(data["streams"][0])]}
                indata["streams"][0]["data"]=dir_entry_path
                
                ' Instantiate the PE and run it'
                parameters={"stations_file":stationsfile}
                verce.update({"outputid": str(uuid.uuid1())});
                proc = specfem3d2stream(name='specfem3d2stream',input=indata,params=parameters,vercejson=verce,stdoutredirect=False,caller=self)
                output_specfem3d2stream=proc.process();
                 
                fn=tail+"_provout_specfem3d2stream_"+eventIndex
                self.storeMeta(fn,output_specfem3d2stream["metadata"])
                'output_toplot=copy.deepcopy(output_toseed)'
                
                parameters={'filedestination':"../OUTPUT_FILES/TRANSFORMED/PLOT/"}
                 
                proc = WavePlot_INGV(name='wavePlot_INGV',input=output_specfem3d2stream,params=parameters,vercejson=verce,stdoutredirect=False,caller=self)
                output_WavePlot_INGV=proc.process();
                 
                fn=tail+"_provout_wavePlot_INGV_"+eventIndex
                self.storeMeta(fn, output_WavePlot_INGV["metadata"])
                
                
               
                
                parameters={'filedestination':"../OUTPUT_FILES/TRANSFORMED/SEED/"}
               
                proc = StreamToSeedFile(name='streamToSeedFile',input=output_WavePlot_INGV,params=parameters,vercejson=verce,stdoutredirect=False,caller=self)
                output_StreamToSeedFile=proc.process();
                fn=tail+"_streamToSeedFile_"+eventIndex
                self.storeMeta(fn, output_StreamToSeedFile["metadata"])
                 
                
        
                file = open("jsonout_transformed.jsn","wr")
                file.write(json.dumps(output_StreamToSeedFile))
                
                
        
         
        
        parameters={'images_path':"../OUTPUT_FILES/TRANSFORMED/PLOT/","stations_filtered":path+"/../../DATA/STATIONS_FILTERED","cmt_solution":path+"/../../DATA/CMTSOLUTION","par_file":path+"/../../DATA/Par_file"}
        
        indata= {"streams":[copy.deepcopy(data["streams"][0])]}
        proc = kmlGenerator_INGV(name='kmlGenerator_INGV',input=indata,params=parameters,vercejson=verce,stdoutredirect=False,caller=self)
        output_kmlGenerator_INGV=proc.process();
        fn="kmlGenerator_INGV"+eventIndex
        self.storeMeta(fn, output_kmlGenerator_INGV["metadata"])
                
                
 
         
        
        
if __name__ == "__main__":     
    proc = GeneralImporter(sys.argv)
    proc.runit()