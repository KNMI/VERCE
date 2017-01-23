from dispel4py.core import GenericPE, NAME
from dispel4py.seismo.seismo import *
import os
from scipy.cluster.vq import whiten

import socket
import traceback
import numpy as np
from multiprocessing import Process, Queue, Pipe
import socket
from dispel4py.provenance import ProvenancePE

 

class StreamToSeedFile(IterativePE):
    
    
    
    
    def writeToFile(self,stream,location):
        stream.write(location,format='MSEED',encoding='FLOAT32');
        __file = open(location)
        return os.path.abspath(__file.name)
    
    def _process(self,data):
        #folder=str(inputs['input'][0]);
        #tokenz=folder.split('|')
        #folder=tokenz[1];
        #tokenz=folder.split(' - ');
        
        #folder=tokenz[0]+" - "+tokenz[1];
        #self.outputdest='./'
        
        self.outputdest=self.outputdest+"%s" % (self.parameters["filedestination"],);
        for tr in data:
            try:
                tr.data=tr.data.filled();
            except Exception, err:
                tr.data=np.float32(tr.data);
            
        name=str(data[0].stats.network) + "." + data[0].stats.station + "." + data[0].stats.channel
        try:
            if tr.stats['type']=="velocity":
                self.outfile= str(name)+".seedv"
            else:
                if tr.stats['type']=="acceleration":
                    self.outfile= str(name)+".seeda"
                else:
                    if tr.stats['type']=="displacement":
                        self.outfile= str(name)+".seedd"
                    else:
                        self.outfile= str(name)+".seed"
        except Exception, err:
            self.outfile= str(name)+".seed"
        #self.outputdest=self.outputdest+"/"+folder
            
        try:
            if not os.path.exists(self.outputdest):
                os.makedirs(self.outputdest)
        except Exception, e:
            self.log("folder exists: "+self.outputdest)
            
        self.outputdest=self.outputdest+"/"+self.outfile
            
#stores the file in a folder created on the date of the first trace
#        p = multiprocessing.Process(target=self.writeToFile, args=(data['input'],self.outputdest))    
        path=self.writeToFile(data,self.outputdest)
#        p.start()
#        p.join(10)
        
              
        self.write('output',data,location="file://"+socket.gethostname()+path,attributes={'prov:type':'synthetic-waveform' },format="application/octet-stream")
             
        
        
        

if __name__ == "__main__":
    proc=StreamToSeedFile("StreamToSeedFile Script")
    proc.process();



