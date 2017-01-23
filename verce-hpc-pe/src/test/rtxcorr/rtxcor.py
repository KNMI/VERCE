
# coding: utf-8

# ## Cross-correlation exmple with Active-Provenance in dispel4py:
# 
# 
# 
# ### Sample Corss-Correlation Workflow: Description and Components
# <br/>
# 
# The workflow performs and visualises the cross correlation matrix between a configurable number of sources, with parametrisable sampling-rate and length of the message.
# 
# The workflow specification and especially its parametrisation are inspired by the following research paper:
# https://www.cs.ubc.ca/~hoos/Publ/RosEtAl07.pdf
# 
# #### Components
# <br/>
# 
# <li>1 - Class Start: Root node of the graph. It sends initial configruation parameters (Number of total number produced) </li>
# <li>2 - Class Source: Produces random number from 0,100 at a specified sampling-rate</i>
# <li>3 - Class CorrCoef: Calculates the Pearson's correlation coefficient of a specified amount of samples (batch) coming from two sourcs</li>
# <li>4 - Class PlotCor: Visualise the cross correlation matrix for all Sources for each batch</li>
# 
# The script below defines the components and declares the workflow. Its execution will show a visual representation of the abstract workfkow grap.
# 
# 
# ### Function addToProvState 
# Adds an object and its metadata to the PEs state. This can be referenced from the user during write operations, increasing the lineage precision in stateful components.
# 
# The accepted parameters are the following:
# 
# #### Unnamed parameters:
# <li> 1 - <i>data</i>: object to be stored in the provenance state</li>
# 
# #### Named Parameters:
# <li> 1 - <i>name</i>: for stateful references a name of the object is required. Using the same name will overwrite the reference</li>
# <li> 2 - <i>location</i>: url or path indicating the location of the data file, if any has been produced</li>
# <li> 3 - <i>metadata</i>: dictionary of key,values pairs od user-defined metadata associated to the object.</li>
# <li> 4 - <i>ignore_dep</i>: If <b>True</b> the dependencies which are currently standing are ignored, default True</li>
# <li> 5 - <i>stateless</i>:  If <b>True</b> the item added is not included as new standing dependencies, default True</li>
# 
# 
# 
# <br/>
# 

# In[1]:


from dispel4py.workflow_graph import WorkflowGraph 
from dispel4py.provenance import *
from dispel4py.new.processor  import *
import time
import random
import numpy
import traceback 
from dispel4py.base import create_iterative_chain, GenericPE, ConsumerPE, IterativePE, SimpleFunctionPE
from dispel4py.new.simple_process import process_and_return

import IPython
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats.stats import pearsonr 
import networkx as nx


sns.set(style="white")


class Start(GenericPE):

    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('iterations')
        self._add_output('output')
        #self.prov_cluster="myne"
    
    def _process(self,inputs):
        
        if 'iterations' in inputs:
            inp=inputs['iterations']
             
            self.write('output',inp,metadata={'val':inp})
            
        #Uncomment this line to associate this PE to the mycluster provenance-cluster 
        #self.prov_cluster ='mycluster'

class Source(GenericPE):

    def __init__(self,sr,index):
        GenericPE.__init__(self)
        self._add_input('iterations')
        self._add_output('output')
        self.sr=sr
        self.var_index=index
        #self.prov_cluster="myne"
         
        self.parameters={'sampling_rate':sr}
        
        #Uncomment this line to associate this PE to the mycluster provenance-cluster 
        #self.prov_cluster ='mycluster'
        
    
    def _process(self,inputs):
         
        if 'iterations' in inputs:
            iteration=inputs['iterations'][0]
       
        #Streams out values at 1/self.sr sampling rate, until iteration>0
        while (iteration>0):
            val=random.uniform(0,100)
            time.sleep(1/self.sr)
            self.write('output',val,metadata={'val':val,'var_index':self.var_index})
            iteration-=1
        
        
        

