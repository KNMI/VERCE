from verce.workflow_graph import WorkflowGraph
from test.hpc.postproc import WatchDirectory, Specfem3d2Stream, WavePlot_INGV
from verce.seismo import seismo


graph = WorkflowGraph()
dir = '/home/hpc/pr45lo/di72zaz/dispy/test-resources/specfem3dseismogram/'
watcher = WatchDirectory(dir)
specfem2stream = Specfem3d2Stream()
specfem2stream.numprocesses=3
specfem2stream.stationsFile='/home/hpc/pr45lo/di72zaz/dispy/test-resources/listofpointsAbruzzo'
waveplot = WavePlot_INGV()
waveplot.numprocesses=3
#waveplot.log=simplelog
waveplot.appParameters = { 'filedestination' : 'waveplot/' }
waveplot.controlParameters = { 'runId' : '12345', 'username' : 'amyrosa', 'outputdest' : '/home/hpc/pr45lo/di72zaz/output/specfem/' }
graph.connect(watcher, WatchDirectory.OUTPUT_NAME, specfem2stream, seismo.INPUT_NAME)
graph.connect(specfem2stream, seismo.OUTPUT_DATA, waveplot, seismo.INPUT_NAME)

