import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid

' Test command line usage: python genimporter_solver.py <modulename> <quakeml> <station> <user_conf>'


from solverExecutor import *


class GeneralImporter():


    
    def __init__(self,args):
         
        self.input=args
    
    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'
    
     
    
    def runit(self):
         
        '1- Data dict' 
        
        data=json.load(open(self.input[1]));
         
        
        '2- System dict'
        verce={}
        verce.update({"inputrootpath":"./"});
        verce.update({"outputdest":"./"});
        verce.update({"outputid":"myimage.test"});
        verce.update({"username":data["metadata"]["username"]});
        verce.update({"runId":data["metadata"]["runId"]});

        ' 3- Params dict'
        parameters={};
      

        ' Instantiate the PE and run it'
        proc = solverExecutor(name='solverExecutor',input=data,params=parameters,vercejson=verce,stdoutredirect=False,caller=self);
        
        
        output2=proc.process();
        metadata = output2["metadata"]
        
        
        file = open("jsonout.jsn","wr")
        file.write(json.dumps(output2))
        print json.dumps(metadata)

 
         
        
        
if __name__ == "__main__":     
    proc = GeneralImporter(sys.argv)
    proc.runit()