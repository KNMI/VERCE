import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid
import copy

' Test command line usage: python genimporter_solver.py <modulename> <quakeml> <station> <user_conf>'
' scriptpath1="./resources/"+sys.argv[1]+".py '

from specfemGlobeMesher import *
import os
import sys
import shutil


class GLobeGeneralImporter():
    def __init__(self, args):

        self.input = args

    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'

    def runit(self):
        inputgen = json.load(open(self.input[1]))
        solver_conf = self.input[2]
        mpi_invoker = self.input[3]
        '1- Data dict'

        data = {};

        '2- System dict'

        verce = {}
        verce.update({"inputrootpath": "./"});
        verce.update({"outputdest": "./"});
        verce.update({"username": inputgen["metadata"]["username"]});
        verce.update({"runId": inputgen["metadata"]["runId"]});
        verce.update({"outputid": str(uuid.uuid1())});
        runid = inputgen["metadata"]["runId"]


        ' 3- Params dict'
        parameters = {"mpi_invoke": mpi_invoker, "solver_conf_file": solver_conf};
        confdict = json.load(open(solver_conf))
        fields = confdict["fields"]

        for x in fields:
            parameters.update({x["name"]: x["value"]})

        ' Instantiate the PE and run it'

        'merges streams'

        input_streams = []
        input_streams.append(inputgen["streams"][0])
        data = {"streams": input_streams};

        proc = specfemGlobeMesher(name='specfemGlobeMesher', input=data, params=parameters, vercejson=verce,
                                  stdoutredirect=False, caller=self, mapping="mpi");
        output_gen = proc.process()

        output_gen["streams"].append(inputgen["streams"][0])
        file = open("jsonout_mesher", "wb")
        file.write(json.dumps(copy.deepcopy(output_gen)))
        filep = open("provout_mesher-" + runid + "_0", "wb")
        filep.write(json.dumps(output_gen["metadata"]))
        filep.flush()
        shutil.copy("provout_mesher-" + runid + "_0", os.environ["PROV_PATH"] + "/")


if __name__ == "__main__":
    proc = GLobeGeneralImporter(sys.argv)
    proc.runit()