class CompMatrix(GenericPE):

    def __init__(self,variables_number):
        GenericPE.__init__(self)
         
        self._add_output('output')
        self.size=variables_number
        self.parameters={'variables_number':variables_number}
        self.data={}
         
        
        #Uncomment this line to associate this PE to the mycluster provenance-cluster 
        #self.prov_cluster ='mycluster'self.prov_cluster='mycluster'
            
    def _process(self,data):
        for x in data:
            
            if data[x][1] not in self.data:
                #prepares the data to visualise the xcor matrix of a specific batch number.
                self.data[data[x][1]]={}
                self.data[data[x][1]]['matrix']=numpy.identity(self.size)
                self.data[data[x][1]]['ro_count']=0
            
            self.data[data[x][1]]['matrix'][(data[x][2][1],data[x][2][0])]=data[x][0]
            #self.addToProvState('batch_'+str(data[x][1]),self.data[data[x][1]]['matrix'],metadata={'matrix':str(self.data[data[x][1]]['matrix'])},dep=['batch_'+str(data[x][1])],ignore_inputs=False)
            self.data[data[x][1]]['ro_count']+=1
            
            if self.data[data[x][1]]['ro_count']==(self.size*(self.size-1))/2:
                matrix=self.data[data[x][1]]['matrix']
                
                d = pd.DataFrame(data=matrix,
                 columns=range(0,self.size),index=range(0,self.size))
                
                mask = numpy.zeros_like(d, dtype=numpy.bool)
                mask[numpy.triu_indices_from(mask)] = True

                # Set up the matplotlib figure
                f, ax = plt.subplots(figsize=(11, 9))

                # Generate a custom diverging colormap
                cmap = sns.diverging_palette(220, 10, as_cmap=True)

                # Draw the heatmap with the mask and correct aspect ratio
                sns.heatmap(d, mask=mask, cmap=cmap, vmax=1,
                    square=True,
                    linewidths=.5, cbar_kws={"shrink": .5}, ax=ax)
                
                sns.plt.savefig("./plots/"+str(data[x][1])+"_plot.png") 
                self.write('output',(matrix,data[x][1]),metadata={'matrix':str(d),'batch':str(data[x][1])},dep=['batch_'+str(data[x][1])])
                
            
class CorrCoef(GenericPE):

    def __init__(self,batch_size,index):
        GenericPE.__init__(self)
        self._add_input('input1')
        self._add_input('input2')
        self._add_output('output')
        self.index1=0
        self.index2=0
        self.batch1=[]
        self.batch2=[]
        self.size=batch_size
        self.parameters={'batch_size':batch_size}
        self.index=index
        self.batchnum=0
         
        
    def _process(self, inputs):
        index=None
        val=None
              
            
        try:
            val = inputs['input1']
            self.batch1.append(val)
            self.addToProvState('batch1',self.batch1,metadata={'batch1':str(self.batch1)},ignore_dep=False)
        
            
                 
        except KeyError:
            #traceback.print_exc(file=sys.stderr)
            val = inputs['input2']
            self.batch2.append(val)
            self.addToProvState('batch2',self.batch2,metadata={'batch2':str(self.batch2)},ignore_dep=False)
        
        
        #self.addToProvState(None,,ignore_dep=False)
            
        if len(self.batch2)>=self.size and len(self.batch1)>=self.size:
            array1=numpy.array(self.batch1[0:self.size])
            array2=numpy.array(self.batch2[0:self.size])
            ro=numpy.corrcoef([array1,array2])
            # stream out the correlation coefficient, the sequence number of the batch and the indexes of the sources.
            self.write('output',(ro[0][1],self.batchnum,self.index),metadata={'batchnum':self.batchnum,'ro':str(ro[0][1]),'array1':str(array1),'array2':str(array2),'source_index':self.index},dep=['batch1','batch2'])
            self.batchnum+=1
            self.batch1=self.batch1[(self.size):len(self.batch1)]
            self.batch2=self.batch2[(self.size):len(self.batch2)]
 


