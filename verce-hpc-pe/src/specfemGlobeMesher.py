from verce.processing import *

import socket
import traceback
 



import json

class specfemGlobeMesher(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        stdoutdata=None
        stderrdata=None
        userconf = json.load(open(self.parameters["solver_conf_file"]))

        if self.parameters["mpi_invoke"] == 'mpiexec.hydra' or self.parameters["mpi_invoke"] == 'mpirun':
            stdoutdata, stderrdata = commandChain([["{}".format(
                self.parameters["mpi_invoke"] + ' -np ' + str(self.parameters["NPROC"]) + " ./bin/xmeshfem3D",
            )]], os.environ.copy())
        else:
            stdoutdata, stderrdata = commandChain([["{}".format(
                self.parameters["mpi_invoke"] + " ./bin/xmeshfem3D",
            )]], os.environ.copy())
        
        self.addOutput(os.getcwd()+"/OUTPUT_FILES/output_mesher.txt",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/output_mesher.txt",format="text/plain",metadata={'file':'output_mesher.txt'},control={"con:immediateAccess":"true"})
        self.error+=str(stderrdata)
        

        


if __name__ == "__main__":
    proc=specfemGlobeMesher("specfemGlobeMesher")
    proc.process();



