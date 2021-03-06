from verce.processing import *

import socket
import traceback

import json

class specfemGlobeCompiler(SeismoPreprocessingActivity):

     def compute(self):
        stdoutdata=None
        stderrdata=None
        stdoutdata, stderrdata = commandChain([["{};{};{};{};{};{};{};{};{};{};{};{}".format(
            "cd $RUN_PATH/specfem",
            "cp " + self.parameters["par_file"] + " DATA",
            "cp " + self.parameters["cmt_solution"] + " DATA",
            "cp " + self.parameters["stations"] + " DATA",
            self.parameters["configure"],
            "make clean",
            "make create_header_file",
            "./bin/xcreate_header_file",
            "make clean",
            "make meshfem3D",
            "make specfem3D",
            "make xcreate_movie_AVS_DX"
            )]], os.environ.copy())

        self.addOutput(os.getcwd() + "/OUTPUT_FILES/values_from_mesher.h",
                       location="file://" + socket.gethostname() + "/" + os.getcwd() + "/OUTPUT_FILES/values_from_mesher.h",
                       format="text/plain", metadata={'file': 'values_from_mesher.h'},
                       control={"con:immediateAccess": "true"})
        self.addOutput(stdoutdata)
        self.error += str(stderrdata)


if __name__ == "__main__":
    proc=specfemGlobeCompiler("specfemGlobeCompiler")
    proc.process();



