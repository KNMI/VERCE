from verce.processing import *

import socket
import traceback
 



import json

class specfemMakeMovieSurface(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        
        
    
        try:
            userconf = json.load(open(self.parameters["solver_conf_file"]))
            fields = userconf["fields"]
            conf={}
            for x in fields:
                conf.update({x["name"]:x["value"]})
          
          
            
                
            if conf["MOVIE_SURFACE"]=="true":
                stdoutdata, stderrdata = commandChain([["{}".format(
                                                    self.parameters["mpi_invoke"]+" python $RUN_PATH/verce-hpc-pe/src/mpi/create_movie_snapshot.py --files="+self.streams[2]+" --ext="+str(self.parameters["ext"])+" --ani --vmax="+str(self.parameters["vmax"])
                                                    
                                                    )]],os.environ.copy())
            
                self.outputstreams.append(os.getcwd()+"/../OUTPUT_FILES/simple_finalvideo.mp4")
                self.streamItemsLocations.append("file://"+socket.gethostname()+"/"+os.getcwd()+"/../OUTPUT_FILES/simple_finalvideo.mp4")
     
                self.error+=str(stderrdata)
        except Exception,err:
            traceback.print_exc(file=sys.stderr)
                
        

        


if __name__ == "__main__":
    proc=specfemMakeMovie("specfemMakeMovieSurface")
    proc.process();



