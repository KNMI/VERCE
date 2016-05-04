from verce.processing import *

import socket
import traceback
 
from subprocess import *


import json

class decomposeMesh(SeismoPreprocessingActivity):
    
    
    
     
        
     def compute(self):
        
        userconf = json.load(open(self.parameters["solver_conf_file"]))
        
        
        ' A bug in specfem requires to include also CMTSOLUTIONS but '
        ' this might produce inconsistencies into the internal data dependencies'
        
        stdoutdata, stderrdata = commandChain([["{};{};{};{};{};{}".format(
                                                    "mkdir -p "+self.runId+"/DATA",
                                                    "mkdir -p "+self.runId+"/OUTPUT_FILES/DATABASES_MPI/",
                                                    "cp "+self.streams[0]+"/Par_file "+self.runId+"/DATA",
                                                    "cp "+self.streams[0]+"/CMTSOLUTION "+self.runId+"/DATA",
                                                    "cd "+str(self.runId),
                                                    "xdecompose_mesh "+str(self.parameters["nproc"])+" $WORK_SHARED/specfem/mesh_"+self.parameters["mesh"]+" OUTPUT_FILES/DATABASES_MPI/",
                                                    )]],os.environ.copy())
        
        self.addOutput(stdoutdata)
        self.error+=str(stderrdata)
        

        


if __name__ == "__main__":
    proc=decomposeMesh("decomposeMesh")
    proc.process();



