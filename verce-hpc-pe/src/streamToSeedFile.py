#from verce.processing import *
from scipy.cluster.vq import whiten
import socket
import traceback
from multiprocessing import Process, Queue, Pipe

 

class StreamToSeedFile(SeismoPreprocessingActivity):
    
    def writeToFile(self,stream,location):
        stream.write(location,format='MSEED',encoding='FLOAT32');
        __file = open(location)
        return os.path.abspath(__file.name)
    
    def compute(self):
        #folder=str(self.streams[0][0]);
        #tokenz=folder.split('|')
        #folder=tokenz[1];
        #tokenz=folder.split(' - ');
        
        #folder=tokenz[0]+" - "+tokenz[1];
        
        self.outputdest=self.outputdest+"%s" % (self.parameters["filedestination"],);
        for tr in self.streams[0]:
            try:
                tr.data=tr.data.filled();
            except Exception, err:
                tr.data=np.float32(tr.data);
            
        name=str(self.streams[0][0].stats.network) + "." + self.streams[0][0].stats.station + "." + self.streams[0][0].stats.channel
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
            print "folder exists: "+self.outputdest
        self.outputdest=self.outputdest+"/"+self.outfile
            
#stores the file in a folder created on the date of the first trace
#        p = multiprocessing.Process(target=self.writeToFile, args=(self.streams[0],self.outputdest))    
        path=self.writeToFile(self.streams[0],self.outputdest)
#        p.start()
#        p.join(10)
        
              
        self.addOutput(self.streams[0],location="file://"+socket.gethostname()+path,format="application/octet-stream",metadata={'prov:type':'synthetic-waveform'})
             
        return "true"
        
        

if __name__ == "__main__":
    proc=StreamToSeedFile("StreamToSeedFile Script")
    proc.process();



