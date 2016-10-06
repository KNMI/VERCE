from verce.processing import *

import socket
import traceback
 



import json

class specfemGenerateDatabase(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        stdoutdata=None
        stderrdata=None
        
        if self.parameters["mpi_invoke"]=='mpiexec':
            stdoutdata, stderrdata = commandChain([["{}".format(
                                                    self.parameters["mpi_invoke"]+' -n '+self.parameters["NPROC"]+" xgenerate_databases",
                                                    )]],os.environ.copy())
        else:    
            stdoutdata, stderrdata = commandChain([["{}".format(
                                                    self.parameters["mpi_invoke"]+" xgenerate_databases",
                                                    )]],os.environ.copy())
        
        self.addOutput(os.getcwd()+"/OUTPUT_FILES/output_mesher.txt",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/output_mesher.txt",format="text/plain",metadata={'file':'output_mesher.txt'},control={"con:immediateAccess":"true"})
        self.error+=str(stderrdata)
        

        


if __name__ == "__main__":
    proc=specfemGenerateDatabase("specfemGenerateDatabase")
    proc.process();



