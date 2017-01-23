from dispel4py.workflow_graph import WorkflowGraph 
from dispel4py.provenance import *
import time
import random
from dispel4py.base import create_iterative_chain, GenericPE, ConsumerPE, IterativePE, SimpleFunctionPE
from dispel4py.new.simple_process import process_and_return

class Source(GenericPE):

    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input')
        self._add_output('output')
        #self._add_input('input2')
        
    
    def _process(self,inputs):
        print inputs
        iter=None
        if 'input' in inputs:
            self.log('from input')
            iter=inputs['input'][0]
        if 'input2' in inputs:
            self.log('from input2')
            iter=inputs['input2'][0]
            
         
        #self.addToProv(0,metadata={'this':"mine"})
        
        while (iter>=5):
            #time.sleep(0.5)
            #val = random.random()
            self.write('output',iter,metadata={'iter':iter})
            iter=iter-10
        
        
        


def square(data,prov_cluster):
    data=data*data
    prov={'format':'Random float', 'metadata':{'value_s':str(data)}}
    
    return {'_d4p_prov':prov,'_d4p_data':data} 
    #return data


    
    
class Div(GenericPE):

    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input')
        self._add_output('output')
        self.prov_cluster='mycluster'
         
        self.operands=[]
        
    def _process_feedback(data):
        print "FEEEEDBACK: "+str(data)
    
    def _process(self,data):
        self.log("SSSSSS: "+str(data))
        self.operands.append(data['input'])
        #self.addToProv(0,metadata={'that':"yours"})
       
        val=0
        if (len(self.operands)==2):
            #time.sleep(0.5)
            val = self.operands[0]/self.operands[1]
            self.write('output',val,metadata={'val':val})
            self.log(val)
            self.operands=[]
            

    
    


sc = Source()
sc.name='PE_source'

squaref=SimpleFunctionPE(square,{'prov_cluster':'mycluster'})
#squaref=SimpleFunctionPE(square)
divf=Div()
divf.name='PE_div'


#processes=[squaref,divf]
#chain = create_iterative_chain(processes, FunctionPE_class=SimpleFunctionPE)

#Initialise the graph
graph = WorkflowGraph()

#Common way of composing the graph
graph.connect(sc,'output',squaref,'input')
graph.connect(squaref,'output',divf,'input')
#graph.connect(divf,'output',squaref,'input')

# Alternatively with pipeline array
#Create pipelines from functions

#graph.connect(sc,'output',chain,'input')


graph.flatten()

#Prepare Input
input_data = {"PE_source": [{"input": [25]}]}
