from verce.processing import *

import socket
import traceback
 



import json

class specfemGenerateDatabase(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        stdoutdata=None
        stderrdata=None

        if self.parameters["mpi_invoke"] == 'mpiexec.hydra' or self.parameters["mpi_invoke"] == 'mpirun':
            stdoutdata, stderrdata = commandChain([["{}".format(
                                                    self.parameters["mpi_invoke"]+' -np '+str(self.parameters["NPROC"])+" xgenerate_databases",
                                                    )]],os.environ.copy())
        else:    
            stdoutdata, stderrdata = commandChain([["{}".format(
                                                    self.parameters["mpi_invoke"]+" xgenerate_databases",
                                                    )]],os.environ.copy())
        
        self.addOutput(os.getcwd()+"/OUTPUT_FILES/output_generate_databases.txt",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/output_generate_databases.txt",format="text/plain",metadata={'file':'output_generate_databases.txt'},control={"con:immediateAccess":"true"})
        self.error+=str(stderrdata)
        

        


if __name__ == "__main__":
    proc=specfemGenerateDatabase("specfemGenerateDatabase")
    proc.process();




