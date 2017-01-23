from verce.processing import *

import socket
import traceback
 



import json

class globusTransferPE(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        
        source = self.parameters["source"]
        target = self.parameters["target"]
        options = self.parameters["options"]
        
        
        stdoutdata, stderrdata = commandChain([["{}".format(
                                                    "globus-url-copy "+options+" "+source+" "+target
                                                    )]],os.environ.copy())
        
        self.error+=str(stderrdata)
        print (str(self.error))
        
                

        


if __name__ == "__main__":
    proc=globusTransferPE("globusTransfer")
    proc.process();



