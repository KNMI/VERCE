import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid
import shutil
' Test command line usage: python genimporter_solver.py <modulename> <quakeml> <station> <user_conf>'
' scriptpath1="./resources/"+sys.argv[1]+".py '

from specfemGlobeCompiler import *

class GeneralImporter():
    def __init__(self, args):

        self.input = args

    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'

    def runit(self):
        jsonout = json.load(open(self.input[1]))
        par_file = self.input[2]
        cmt_solution = self.input[3]
        stations = self.input[4]
        compiler=self.input[5]
        if compiler=="GNU":
            configure="./configure FC=gfortran CC=gcc MPIFC=mpif90"
        if compiler=="Intel":
            configure="./configure FC=ifort CC=icc CXX=icpc MPIFC=mpiifort"
        '1- Data dict'

        ' The last item produced by the inputGenerator PE contains the location of the needed input files. '

        data = {"streams": [jsonout["streams"][len(jsonout["streams"]) - 1]]};

        '2- System dict'

        verce = {}
        verce.update({"inputrootpath": "./"});
        verce.update({"outputdest": "./"});
        verce.update({"username": jsonout["metadata"]["username"]});
        verce.update({"runId": jsonout["metadata"]["runId"]});
        verce.update({"outputid": str(uuid.uuid1())});

        parameters = {"par_file":par_file, "cmt_solution":cmt_solution,"stations": stations, "configure" : configure };

        # Configuring and compiling specfem source code using Intel ifort compiler
        proc = specfemGlobeCompiler(name='specfemGlobeCompiler', input=data, params=parameters, vercejson=verce, stdoutredirect=False, caller=self);
        outputcom = proc.process()


        provenancebulk = []
        provenancebulk.append(outputcom["metadata"])

        #print json.dumps(provenancebulk)
        file = open("provout_compile-" + verce["runId"], "wb")
        file.write(json.dumps(provenancebulk))
        file.flush()
        shutil.copy("provout_compile-" + verce["runId"], os.environ["PROV_PATH"] + "/")


if __name__ == "__main__":
    proc = GeneralImporter(sys.argv)
    proc.runit()