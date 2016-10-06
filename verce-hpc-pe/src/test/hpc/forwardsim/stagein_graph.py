from dispel4py.workflow_graph import WorkflowGraph
from dispel4py.provenance import *
from dispel4py.seismo.seismo import *
from postproc import ReadJSON
from dispel4py.seismo.obspy_stream import createProcessingComposite, INPUT_NAME, OUTPUT_NAME
from dispel4py.base import SimpleFunctionPE, IterativePE, create_iterative_chain
import json
from dispel4py.visualisation import *
import os
import sys


input_json=json.load(open(os.environ["INPUT_FILE"]))

def strToBool(value):
        if value=="true":
           return True
        if value=="false":
           return False
        return value
    
 
    
def extractModel(data):
     
    origins=[]
    
    cmdl=False
      
    if "custom_mesh" in data:
        cmdl=strToBool(data["custom_mesh"])
    else:    
        if "custom_velocity_model" in data:
            cmdl=strToBool(data["custom_velocity_model"])
     
    
    
    if cmdl==True:
        origins.append("~/specfem/velocity_"+data["velocity_model"]+".zip")
    else:
        origins.append("~/../public/specfem/velocity_"+data["velocity_model"]+".zip")

    
    return origins

def extractMesh(data):
     
    origins=[]
    cmsh=False
    
    if "custom_mesh" in data:
        cmsh=strToBool(data["custom_mesh"])
     
    if cmsh==True:
        origins.append("~/specfem/mesh_"+data["mesh"]+".zip")
    else:
        origins.append("~/../public/specfem/mesh_"+data["mesh"]+".zip")

        
    
    return origins



def stagein(origins,target,irods,type):
    remote_locations=[]
    target_locations_urls=[]
    target_locations=[]
    for x in origins:
        stdoutdata, stderrdata = commandChain([["{}".format("globus-url-copy -cd -r -v -c gsiftp://"+irods+"/"+x+" "+target+"/",)]],os.environ.copy())
        remote_locations.append("gsiftp://"+irods+"/"+x)
        target_locations.append(target+"/"+os.path.basename(x))                                             
        target_locations_urls.append("file://"+socket.gethostname()+"/"+target+"/"+os.path.basename(x))                                             

    prov={'location':target_locations_urls, 'format':'application/octet-stream', 'error':stderrdata,'metadata':{'type':type,'source':remote_locations}}
    
    return {'_d4p_prov':prov,'_d4p_data':target_locations}

def unpack(files,location):
    locations=[]
    for x in files:
        stdoutdata, stderrdata = commandChain([["{};{}".format("cd "+location,"unzip "+x)]],os.environ.copy())
    
    prov={'location':locations, 'format':'application/octet-stream', 'error':stderrdata,'metadata':{'my_feature1':2,'my_feature2':'test'}}
    
    return {'_d4p_prov':prov,'_d4p_data':stdoutdata}


stagein_mesh=[extractMesh,
                   (stagein,{ 'target':os.environ['MODEL_PATH'],'irods':os.environ['IRODS_URL'],'type':'mesh'}),
                   (unpack,{'location':os.environ['MODEL_PATH']})
                   ]

stagein_model=[extractModel,
                   (stagein,{ 'target':os.environ['MODEL_PATH'],'irods':os.environ['IRODS_URL'],'type':'model'}),
                   (unpack,{'location':os.environ['MODEL_PATH']})
                   ]


graph = WorkflowGraph()
readf=ReadJSON()
mesh_staging_pipeline = create_iterative_chain(stagein_mesh)
model_staging_pipeline = create_iterative_chain(stagein_model)

graph.connect(readf, 'output', mesh_staging_pipeline, "input")
graph.connect(readf, 'output', model_staging_pipeline, "input")

injectProv(graph,ProvenancePE)
attachProvenanceRecorderPE(graph,ProvenanceRecorderToFile,username=os.environ['USER_NAME'],runId=os.environ['RUN_ID'],w3c_prov=False)

#InitiateNewRun(graph,ProvenanceRecorderToService,username=os.environ['USER_NAME'],runId=os.environ['RUN_ID'],w3c_prov=False,workflowName="model_stagein",workflowId="")
#display(graph)
 
