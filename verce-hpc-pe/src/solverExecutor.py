from verce.processing import *

import socket
import traceback
 
import subprocess


class solverExecutor(SeismoPreprocessingActivity):
    
     
    
    def compute(self):
        
        
        self.outputdest=None
        out=subprocess.check_output("./specfem_tst.sh",shell=True)
         
        
        return "true"
        
        

if __name__ == "__main__":
    proc=solverExecutor("solverExecutor Script")
    proc.process();



