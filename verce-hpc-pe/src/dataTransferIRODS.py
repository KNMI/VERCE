from verce.processing import *

import socket
import traceback
 
from subprocess import *


import json

class dataTransferIRODS(SeismoPreprocessingActivity):
    
    
    
     
        
     def compute(self):
        
         
        sourceurl = self.inMetaStreams[0]["location"];
        target_base = self.parameters["target_base_url"]
        sourceurl=sourceurl.replace("file", self.parameters["source_protocol"])
        
        try:
            target_path=sourceurl[sourceurl.index(self.verce["runId"]):]
        except Exception,e:
            target_path=""
            
        targeturl = target_base+"/"+target_path
         
        stdoutdata, stderrdata = commandChain([["{};".format("globus-url-copy -cd "+sourceurl+" "+targeturl)]],os.environ.copy())
        
        self.streamItemsLocations.append(targeturl)
        self.streamItemsFormat.append(self.inMetaStreams[0]["format"])
        self.error+=str(stderrdata)
        

        


if __name__ == "__main__":
    proc=dataTransferIRODS("dataTransferIRODS")
    proc.process();