class MaxClique(GenericPE):

    def __init__(self,threshold):
        GenericPE.__init__(self)
        self._add_input('matrix')
        self._add_output('graph')
        self._add_output('clique')
        self.threshold=threshold
        #self.prov_cluster="myne"
         
        self.parameters={'threshold':threshold}
        
                
        #Uncomment this line to associate this PE to the mycluster provenance-cluster 
        #self.prov_cluster ='mycluster'
        
    
    def _process(self,inputs):
         
        if 'matrix' in inputs:
            matrix=inputs['matrix'][0]
            batch=inputs['matrix'][1]
        
        
        low_values_indices = matrix < self.threshold  # Where values are low
        matrix[low_values_indices] = 0 
        self.log(matrix)
        self.write('graph',matrix,metadata={'matrix':str(matrix),'batch':batch})
        self.write('clique',matrix,metadata={'matrix':str(matrix),'batch':batch},ignore_inputs=True)
                
        G = nx.from_numpy_matrix(matrix)
        plt.figure(batch)
        nx.draw(G)
        plt.savefig("./plots/"+str(batch)+"_clique.png")



# ### Preparing workflow inputs and parameters
# 
# <b>number of visualisations</b> = <i>iterations/batch_size</i> at speed defined by the <i>sampling_rate<i>

# In[2]:

#####################################################################################################

#Declare workflow inputs: (each iteration prduces a batch_size of samples at the specified sampling_rate)
# number of projections = iterations/batch_size at speed defined by sampling rate
variables_number=5
sampling_rate=100
batch_size=5
iterations=15

input_data = {"Start": [{"iterations": [iterations]}]}
      
# Instantiates the Workflow Components  
# and generates the graph based on parameters


#print ("Preparing for: "+str(iterations/batch_size)+" projections" )


# ## Preparing the workflow graph for provenance production, pre-analysis and storage
# 
# This snippet will make sure that the workflow compoentns will be provenance-aware and the lineage information sent to the designated ProvenanceRecorders for in-workflow pre-analysis.
# 
# The execution will show a new graph where it will be possible to validate the provenance-cluster, if any, and the correct association of ProvenanceRecorders and feedback connections.
# 
# The graph will change according to the declaration of self.prov_cluster property of the processing elements and to the specification of different ProvenanceRecorders and feedback loops, as described below:
# 
# ### Function InitiateNewRun 
# Prepares the workflow with the required provenance mechanisms
# The accepted parameters are the following:
# 
# #### Unnamed parameters:
# <li> 1 - <i>worfklow graph</i></li>
# <li> 2 - Class name implementing the default <i>ProvenanceRecorder</i></li>
# 
# #### Named Parameters
# <li> 3 - <i>provImpClass</i>: Class name extending the default <i>ProvenancePE</i>. The current type of the workflow components (GenericPE) will be extended with the one indicated by the <i>provImpClass</i> type</li>
# <li> 4 - <i>username</i></li>
# <li> 5 - <i>runId</i></li>
# <li> 6 - <i>w3c_prov</i>: specifies if the PE will outupt lineage in PROV format (default=False)</li>
# <li> 7 - <i>workflowName</i></li>
# <li> 8 - <i>workflowId</i></li>
# <li> 9 - <i>clustersRecorders</i>: dictionary associating <i>provenance-clusters</i> with a specific <i>ProvenanceRecorder</i> (overrides the default <i>ProvenanceRecorder</i>) </li>
# <li> 10 - <i>feedbackPEs</i>: list of PE names receiving and processing feedbacks from the <i>ProvenanceRecorder</i>. </li>
# 
# <br/>
# 
# 
# 

# In[3]:

#Location of the remote repository for runtime updates of the lineage traces. Shared among ProvenanceRecorder subtypes
ProvenanceRecorder.REPOS_URL='http://verce-portal-dev.scai.fraunhofer.de/j2ep-1.0/prov/workflow/insert'



