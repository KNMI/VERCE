from dispel4py.provenance import *
from dispel4py.core import GenericPE, NAME
import os
import pickle
import json

input_json=json.load(open(os.environ["INPUT_FILE"]))


class ReadJSON(GenericPE):
    OUTPUT_NAME='output'
     
    def __init__(self):
        GenericPE.__init__(self)
        self.outputconnections = { ReadJSON.OUTPUT_NAME : { NAME : ReadJSON.OUTPUT_NAME } }
    
    def _process(self, inputs):
        
        self.write(ReadJSON.OUTPUT_NAME, input_json,control={"con:skip":True})
    
    
    
class WatchDirectory(GenericPE):
    
    def __init__(self):
        GenericPE.__init__(self)
        self.inputconnections = { 'input' : { NAME : 'input' } }
        self.outputconnections = { 'output' : { NAME : 'output' } }
    
    def _process(self,inputs):
         
        try:
            self.buildDerivation(inputs['input']["streams"][0])
        except:
            pass
        
        directory = pickle.loads(inputs['input']["streams"][0]['data'])
        #self.addToProv('stami',metadata={'stami':1})
        for dir_entry in os.listdir(directory):
             
            dir_entry_path = os.path.join(directory, dir_entry)
            if os.path.isfile(dir_entry_path):
                
                self.write('output',dir_entry_path,control={"con:skip":True})
         

 


