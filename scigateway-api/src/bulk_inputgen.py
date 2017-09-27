import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid

' Test command line usage: python bulk_inputgen.py <quakeml> <station> <user_conf>'
' scriptpath1="./resources/"+sys.argv[1]+".py '

from wfs_input_generator import InputFileGenerator


class GeneralImporter():
    def __init__(self, args):
        self.input = args

    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'

    def runit(self):
        solver_conf = self.input[1]

        userconf = json.load(open(solver_conf))
        gen = InputFileGenerator()

        fields = userconf["fields"]

        for x in fields:
            gen.add_configuration({x["name"]: self.strToBool(x["value"])})

        outputdir = "DATA"
        output_files = gen.write(format="SPECFEM3D_CARTESIAN_202_DEV", output_dir=outputdir)

    def strToBool(self, value):
        if value == "true":
            return True
        if value == "false":
            return False
        return value

if __name__ == "__main__":
    proc = GeneralImporter(sys.argv)
    proc.runit()