# ## Developing ProvenanceRecorders
# 
# The Class below show a sample <i>ProvenanceRecorderToService</i> and a slightlty more advanced one that allows for feedback.
# 
# ### ProvenanceRecorderToService
# 
# Recieves traces from the PEs and sends them out to an exteranal provenance store.
# 
# 

# In[5]:


class ProvenanceRecorderToService(ProvenanceRecorder):

    def __init__(self, name='ProvenanceRecorderToService', toW3C=False):
        ProvenanceRecorder.__init__(self)
        self.name = name
        self.convertToW3C = toW3C
        # self.inputconnections[ProvenanceRecorder.INPUT_NAME] = {
        # "name": ProvenanceRecorder.INPUT_NAME}

    def _preprocess(self):
        self.provurl = urlparse(ProvenanceRecorder.REPOS_URL)
        self.connection = httplib.HTTPConnection(
            self.provurl.netloc)

    def _process(self, inputs):
        
        #ports are assigned automatically as numbers, we just need to read from any of these
        for x in inputs:
            prov = inputs[x]
            
        out = None
        if isinstance(prov, list) and "data" in prov[0]:
            prov = prov[0]["data"]

        if self.convertToW3C:
            out = toW3Cprov(prov)
        else:
            out = prov

        params = urllib.urlencode({'prov': json.dumps(out)})
        headers = {
            "Content-type": "application/x-www-form-urlencoded",
            "Accept": "application/json"}
        self.connection.request(
            "POST",
            self.provurl.path,
            params,
            headers)

        response = self.connection.getresponse()
        print("Response From Provenance Serivce: ", response.status,
              response.reason, response, response.read())
        self.connection.close()
        return None

    def postprocess(self):
        self.connection.close()



# ### MyProvenanceRecorderWithFeedback
# 
# Recieves traces from the PEs and reads its content. Depending from the 'name' of the PE sending the lineage, feedbacks are prepared and sent back.

# In[6]:


class MyProvenanceRecorderWithFeedback(ProvenanceRecorder):

    def __init__(self, toW3C=False):
        ProvenanceRecorder.__init__(self)
        self.convertToW3C = toW3C
        self.bulk = []
        self.timestamp = datetime.datetime.utcnow()

    def _preprocess(self):
        self.provurl = urlparse(ProvenanceRecorder.REPOS_URL)

        self.connection = httplib.HTTPConnection(
            self.provurl.netloc)

    def postprocess(self):
        self.connection.close()
        
    def _process(self, inputs):
        prov = None
        for x in inputs:
            prov = inputs[x]
        out = None
        if isinstance(prov, list) and "data" in prov[0]:
            prov = prov[0]["data"]

        if self.convertToW3C:
            out = toW3Cprov(prov)
        else:
            out = prov

            
            
        self.write(self.porttopemap[prov['name']], "FEEDBACK MESSAGGE FROM RECORDER")

        self.bulk.append(out)
        params = urllib.urlencode({'prov': json.dumps(self.bulk)})
        headers = {
            "Content-type": "application/x-www-form-urlencoded",
            "Accept": "application/json"}
        self.connection.request(
            "POST", self.provurl.path, params, headers)
        response = self.connection.getresponse()
        self.log("progress: " + str((response.status, response.reason,
                                         response, response.read())))
        

        return None


# ## Active provenance with feedback
# Here we show how to implement a PE that can handle feedback from a <i>ProvenanceRecoder</i>. We redefine the worklow graph with the same structure as the provious one but with the new PE
# 
# ### Class DivFeedback
# It requires the implementation of the <i>_process_feedbak</i> function. The function will be invoked automatically by the framework when a feedback is sent.
# <br/>

# In[7]:

