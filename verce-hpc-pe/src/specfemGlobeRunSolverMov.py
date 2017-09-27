from verce.processing import *

import socket
import traceback
import os

import json


class specfemGlobeRunSolverMov(SeismoPreprocessingActivity):
    def compute(self):

        stdoutdata = None
        stderrdata = None

        if self.parameters["mpi_invoke"] == 'mpiexec.hydra' or self.parameters["mpi_invoke"] == 'mpirun':

            stdoutdata, stderrdata = commandChain([["{};{};{}".format(
                self.parameters["mpi_invoke"] + ' -np ' + str(self.parameters["NPROC"]) + " ./bin/xspecfem3D",
                "mkdir -p OUTPUT_FILES/waveform",
                "mv OUTPUT_FILES/*.ascii OUTPUT_FILES/waveform"
            )]], os.environ.copy())

        else:
            stdoutdata, stderrdata = commandChain([["{};{};{}".format(
                self.parameters["mpi_invoke"] + " ./bin/xspecfem3D",
                "mkdir -p OUTPUT_FILES/waveform",
                "mv OUTPUT_FILES/*.ascii OUTPUT_FILES/waveform"
            )]], os.environ.copy())

        self.addOutput(os.getcwd() + "/OUTPUT_FILES/waveform/", metadata={'prov:type': 'synthetic-waveform'},
                       location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/waveform/",
                       format="text/plain")
        self.addOutput(os.getcwd() + "/OUTPUT_FILES/output_solver.txt",
                       location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/output_solver.txt",
                       format="text/plain", control={"con:immediateAccess": "true"},
                       metadata={'file': 'output_solver.txt'})

        self.error += str(stderrdata)

        try:

            if self.parameters["SAVE_MESH_FILES"] == "true" or self.parameters["SAVE_MESH_FILES"] == "True" or \
                            self.parameters["SAVE_MESH_FILES"] == True:
                print "Packing mesh vtks"
                self.launchParallelCommandsChain([[["{};{}".format(
                    "tar czf OUTPUT_FILES/velocity-vtks.tar.gz OUTPUT_FILES/DATABASES_MPI/*.vtk",
                    "rm -rf OUTPUT_FILES/DATABASES_MPI/*.vtk"
                )]], os.environ.copy()])
                self.addOutput(os.getcwd() + "/OUTPUT_FILES/velocity-vtks.tar.gz",
                               location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/velocity-vtks.tar.gz",
                               format="application/octet-stream")

            if self.parameters["MOVIE_SURFACE"] == "true" or self.parameters["MOVIE_SURFACE"] == "True" or \
                            self.parameters["MOVIE_SURFACE"] == True:
                print "Producing movie files and video"

                # generate gmt ascii files from moviedata then produce the movie file
                noOfFiles=len({name.split(".")[0] for name in os.listdir("OUTPUT_FILES") if "moviedata00" in name})
                first_time_step=self.parameters["NTSTEP_BETWEEN_FRAMES"]
                last_time_step=int(first_time_step) * noOfFiles
                self.create_gmt_ascii_files(first_time_step, str(last_time_step))

                if self.parameters["mpi_invoke"] == 'mpiexec.hydra' or self.parameters["mpi_invoke"] == 'mpirun':
                    self.launchParallelCommandsChain([[["{};{}".format(
                        self.parameters["mpi_invoke"] + " " + self.parameters["mpi_par_mov"] + " python $RUN_PATH/verce-hpc-pe/src/mpi/create_movie_snapshot_tuned_globe.py --filespath=OUTPUT_FILES --videoname=" + self.runId + ".mp4 --lat="
                        + str(self.parameters["CENTER_LATITUDE_IN_DEGREES"]) + " --lon=" + str(self.parameters["CENTER_LONGITUDE_IN_DEGREES"]) + " --eta=" + str(self.parameters["ANGULAR_WIDTH_ETA_IN_DEGREES"])
                        + " --xi=" + str(self.parameters["ANGULAR_WIDTH_XI_IN_DEGREES"]) + "  --mesh=" +str(self.parameters["mesh"]),
                        "cp " + str(self.runId) + ".mp4 " + "OUTPUT_FILES/")]], os.environ.copy()])



                ' pre joins working processes until all chains are terminated '
                self.joinChains()

                ' compress image files and do cleanups '


                self.launchParallelCommandsChain([[["{};{};{};{}".format(
                    "tar czf OUTPUT_FILES/movie-files.tar.gz OUTPUT_FILES/moviedata*",
                    "tar czf OUTPUT_FILES/time-files.tar.gz OUTPUT_FILES/timestamp*",
                    "tar czf OUTPUT_FILES/gmt-files.tar.gz OUTPUT_FILES/gmt_movie*.xyz",
                    "tar czf OUTPUT_FILES/plt-moviedata.tar.gz OUTPUT_FILES/gmt_movie*.png")]], os.environ.copy()])

                self.joinChains()

                self.launchParallelCommandsChain([[["{};{};{}".format(
                    "rm -rf OUTPUT_FILES/moviedata*",
                    "rm -rf OUTPUT_FILES/timestamp*",
                    "rm -rf OUTPUT_FILES/gmt_movie*"
                )]], os.environ.copy()])

                self.addOutput(os.getcwd() + "/OUTPUT_FILES/movie-files.tar.gz",
                               location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/movie-files.tar.gz",
                               format="application/octet-stream")
                self.addOutput(os.getcwd() + "/OUTPUT_FILES/time-files.tar.gz",
                               location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/time-files.tar.gz",
                               format="application/octet-stream", control={"con:immediateAccess": "true"})
                self.addOutput(os.getcwd() + "/OUTPUT_FILES/ascii-moviedata.tar.gz",
                               location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/ascii-moviedata.tar.gz",
                               format="application/octet-stream", control={"con:immediateAccess": "true"})
                self.addOutput(os.getcwd() + "/OUTPUT_FILES/plt-moviedata.tar.gz",
                               location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/plt-moviedata.tar.gz",
                               format="image/png")

                if os.path.isfile(os.getcwd() + "/OUTPUT_FILES/" + self.runId + ".mp4"):
                    self.addOutput(os.getcwd() + "/OUTPUT_FILES/" + self.runId + ".mp4",
                                   location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/" + self.runId + ".mp4",
                                   format="video/mpeg")




        except Exception, err:
            traceback.print_exc(file=sys.stderr)

    def create_gmt_ascii_files(self, first_time_step, last_time_step):
        # this is a default option value for creating files in GMT xyz ascii long/lat/U format
        gmt_ascii_input_value = '4'

        # 1=Z, 2= N and 3=E
        components = ['1', '2', '3']
        commands=[]
        for component in components:
            cmd = "echo \" %s  \n %s \n %s \n %s \" | ./bin/xcreate_movie_AVS_DX " % (gmt_ascii_input_value, first_time_step, last_time_step, component)
            commands.append(cmd)
            print cmd

        stdoutdata, stderrdata = commandChain(commands, os.environ.copy())
        self.error += str(stderrdata)

if __name__ == "__main__":
    proc = specfemGlobeRunSolverMov("specfemGlobeRunSolverMov")
    proc.process();