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

from specfemGlobeRunSolverMov import *
import os
import sys
import shutil
 

class GLobeGeneralImporter():


    
    def __init__(self,args):
         
        self.input=args
    
    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'
    
     
    
    def runit(self):
        inputgen = json.load(open(self.input[1]))
        output_mesher = json.load(open(self.input[2]))
        solver_conf = self.input[3]
        mpi_invoker = self.input[4]
        eventIndex=self.input[5]
        mpi_par_mov=""
        try:
            mpi_par_mov=self.input[6]
        except:
            None
        '1- Data dict'

        data={};

        '2- System dict'


        verce={}
        verce.update({"inputrootpath":"./"});
        verce.update({"outputdest":"./"});
        verce.update({"username":inputgen["metadata"]["username"]});
        verce.update({"runId":inputgen["metadata"]["runId"]});
        verce.update({"outputid":str(uuid.uuid1())});
        runid=inputgen["metadata"]["runId"]

        nproc=None

        ' 3- Params dict'
        parameters={"mpi_invoke":mpi_invoker,"solver_conf_file":solver_conf};
        confdict=json.load(open(solver_conf))
        fields = confdict["fields"]
        
        for x in fields:
            parameters.update({x["name"]:x["value"]})

        parameters.update({"DT": os.environ["DT"].lstrip()})
        parameters.update({"mesh":confdict["mesh"]})
        parameters.update({"velocity_model":confdict["velocity_model"]})

        ' Instantiate the PE and run it'

        print ("MOVIE_PARAMS_DDD: "+str(mpi_par_mov))
        
        parameters.update({'mag':inputgen["metadata"]["streams"][int(eventIndex)]["content"][0]["magnitude"],"mpi_par_mov":mpi_par_mov})
        proc = specfemGlobeRunSolverMov(name='specfemGlobeRunSolverMov',input=output_mesher,params=parameters,vercejson=verce,stdoutredirect=False,caller=self,mapping="mpi");
        outputspecfem=proc.process()
        #provenancebulk.append(outputspecfem["metadata"])
        
        file = open("jsonout_run_specfem","wb")
        file.write(json.dumps(outputspecfem))     
        #print json.dumps(provenancebulk)
        filep = open("provout_run_specfem-"+runid+"_"+str(eventIndex),"wb")
        filep.write(json.dumps(outputspecfem["metadata"]))
        filep.flush()
        shutil.copy("provout_run_specfem-"+runid+"_"+str(eventIndex), os.environ["PROV_PATH"]+"/")
       

         
        
        
        
         
 
         
        
        
if __name__ == "__main__":     
    proc = GLobeGeneralImporter(sys.argv)
    proc.runit()