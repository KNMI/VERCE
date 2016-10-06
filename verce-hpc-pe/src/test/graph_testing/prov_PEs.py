import requests
import json
from dispel4py.GenericPE import GenericPE, NAME

class ProvenanceRecorder(GenericPE):

    INPUT_NAME = 'metadata'
    def __init__(self, name='ProvenanceRecorder'):
        GenericPE.__init__(self)
        self.name = name
        in1 = { self.INPUT_NAME : { NAME : self.INPUT_NAME }}

    def process(self, inputs):
        prov = inputs[self.INPUT_NAME]
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        response = requests.post(self.targetURL + 'workflow/insert', data={'prov' : json.dumps(prov)}, headers=headers)
        if response.status_code != 200:
           # self.log('Post to provenance recorder failed')
           pass
