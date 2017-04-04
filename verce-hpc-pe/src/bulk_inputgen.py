import os
import sys
import json
from random import randint
import StringIO
import socket
import uuid

' Test command line usage: python bulk_inputgen.py <quakeml> <station> <user_conf>'
' scriptpath1="./resources/"+sys.argv[1]+".py '

from inputGenerator import * 


class GeneralImporter():


    
    def __init__(self,args):
         
        self.input=args
    
    ' Prepare the VERCE PE input '
    '1- data'
    'json_data = open("./test-resources/pyFileReadTest.in"); '
    'data = json.load(json_data)'
    
     
    
    def runit(self):
        quakeml = self.input[1]
        point_station_file = self.input[2]
        solver_conf = self.input[3]
        '1- Data dict' 
        
        data={};
        
        '2- System dict'
        
        solver_conf_dic = json.load(open(solver_conf))
        verce={}
        verce.update({"inputrootpath":"./"});
        verce.update({"outputdest":os.getcwd()+"/"});
        verce.update({"username":solver_conf_dic["user_name"]});
        verce.update({"runId":solver_conf_dic["runId"]});
        verce.update({"outputid":str(uuid.uuid1())});
        
        ' workflow = {}       ' 
        ' workflow.update({"username":solver_conf_dic["user_name"]}); '
        '  workflow.update({"_id":solver_conf_dic["runId"]}); '
        '  workflow.update({"description":solver_conf_dic["description"]}); '
        '  workflow.update({"name":"FwModelling"});'
        '  workflow.update({"type":"workflow_run"});       ' 
        
        
        ' 3- Params dict'
        parameters={"quakeml":quakeml,"stations_file":point_station_file,"solver_conf_file":solver_conf,"station_format":solver_conf_dic["station_format"]};
      

        ' Instantiate the PE and run it'
        proc = inputGenerator(name='inputGenerator',input=data,params=parameters,vercejson=verce,stdoutredirect=False,caller=self);
        output=proc.process()
        
        
        provenancebulk=[]
        provenancebulk.append(output["metadata"])
          
                 
                
        print json.dumps(provenancebulk)
        filep = open("provout_inputgen","wb")
        filep.write(json.dumps(provenancebulk))
        file = open("jsonout_inputgen","wb")
        file.write(json.dumps(output))
         
        
        
        
         
 
         
        
        
if __name__ == "__main__":     
    proc = GeneralImporter(sys.argv)
    proc.runit()
