from dispel4py.workflow_graph import WorkflowGraph
from dispel4py.provenance import *
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



graph = WorkflowGraph()
read = ReadJSON()
kmlGenerator = kmlGenerator_INGV()
controlInput = json.load(open(os.environ['JSON_OUT']+"/jsonout_run_specfem"))


kmlGenerator.parameters={"stations_filtered":os.environ['EVENT_PATH']+'/DATA/STATIONS_FILTERED',"cmt_solution":os.environ['EVENT_PATH']+'/DATA/CMTSOLUTION',"par_file":os.environ['EVENT_PATH']+'/DATA/Par_file',"images_path":"/OUTPUT_FILES/TRANSFORMED/PLOT/"}
kmlGenerator.controlParameters = { 'outputdest' : "./" }



graph.connect(read, ReadJSON.OUTPUT_NAME, kmlGenerator, "input")


injectProv(graph,ProvenancePE)
attachProvenanceRecorderPE(graph,ProvenanceRecorderToFileBulk,username=controlInput["metadata"]["username"],runId=controlInput["metadata"]["runId"])

 
