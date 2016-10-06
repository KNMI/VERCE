import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid

' Test command line usage: python genimporter_solver.py <modulename> <quakeml> <station> <user_conf>'
' scriptpath1="./resources/"+sys.argv[1]+".py '

from inputGenerator import * 

from decomposeMesh import * 

class GeneralImporter():


    
    def __init__(self,args):
         
        self.input=args
    
    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'
    
     
    
    def runit(self):
        jsonout = json.load(open(self.input[1]))
        solver_conf = self.input[2]
        '1- Data dict' 
        
        ' The last item produced by the inputGenerator PE contains the location of the needed input files. '
        
        data={"streams":[jsonout["streams"][len(jsonout["streams"])-1]]};
        
        '2- System dict'
        
        solver_conf_dic = json.load(open(solver_conf))
        verce={}
        verce.update({"inputrootpath":"./"});
        verce.update({"outputdest":"./"});
        verce.update({"username":jsonout["metadata"]["username"]});
        verce.update({"runId":jsonout["metadata"]["runId"]});
        verce.update({"outputid":str(uuid.uuid1())});
        
                 
        nproc=None

        ' 3- Params dict'
        for x in solver_conf_dic["fields"]:
            if x["name"]=="NPROC":
                 nproc=x["value"] 

        parameters={"solver_conf_file":solver_conf,"mesh":solver_conf_dic["mesh"],"nproc":nproc};
      

        ' Instantiate the PE and run it'
         
        
        proc = decomposeMesh(name='decomposeMesh',input=data,params=parameters,vercejson=verce,stdoutredirect=False,caller=self);
        outputdec=proc.process()
        
        provenancebulk=[]
        provenancebulk.append(outputdec["metadata"])
      
        print json.dumps(provenancebulk)        
        filep = open("provout_decompose","wb")
        filep.write(json.dumps(provenancebulk))
        file = open("jsonout_decompose","wb")
        file.write(json.dumps(outputdec))
         
        
        
        
         
 
         
        
        
if __name__ == "__main__":     
    proc = GeneralImporter(sys.argv)
    proc.runit()
