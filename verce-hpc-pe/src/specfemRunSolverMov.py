from verce.processing import *

import socket
import traceback
 



import json

class specfemRunSolverMov(SeismoPreprocessingActivity):
    
    
      
     
        
     def compute(self):
        
        
        stdoutdata=None
        stderrdata=None
        
        if self.parameters["mpi_invoke"]=='mpiexec':
        
            stdoutdata, stderrdata = commandChain([["{};{};{};{};{}".format(
                                                    self.parameters["mpi_invoke"]+' -n '+str(self.parameters["NPROC"])+" xspecfem3D",
                                                    "mkdir -p OUTPUT_FILES/waveform",
                                                    "mv OUTPUT_FILES/*.semv OUTPUT_FILES/waveform",
                                                    "mv OUTPUT_FILES/*.sema OUTPUT_FILES/waveform",
                                                    "mv OUTPUT_FILES/*.semd OUTPUT_FILES/waveform",
                                                    )]],os.environ.copy())
        
        else:
            stdoutdata, stderrdata = commandChain([["{};{};{};{};{}".format(
                                                    self.parameters["mpi_invoke"]+" xspecfem3D",
                                                    "mkdir -p OUTPUT_FILES/waveform",
                                                    "mv OUTPUT_FILES/*.semv OUTPUT_FILES/waveform",
                                                    "mv OUTPUT_FILES/*.sema OUTPUT_FILES/waveform",
                                                    "mv OUTPUT_FILES/*.semd OUTPUT_FILES/waveform",
                                                    )]],os.environ.copy())
        
        self.addOutput(os.getcwd()+"/OUTPUT_FILES/waveform/",metadata={'prov:type':'synthetic-waveform'},location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/waveform/",format="text/plain")
        self.addOutput(os.getcwd()+"/OUTPUT_FILES/output_solver.txt",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/output_solver.txt",format="text/plain",control={"con:immediateAccess":"true"},metadata={'file':'output_solver.txt'})
        
        self.error+=str(stderrdata)
       
        try:
             
          
          
            
            
            if self.parameters["SAVE_MESH_FILES"]=="true" or self.parameters["SAVE_MESH_FILES"]=="True" or self.parameters["SAVE_MESH_FILES"]==True:
                print "Packing mesh vtks"
                self.launchParallelCommandsChain([[["{};{}".format(
                                                    "tar czf OUTPUT_FILES/velocity-vtks.tar.gz OUTPUT_FILES/DATABASES_MPI/*.vtk",
                                                    "rm -rf OUTPUT_FILES/DATABASES_MPI/*.vtk"
                                                    )]],os.environ.copy()])
                self.addOutput(os.getcwd()+"/OUTPUT_FILES/velocity-vtks.tar.gz",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/velocity-vtks.tar.gz",format="application/octet-stream")
                
            
                
                 
            
            
            if self.parameters["MOVIE_SURFACE"]=="true" or self.parameters["MOVIE_SURFACE"]=="True" or self.parameters["MOVIE_SURFACE"]==True:
                print "Producing movie files and video"
                
                 
                self.launchParallelCommandsChain([[["{}".format(
                                                    "tar czf OUTPUT_FILES/movie-files.tar.gz OUTPUT_FILES/moviedata*"
                                                    )]],os.environ.copy()])
                self.launchParallelCommandsChain([[["{}".format(
                                                    "tar czf OUTPUT_FILES/time-files.tar.gz OUTPUT_FILES/timestamp*"
                                                    )]],os.environ.copy()])
                
                
                if self.parameters["mpi_invoke"]=='mpiexec':
                    self.launchParallelCommandsChain([[["{};{}".format(
                                                    self.parameters["mpi_invoke"]+' -n '+str(self.parameters["NPROC"])+" "+self.parameters["mpi_par_mov"]+" python $RUN_PATH/verce-hpc-pe/src/mpi/create_movie_snapshot_tuned.py --files=OUTPUT_FILES/moviedata0* --videoname="+self.runId+".mp4 --mag="+str(self.parameters["mag"])+" --dt="+str(self.parameters["DT"])+" --nstep="+str(self.parameters["NTSTEP_BETWEEN_FRAMES"])+" --ani --parallel",
                                                    "cp "+self.runId+".mp4 "+"OUTPUT_FILES/"
                                                    )]],os.environ.copy()])
                else:
                    self.launchParallelCommandsChain([[["{};{}".format(
                                                    self.parameters["mpi_invoke"]+" "+self.parameters["mpi_par_mov"]+" python $RUN_PATH/verce-hpc-pe/src/mpi/create_movie_snapshot_tuned.py --files=OUTPUT_FILES/moviedata0* --videoname="+self.runId+".mp4 --mag="+str(self.parameters["mag"])+" --dt="+str(self.parameters["DT"])+" --nstep="+str(self.parameters["NTSTEP_BETWEEN_FRAMES"])+" --ani --parallel",
                                                    "cp "+str(self.runId)+".mp4 "+"OUTPUT_FILES/"
                                                    )]],os.environ.copy()])
                                                    
                
                ' pre joins working processes until all chains are terminated '
                self.joinChains()
                
                ' compress image files and do cleanups '
                
                self.launchParallelCommandsChain([[["{}".format(
                                                    "rm -rf OUTPUT_FILES/moviedata*"
                                                    )]],os.environ.copy()])
                self.launchParallelCommandsChain([[["{}".format(
                                                    "rm -rf OUTPUT_FILES/timestamp*"
                                                    )]],os.environ.copy()])
                
                self.launchParallelCommandsChain([[["{};{}".format(
                                                    "tar czf OUTPUT_FILES/plt-moviedata.tar.gz OUTPUT_FILES/pltmoviedata*",
                                                    "rm -rf OUTPUT_FILES/pltmoviedata*")]],os.environ.copy()])
                
                self.joinChains()
                
                
                 
                 
                self.addOutput(os.getcwd()+"/OUTPUT_FILES/movie-files.tar.gz",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/movie-files.tar.gz",format="application/octet-stream")
                self.addOutput(os.getcwd()+"/OUTPUT_FILES/time-files.tar.gz",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/time-files.tar.gz",format="application/octet-stream",control={"con:immediateAccess":"true"})
                self.addOutput(os.getcwd()+"/OUTPUT_FILES/plt-moviedata.tar.gz",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/plt-moviedata.tar.gz",format="image/png")

                   
                if os.path.isfile(os.getcwd()+"/OUTPUT_FILES/"+self.runId+".mp4"):
                    
                    self.addOutput(os.getcwd()+"/OUTPUT_FILES/"+self.runId+".mp4",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/"+self.runId+".mp4",format="video/mpeg")

                     
                    
            if self.parameters["CREATE_SHAKEMAP"]=="true" or self.parameters["CREATE_SHAKEMAP"]=="True" or self.parameters["CREATE_SHAKEMAP"]==True:
                self.addOutput(os.getcwd()+"/OUTPUT_FILES/shakingdata",location="file://"+socket.gethostname()+"/"+os.getcwd()+"/OUTPUT_FILES/shakingdata",format="application/octet-stream")

                 
        except Exception,err:
            traceback.print_exc(file=sys.stderr)
        
         
                
        
        

        


if __name__ == "__main__":
    proc=specfemRunSolver("specfemRunSolver")
    proc.process();



