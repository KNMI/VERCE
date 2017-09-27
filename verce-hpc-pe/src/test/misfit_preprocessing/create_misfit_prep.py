# Run:
# MISFIT_PREP_CONFIG="dispel4py/test/seismo/misfit/processing.json" python -m dispel4py.new.processor simple dispel4py.test.seismo.misfit.create_misfit_prep -f dispel4py/test/seismo/misfit/misfit_input.jsn
#
# Expects an environment variable MISFIT_PREP_CONFIG with the JSON file that specifies the preprocessing graph.

import json
import os
import sys
import obspy
import misfit_preprocess_new as mf
from misfit_preprocess_new import get_event_time, get_synthetics, sync_cut, rotate_data
from dispel4py.core import GenericPE
from dispel4py.base import create_iterative_chain, ConsumerPE, IterativePE
from dispel4py.workflow_graph import WorkflowGraph
from dispel4py.seismo.seismo import *
#from dispel4py.visualisation import display


class ReadDataPE(GenericPE):
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input')
        self._add_output('output_real')
        self._add_output('output_synt')
        self.counter = 0

    def _process(self, inputs):
        params = inputs['input']
        stations = params['station']
        networks = params['network']
        data_dir = os.environ['STAGED_DATA']+'/'+params['data_dir']
        synt_dir = os.environ['STAGED_DATA']+'/'+params['synt_dir']
        event_file = params['events']
        event_id = params['event_id']
        stations_dir = os.environ['STAGED_DATA']+'/'+params['stations_dir']
        output_dir = os.environ['STAGED_DATA']+'/'+params['output_dir']
        self.log(params)
        fe = 'v'
        if self.output_units == 'velocity':
            fe = 'v'
        elif self.output_units == 'displacement':
            fe = 'd'
        elif self.output_units == 'acceleration':
            fe = 'a'
        else:
            self.log('Did not recognise output units: %s' % self.output_units)
        quakeml =[_i for _i in obspy.readEvents(event_file)
                                   if _i.resource_id.id == params["event_id"]][0]
        for i in range(len(stations)):
            station = stations[i]
            network = networks[i]
            data_file = os.path.join(data_dir, network + "." + station + ".." + '?H?.mseed')
            synt_file = os.path.join(synt_dir, network + "." + station + "." + '?X?.seed' + fe)
            sxml = os.path.join(stations_dir, network + "." + station + ".xml")
            real_stream, sta, event = mf.read_stream(data_file, sxml=sxml,
                                                  event_file=event_file,
                                                  event_id=event_id)
            self.log("real_stream %s" % real_stream)
            
            synt_stream = get_synthetics(synt_file, get_event_time(quakeml))
            
            data, synt = sync_cut(real_stream, synt_stream)
            self.write(
                'output_real', [data, { 
                    'station' : sta, 
                    'event' : event, 
                    'stationxml' : sxml, 
                    'quakeml' : quakeml, 
                    'output_dir' : output_dir }
                ],metadata={'output_units':self.output_units})
            self.write(
                'output_synt', [synt, {
                    'station' : sta, 
                    'event' : event, 
                    'stationxml' : sxml, 
                    'quakeml' : quakeml, 
                    'output_dir' : output_dir }
                ],metadata={'output_units':self.output_units})

class RotationPE(IterativePE):
    def __init__(self, tag):
        IterativePE.__init__(self)
        self.tag = tag

    def _process(self, data):
        stream, metadata = data
        output_dir = metadata['output_dir']
        stations = metadata['station']
        event = metadata['event']
        stats = stream[0].stats
        filename = "%s.%s.%s.png" % (
            stats['network'], stats['station'], self.tag)
        stream.plot(outfile=os.path.join(output_dir, filename))
        stream = rotate_data(stream, stations, event)
        filename = "rotate-%s.%s.%s.png" % (
            stats['network'], stats['station'], self.tag)
        dest=os.path.join(output_dir, filename)
        stream.plot(outfile=dest)
        self.write('output',(stream, metadata),location="file://"+socket.gethostname()+"/"+dest,metadata={'prov:type':self.tag+'-waveform'},format='image/png')
        


