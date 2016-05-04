from verce.processing import *

import socket
import traceback
 



import json

class specfemRunSolver(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        
        
        
        stdoutdata, stderrdata = commandChain([["{};{};{};{};{}".format(
                                                    self.parameters["mpi_invoke"]+" xspecfem3D",
                                                    "mkdir -p ../OUTPUT_FILES/waveform",
                                                    "mv ../OUTPUT_FILES/*.semv ../OUTPUT_FILES/waveform",
                                                    "mv ../OUTPUT_FILES/*.sema ../OUTPUT_FILES/waveform",
                                                    "mv ../OUTPUT_FILES/*.semd ../OUTPUT_FILES/waveform",
                                                    )]],os.environ.copy())
        self.outputstreams.append(os.getcwd()+"/../OUTPUT_FILES/waveform")
        self.streamItemsLocations.append("file://"+socket.gethostname()+"/"+os.getcwd()+"/../OUTPUT_FILES/waveform/")
        self.error+=str(stderrdata)
       
        try:
            userconf = json.load(open(self.parameters["solver_conf_file"]))
            fields = userconf["fields"]
            conf={}
            for x in fields:
                conf.update({x["name"]:x["value"]})
          
          
            
            if conf["SAVE_MESH_FILES"]=="true":
                stdoutdata, stderrdata = commandChain([["{}".format(
                                                    "tar -czPf ../OUTPUT_FILES/velocity-vtks.tar.gz ../OUTPUT_FILES/DATABASES_MPI/*.vtk"
                                                    )]],os.environ.copy())
            
                
                self.error+=str(stderrdata)
            
            if conf["MOVIE_SURFACE"]=="true" or conf["MOVIE_VOLUME"]=="true":
                stdoutdata, stderrdata = commandChain([["{};{}".format(
                                                    "tar -czPf ../OUTPUT_FILES/movie-files.tar.gz ../OUTPUT_FILES/moviedata*",
                                                    "tar -czPf ../OUTPUT_FILES/time-files.tar.gz ../OUTPUT_FILES/timestamp*"
                                                    
                                                    
                                                    )]],os.environ.copy())
            
                
                
                self.error+=str(stderrdata)
        except Exception,err:
            traceback.print_exc(file=sys.stderr)
                
        self.outputstreams.append(os.getcwd()+"/../OUTPUT_FILES/velocity-vtks.tar.gz")
        self.streamItemsLocations.append("file://"+socket.gethostname()+"/"+os.getcwd()+"/../OUTPUT_FILES/velocity-vtks.tar.gz")
        
        self.outputstreams.append(os.getcwd()+"/../OUTPUT_FILES/movie0*")
        self.outputstreams.append(os.getcwd()+"/../OUTPUT_FILES/time-files.tar.gz")
        self.streamItemsLocations.append("file://"+socket.gethostname()+"/"+os.getcwd()+"/../OUTPUT_FILES/movie-files.tar.gz")
        self.streamItemsLocations.append("file://"+socket.gethostname()+"/"+os.getcwd()+"/../OUTPUT_FILES/time-files.tar.gz")
     

        


if __name__ == "__main__":
    proc=specfemRunSolver("specfemRunSolver")
    proc.process();