class DivFeedback(GenericPE):

    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input')
        self._add_output('output')
        
        #Uncomment this line to associate this PE to the mycluster provenance-cluster 
        #self.prov_cluster ='mycluster'self.prov_cluster='mycluster'
         
         
        
    def _process_feedback(data):
        print "FEEEEDBACK: "+str(data)
    
    def _process(self,data):
        self.log("DIIIIV: "+str(data)) 
        val = data['input'][0]/data['input'][1]
        self.write('output',val,metadata={'val':val})

        
        


# ### Preparing the Workflow with the requires clusters, recorders and feedback 

# In[11]:

# Instantiates the Workflow Components        


# Instantiates the Workflow Components  
# and generates the graph based on parameters
clustersRecorders={}
clustersRecorders['my']=ProvenanceRecorderToFileBulk
clustersRecorders['mycc']=ProvenanceRecorderToFileBulk
    
def createWf():
    graph = WorkflowGraph()
    plot=CompMatrix(variables_number)
    mc = MaxClique(-0.01)
    plot.numprocesses=4
    #plot.prov_cluster="my"
    start=Start()  
    #startprov_cluster="my"
    sources={}

    for i in range(0,variables_number):
        sources[i] = Source(sampling_rate,i)
        sources[i].prov_cluster="my"
    for h in range(0,variables_number):
        graph.connect(start,'output',sources[h],'iterations')
        for j in range(h+1,variables_number):
            cc=CorrCoef(batch_size,(h,j))
            cc.prov_cluster="mycc"
            plot._add_input('input'+'_'+str(h)+'_'+str(j),grouping=[1])
            graph.connect(sources[h],'output',cc,'input1')
            graph.connect(sources[j],'output',cc,'input2')
            graph.connect(cc,'output',plot,'input'+'_'+str(h)+'_'+str(j))
            cc.single=True
            #cc.numprocesses=1
    graph.connect(plot,'output',mc,'matrix')
    
    return graph     

print ("Preparing for: "+str(iterations/batch_size)+" projections" )


ProvenanceRecorder.REPOS_URL='http://verce-portal-dev.scai.fraunhofer.de/j2ep-1.0/prov/workflow/insert'

def createGraphWithProv():
    
    graph=createWf()
    #Location of the remote repository for runtime updates of the lineage traces. Shared among ProvenanceRecorder subtypes

    # Ranomdly generated unique identifier for the current run
    rid='RDWD_'+getUniqueId()

    # if ProvenanceRecorderToFile is used, this path will contains all the resulting JSON documents
    os.environ['PROV_PATH']="./prov-files/"

    # Finally, provenance enhanced graph is prepared:
    InitiateNewRun(graph,ProvenanceRecorderToFileBulk,provImpClass=ProvenancePE,username='aspinuso',runId=rid,w3c_prov=False,workflowName="test_rdwd",workflowId="xx",clustersRecorders=clustersRecorders)
    
    return graph

import argparse
from dispel4py.new.multi_process import process

args = argparse.Namespace
args.num = 424
args.simple = False

num=1


def runNoProv():
    elapsed_time=0
    for x in range(0,num):
        time.sleep(2)
        graph = createWf()
        elapsed_time=0
        start_time = time.time()
        process(graph, inputs=input_data, args=args)
        elapsed_time=elapsed_time+( time.time() - start_time)
    print ("NO PROV ELAPSED TIME: "+str(elapsed_time/num))
    


elapsed_time=0

def runYesProv():
    elapsed_time=0
    for x in range(0,num):
        graph = createGraphWithProv()
        elapsed_time=0
        start_time = time.time()
        process(graph, inputs=input_data, args=args)
        elapsed_time+= time.time() - start_time
    print ("PROV ELAPSED TIME: "+str(elapsed_time/num))

#runYesProv()
#runNoProv()
#print ("PROV ELAPSED TIME: "+str(elapsed_time/num))
#graph = createWf()
graph = createGraphWithProv()

global gtime
gtime = time.time()
