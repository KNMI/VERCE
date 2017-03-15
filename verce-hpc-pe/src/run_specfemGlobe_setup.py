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

from specfemGlobeDirectorySetup import *

class GeneralImporter():
    def __init__(self, args):

        self.input = args

    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'

    def runit(self):
        jsonout = json.load(open(self.input[1]))
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


        # setting up a directory structure in the working directory in preparation for the mesh and solver generation
        proc = specfemGlobeDirectorySetup(name='specfemGlobeDirectorySetup', input=data, params={}, vercejson=verce, stdoutredirect=False, caller=self);
        outputdir = proc.process()

        file = open("provout_directory_setup-" + verce["runId"], "wb")
        file.write(json.dumps(outputdir))
        file.flush()
        shutil.copy("provout_directory_setup-" + verce["runId"], os.environ["PROV_PATH"] + "/")


if __name__ == "__main__":
    proc = GeneralImporter(sys.argv)
    proc.runit()