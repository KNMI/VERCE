from dispel4py.base import SimpleFunctionPE
from dispel4py.workflow_graph import WorkflowGraph
from dispel4py.seismo.seismo import *
import obspy
from obspy.core import read
import os
import sys
import pickle
import xml.etree.ElementTree as ET
from dispel4py.base import create_iterative_chain, ConsumerPE, IterativePE





from . import RectangularDomain, Restrictions, DownloadHelper
from obspy.fdsn.header import URL_MAPPINGS



class WatchDirectory(IterativePE):
    
    def __init__(self,index):
        IterativePE.__init__(self)
        #self._add_input('input')
        #self._add_output('output')
        self.index = index
         
    
    def _process(self,inputs):
         
        
        
        directory = inputs
        print "DIRECOTRY: "+str(directory)
        for dir_entry in os.listdir(directory[self.index]):
             
            dir_entry_path = os.path.join(directory[self.index], dir_entry)
            if os.path.isfile(dir_entry_path):
                
                self.write('output',dir_entry_path)
        
    
    
def waveform_reader(data):
    
    filename = data
    st = read(filename)
    prov={'location':"file://"+socket.gethostname()+"/"+filename, 'format':'application/octet-stream', 'metadata':{'prov:type':'observed-waveform'}}
    
     
    return {'_d4p_prov':prov,'_d4p_data':st}

def stationxml_reader(data):
    
    filename = data
    #st = read(filename)
    tree = ET.parse(filename)
    root = tree.getroot()
    scode=''
    ncode=''
    n=root.find('{http://www.fdsn.org/xml/station/1}Network')
    ncode=n.get('code')
    s=n.find('{http://www.fdsn.org/xml/station/1}Station')
    scode=s.get('code')
    prov={'location':"file://"+socket.gethostname()+"/"+filename, 'format':'application/xml', 'metadata':{'prov:type':'stationxml','station':scode,'network':ncode}}
    
     
    return {'_d4p_prov':prov,'_d4p_data':data}

def plot_stream(stream,output_dir,source,tag):
    stats = stream[0].stats
    filename = source+"-%s.%s.%s.png" % (
                                 stats['network'], stats['station'], tag)
    
    
    path = os.environ['STAGED_DATA']+'/'+output_dir
    
    if not os.path.exists(path):
        try:
            os.makedirs(path)
        except:
            pass
    dest=os.path.join(path, filename)
    stream.plot(outfile=dest)
    prov={'location':"file://"+socket.gethostname()+"/"+dest, 'format':'image/png','metadata':{'prov:type':tag,'source':source,'station':stats['station']}}
    return {'_d4p_prov':prov,'_d4p_data':stream}
    
# Rectangular domain containing parts of southern Germany.
def download_data(data):
    domain = RectangularDomain(
        minlatitude=float(data['minlatitude']),
        maxlatitude=float(data['maxlatitude']),
        minlongitude=float(data['minlongitude']),
        maxlongitude=float(data['maxlongitude']))

    restrictions = Restrictions(
        # Get data for a whole year.
        starttime=obspy.UTCDateTime(data['ORIGIN_TIME'])-300,
        endtime=obspy.UTCDateTime(data['ORIGIN_TIME'])+float(data['DT'])*int(data['NSTEP'])+300,
        # Considering the enormous amount of data associated with continuous
        # requests, you might want to limit the data based on SEED identifiers.
        # If the location code is specified, the location priority list is not
        # used; the same is true for the channel argument and priority list.
        network=None, station=None, location=None, channel=None,
        # The typical use case for such a data set are noise correlations where
        # gaps are dealt with at a later stage.
        reject_channels_with_gaps=True,
        # Same is true with the minimum length. Any data during a day might be
        # useful.
        minimum_length=0.99,
        # Guard against the same station having different names.
        minimum_interstation_distance_in_m=data[
            'minimum_interstation_distance_in_m'],
        channel_priorities=data['channel_priorities'],
        location_priorities=data['location_priorities']

        )
    print "TIME WIND:"+str((str(restrictions.starttime),str(restrictions.endtime)))
    dlh = DownloadHelper()
    report = dlh.download(
        domain=domain, restrictions=restrictions,
        mseed_path=os.environ['STAGED_DATA']+"/"+data['mseed_path'], stationxml_path=os.environ['STAGED_DATA']+"/"+data['stationxml_path'])
    
    download_report = []
    # Bit of a hack!
    URL_MAPPINGS["INGV"] =  "http://webservices.rm.ingv.it"
    for r in report:
        for station in r["data"]:
            download_report.append({"provider": r["client"],
                                    "provider_url": URL_MAPPINGS[r["client"]],
                                    "station": "%s.%s" % (station.network, station.station)})
   
    prov={'location':["file://"+socket.gethostname()+"/"+os.environ['STAGED_DATA']+"/"+data['mseed_path'],"file://"+socket.gethostname()+"/"+os.environ['STAGED_DATA']+"/"+data['stationxml_path']], 'format':'multipart/mixed', 'metadata':download_report}
    
     
    
    return {'_d4p_prov':prov,'_d4p_data':[os.environ['STAGED_DATA']+"/"+data['mseed_path'],os.environ['STAGED_DATA']+"/"+data['stationxml_path']]}   



waveformr = SimpleFunctionPE(waveform_reader)
xmlr = SimpleFunctionPE(stationxml_reader)
downloadPE = SimpleFunctionPE(download_data)

processes=[waveform_reader,(plot_stream,{"source":"waveform_reader","output_dir": "./output-images","tag": "observed-image"})]
            
#processes.append((fn, params))
chain = create_iterative_chain(processes, FunctionPE_class=SimpleFunctionPE)



watcher = WatchDirectory(0)
watcher_xml = WatchDirectory(1)
downloadPE.name = "downloadPE"
graph = WorkflowGraph()
graph.add(downloadPE)

graph.connect(downloadPE, 'output', watcher, "input")
graph.connect(downloadPE, 'output', watcher_xml, "input")
graph.connect(watcher, 'output', chain, "input")
graph.connect(watcher_xml, 'output', xmlr, "input")

#injectProv(graph,SeismoPE)
#graph=attachProvenanceRecorderPE(graph,ProvenanceRecorderToFileBulk,username=os.environ['USER_NAME'],runId=os.environ['RUN_ID'])

#Store via service
ProvenancePE.REPOS_URL='http://127.0.0.1:8082/workflow/insert'

#Store to local path
ProvenancePE.PROV_PATH=os.environ['PROV_PATH']

#Size of the provenance bulk before sent to storage or sensor
ProvenancePE.BULK_SIZE=20
injectProv(graph, (SeismoPE,), save_mode=ProvenancePE.SAVE_MODE_FILE ,controlParameters={'username':os.environ['USER_NAME'],'runId':os.environ['RUN_ID'],'outputdest':os.environ['EVENT_PATH']})

#profile_prov_run(graph,None,provImpClass=(SeismoPE,),save_mode='service',input=[{'test':'1','blah':'3'}],username="aspinuso",workflowId="173",description="test",system_id="xxxx",workflowName="download",runId=os.environ['RUN_ID'],w3c_prov=False)

