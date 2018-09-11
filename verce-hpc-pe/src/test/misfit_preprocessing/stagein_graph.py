from dispel4py.workflow_graph import WorkflowGraph
from dispel4py.provenance import *
from dispel4py.seismo.seismo import *
from dispel4py.seismo.obspy_stream import createProcessingComposite, INPUT_NAME, OUTPUT_NAME
from dispel4py.base import SimpleFunctionPE, IterativePE, create_iterative_chain
import json
# from dispel4py.visualisation import *
import os
import sys
from urlparse import urlparse

input_json = json.load(open(os.environ["INPUT_FILE"]))


class ReadJSON(GenericPE):
    OUTPUT_NAME = 'output'

    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input')
        self._add_output('output_raw')
        self._add_output('output_syn')
        self._add_output('output_xml')

    def _process(self, inputs):
        self.write('output_raw', inputs['input']['raw_stagein_from'])
        self.write('output_syn', inputs['input']['syn_stagein_from'])
        self.write('output_xml', inputs['input']['stationxml_stagein_from'])


class StreamMapper(IterativePE):
    def __init__(self, rootpah):
        IterativePE.__init__(self)
        # self._add_input('input')
        # self._add_output('output')
        self.counter = 0
        self.roothpath = rootpah

    def _process(self, inputs):
        data = inputs

        for i in data:
            # self.log('FFFFFF: '+str(i))
            url = urlparse(i)
            self.write('output', [self.roothpath + url.path])


def strToBool(value):
    if value == "true":
        return True
    if value == "false":
        return False
    return value


def stagein(origins, target, irods, type, rootpath, format='application/octet-stream'):
    remote_locations = []
    target_locations_urls = []
    target_locations = []
    for x in origins:
        stdoutdata, stderrdata = commandChain([["{}".format(
            "globus-url-copy  -cd -r gsiftp://" + irods + "/" + rootpath + '/' + x + " " + target + "/", )]],
                                              os.environ.copy())
        remote_locations.append("gsiftp://" + irods + "/" + rootpath + '/' + x)
        target_locations.append(target + "/" + os.path.basename(x))
        target_locations_urls.append("file://" + irods + "/" + x)

    prov = {'location': target_locations_urls, 'format': format, 'error': stderrdata,
            'metadata': {'type': type, 'source': remote_locations}}

    return {'_d4p_prov': prov, '_d4p_data': target_locations}


stagein_raw = [(stagein,
                {'target': os.environ['STAGED_DATA'] + '/' + input_json['readJSONstgin'][0]['input']['data_dir'],
                 'irods': os.environ['IRODS_URL'], 'type': 'data', 'rootpath': '~/verce/'})
               ]

stagein_syn = [
    (stagein, {'target': os.environ['STAGED_DATA'] + '/' + input_json['readJSONstgin'][0]['input']['synt_dir'],
               'irods': os.environ['IRODS_URL'], 'type': 'synt', 'rootpath': '~/verce/'})
]

stagein_xml = [
    (stagein, {'target': os.environ['STAGED_DATA'] + '/' + input_json['readJSONstgin'][0]['input']['stations_dir'],
               'irods': os.environ['IRODS_URL'], 'type': 'stationxml', 'format': 'application/xml',
               'rootpath': '~/verce/'})
]

graph = WorkflowGraph()
read = ReadJSON()
read.name = 'readJSONstgin'
streamer0 = StreamMapper('')
streamer1 = StreamMapper('')
streamer2 = StreamMapper('')

syn_staging_pipeline = create_iterative_chain(stagein_syn)
raw_staging_pipeline = create_iterative_chain(stagein_raw)
xml_staging_pipeline = create_iterative_chain(stagein_xml)

graph.connect(read, 'output_syn', streamer0, "input")
graph.connect(read, 'output_raw', streamer1, "input")
graph.connect(read, 'output_xml', streamer2, "input")
graph.connect(streamer0, 'output', syn_staging_pipeline, "input")
graph.connect(streamer1, 'output', raw_staging_pipeline, "input")
graph.connect(streamer2, 'output', xml_staging_pipeline, "input")

# injectProv(graph,ProvenancePE)
# attachProvenanceRecorderPE(graph,ProvenanceRecorderToFileBulk,username=os.environ['USER_NAME'],runId=os.environ['RUN_ID'],w3c_prov=False)
ProvenancePE.BULK_SIZE = 20
ProvenancePE.PROV_PATH = os.environ['PROV_PATH']
injectProv(graph, (SeismoPE,), save_mode=ProvenancePE.SAVE_MODE_FILE,
           controlParameters={'username': os.environ['USER_NAME'], 'runId': os.environ['RUN_ID'],
                              'outputdest': os.environ['STAGED_DATA']})

# InitiateNewRun(graph,ProvenanceRecorderToFileBulk,username=os.environ['USER_NAME'],runId=input_json['runId'],w3c_prov=False,workflowName="preprocess_stagein",workflowId="")
# display(graph)

