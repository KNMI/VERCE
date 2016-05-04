from dispel4py.provenance import ProvenancePE, OUTPUT_DATA, INPUT_NAME, OUTPUT_METADATA
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
    def process(self, inputs):
        
        return { ReadJSON.OUTPUT_NAME : input_json }
    
    
    
class WatchDirectory(ProvenancePE):
    
    def __init__(self):
        ProvenancePE.__init__(self)
        self._add_output('output')
         
    
    def getDataStreams(self,inputs):
         
        for inp in inputs:
            
            values = inputs[inp]
        
            streams = {"streams": {inp:[values["streams"][0]]}}
        
        return streams
    
    def _process(self,inputs):
         
         
        directory = pickle.loads(inputs["input"])
        
        for dir_entry in os.listdir(directory):
             
            dir_entry_path = os.path.join(directory, dir_entry)
            if os.path.isfile(dir_entry_path):
                
                 
                self.write('output',dir_entry_path)
         

 