class StoreStreamChannel(ConsumerPE):
    def __init__(self, tag):
        ConsumerPE.__init__(self)
        self.tag = tag
        self._add_output('output')

    def _process(self, data):
        filelist = {}
        stream, metadata = data
        output_dir = metadata['output_dir']
        for i in range(len(stream)):
            stats = stream[i].stats
            filename = os.path.join(output_dir, "%s.%s.%s.%s.seed" % (
                stats['network'], stats['station'], stats['channel'], self.tag))
            stream[i].write(filename, format='MSEED')
            self.log('Writing %s' % filename)
            filelist[stats['channel']] = filename
            
            self.write('output',stream[i],location="file://"+socket.gethostname()+"/"+filename,metadata={'prov:type':self.tag+'-waveform'},format='application/octet-stream')

            
class PlotStream(ConsumerPE):
    def __init__(self, tag):
        ConsumerPE.__init__(self)
        self.tag = tag
        self._add_output('output_real')

    def _process(self, data):
        stream, metadata = data
        output_dir = metadata['output_dir']
        stations = metadata['station']
        event = metadata['event']
        stats = stream[0].stats
        filename = "%s.%s.%s.png" % (
            stats['network'], stats['station'], self.tag)
        dest=os.path.join(output_dir, filename)
        stream.plot(outfile=dest)
        
        self.write('output',stream,metadata=metadata,location="file://"+socket.gethostname()+"/"+dest)
            


class MisfitPreprocessingFunctionPE(IterativePE):

    def __init__(self):
        IterativePE.__init__(self)

    def _process(self, data):
        
        
        stream, metadata = data
        result = self.compute_fn(stream, **self.params)
        if type(result)==tuple and 'location' in result[1]:
            
            self.write('output',(result[0],metadata),metadata=result[1]['metadata'],location=result[1]['location'],format=result[1]['format'])
        else:
            return result, metadata

def create_processing_chain(proc):
    processes = []
    for p in proc:
        fn_name = p['type']
        params = p['parameters']
        print 'adding %s(%s)' % (fn_name, params)
        fn = getattr(mf, fn_name)
        processes.append((fn, params))
    return create_iterative_chain(processes, FunctionPE_class=MisfitPreprocessingFunctionPE)

with open(os.environ['MISFIT_PREP_CONFIG']) as f:
    proc = json.load(f)

real_preprocess = create_processing_chain(proc['data_processing'])
synt_preprocess = create_processing_chain(proc['synthetics_processing'])
    
graph = WorkflowGraph()
read = ReadDataPE()
read.name = 'readDataPE'
read.output_units = proc['output_units']
rotate_real = RotationPE('observed')
rotate_synt = RotationPE('synthetic')
store_real = StoreStreamChannel('observed')
store_synt = StoreStreamChannel('synthetic')
graph.connect(read, 'output_real', real_preprocess, 'input')
graph.connect(read, 'output_synt', synt_preprocess, 'input')
if proc['rotate_to_ZRT']:
    graph.connect(real_preprocess, 'output', rotate_real, 'input')
    graph.connect(synt_preprocess, 'output', rotate_synt, 'input')
    graph.connect(rotate_real, 'output', store_real, 'input')
    graph.connect(rotate_synt, 'output', store_synt, 'input')
else:
    graph.connect(real_preprocess, 'output', store_real, 'input')
    graph.connect(synt_preprocess, 'output', store_synt, 'input')
    
    

ProvenancePE.BULK_SIZE=20
ProvenancePE.PROV_PATH=os.environ['PROV_PATH']
injectProv(graph, (SeismoPE,), save_mode=ProvenancePE.SAVE_MODE_FILE ,controlParameters={'username':os.environ['USER_NAME'],'runId':os.environ['RUN_ID'],'outputdest':os.environ['EVENT_PATH']})



#for lcoal test with full provenance generation and upload to local repository
#Store via service
#ProvenancePE.REPOS_URL='http://127.0.0.1:8082/workflow/insert'
#rid='PREPROCESS_VERCE_'+getUniqueId()
#profile_prov_run(graph,None,provImpClass=(SeismoPE,),save_mode='service',input=[{'test':'1','blah':'3'}],username="aspinuso",workflowId="173",description="test",system_id="xxxx",workflowName="preprocessing",runId=rid,w3c_prov=False)

