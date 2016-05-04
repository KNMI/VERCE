from dispel4py.workflow_graph import WorkflowGraph
from dispel4py.visualisation import *
from dispel4py.seismo.seismo import *
from postproc import ReadJSON, WatchDirectory
from specfem3d2stream import Specfem3d2Stream
from wavePlot_INGV import WavePlot_INGV
from streamToSeedFile import StreamToSeedFile
from kmlGenerator_INGV import kmlGenerator_INGV
from dispel4py.seismo import seismo
from dispel4py.seismo.obspy_stream import createProcessingComposite, INPUT_NAME, OUTPUT_NAME
import json
import os
import sys


input_json=json.load(open(os.environ["INPUT_FILE"]))

def myCustom(self,data):
    return str(data)

#dispel4py.seismo.seismo.SeismoPE.extractItemMetadata=myCustom

class ReadJSON(GenericPE):
    OUTPUT_NAME='output'
     
    
    def __init__(self):
        GenericPE.__init__(self)
        self.outputconnections = { ReadJSON.OUTPUT_NAME : { NAME : ReadJSON.OUTPUT_NAME } }
        
    def _process(self, inputs):
        
        self.write(ReadJSON.OUTPUT_NAME, input_json,control={"con:skip":True})

graph = WorkflowGraph()
read = ReadJSON()
watcher = WatchDirectory()

waveplot = WavePlot_INGV()
specfem2stream = Specfem3d2Stream()
seedtostream=StreamToSeedFile()
kmlGenerator = kmlGenerator_INGV()



controlInput = json.load(open(os.environ['JSON_OUT']+"/jsonout_run_specfem"))


kmlGenerator.appParameters={"stations_file":os.environ['RUN_PATH']+'/stations'}

specfem2stream.parameters={"stations_file":os.environ['RUN_PATH']+'/stations'}
specfem2stream.controlParameters = { 'outputdest' : "./" ,'runId' : controlInput["metadata"]["runId"], 'username' : controlInput["metadata"]["username"] }

waveplot.parameters = { 'filedestination' : '/OUTPUT_FILES/TRANSFORMED/PLOT/' }
waveplot.controlParameters = {'outputdest' : os.environ['EVENT_PATH'], 'runId' : controlInput["metadata"]["runId"], 'username' : controlInput["metadata"]["username"] }

seedtostream.parameters = { 'filedestination' : '/OUTPUT_FILES/TRANSFORMED/SEED/' }
seedtostream.controlParameters = { 'outputdest' : os.environ['EVENT_PATH'], 'runId' : controlInput["metadata"]["runId"], 'username' : controlInput["metadata"]["username"] }

watcher.controlParameters = { 'outputdest' : os.environ['EVENT_PATH'], 'runId' : controlInput["metadata"]["runId"], 'username' : controlInput["metadata"]["username"] }




graph.connect(read, ReadJSON.OUTPUT_NAME, watcher, "input")
graph.connect(watcher, "output", specfem2stream, "input")
graph.connect(specfem2stream, "output", waveplot, "input")
graph.connect(specfem2stream, "output", seedtostream, "input")

#graph=attachProvenancePE(graph,ProvenanceRecorderToFile(toW3C=False),username=controlInput["metadata"]["username"],runId=controlInput["metadata"]["runId"])

injectProv(graph,SeismoPE)
graph=attachProvenanceRecorderPE(graph,ProvenanceRecorderToFileBulk,username=controlInput["metadata"]["username"],runId=controlInput["metadata"]["runId"])

#InitiateNewRun(graph,ProvenanceRecorderToService,provImpClass=SeismoPE,input=[{'test':'1','blah':'3'}],username="aspinuso",workflowId="173",description="test",system_id="xxxx",workflowName="postprocessing",runId="datavisualtest4",w3c_prov=False)


#display(graph)

