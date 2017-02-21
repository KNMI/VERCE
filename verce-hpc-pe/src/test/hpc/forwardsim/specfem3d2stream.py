from dispel4py.core import GenericPE, NAME
from dispel4py.seismo.seismo import *
import os,sys,traceback
from obspy.core import trace,stream
from obspy.core import Trace,Stream
import numpy
import exceptions
from lxml import etree
from StringIO import StringIO

 

class Specfem3d2Stream(IterativePE):
    
    
     
     
    def num(self,s):
        try:
            return int(s)
        except exceptions.ValueError:
            return float(s)
    

    def produceStream(self,filepath):
        
        time,data=numpy.loadtxt(filepath,unpack=True)
        head,tail =  os.path.split(filepath)
        tr=trace.Trace(data)
         
       
     
        
        try:
            #assuming that the information are in the filename following the usual convention
            tr.stats['network']=tail.split('.')[1]
            tr.stats['station']=tail.split('.')[0]
            tr.stats['channel']=tail.split('.')[2]

            # the convention for specfem3d_globe requires the following changes:
            if self.parameters["solver_name"] == "SPECFEM3D_GLOBE":
                tr.stats['network'] = tail.split('.')[0]
                tr.stats['station'] = tail.split('.')[1]

            try:
                doc = etree.parse(StringIO(open(self.parameters["stations_file"]).read()))
                ns = {"ns": "http://www.fdsn.org/xml/station/1"}
                tr.stats['latitude']= self.num(doc.xpath("//ns:Station[@code='"+tr.stats['station']+"']/ns:Latitude/text()",namespaces=ns)[0])
                tr.stats['longitude']= self.num(doc.xpath("//ns:Station[@code='"+tr.stats['station']+"']/ns:Longitude/text()",namespaces=ns)[0])
            except:
                 
                with open(self.parameters["stations_file"]) as f:
                    k=False
                    for line in f:
                        
                        if (k==False):
                            k=True
                        else:
                            station={}
                            l=line.strip().split(" ")
                            if(tr.stats['station']==l[0]):
                               tr.stats['latitude']=float(l[3])
                               tr.stats['longitude']=float(l[2])  
                            
                            
        except:
            traceback.print_exc(file=sys.stderr) 
            tr.stats['network']=self.parameters["network"]
            tr.stats['station']=self.parameters["station"]
            tr.stats['channel']=self.parameters["channel"]
               
        
        tr.stats['starttime']=time[0]
        delta=time[1]-time[0]
        tr.stats['delta']=delta #maybe decimal here
        tr.stats['sampling_rate']=round(1./delta,1) #maybe decimal here
        if filepath.endswith('.semv'):
            tr.stats['type']="velocity"
        elif filepath.endswith('.sema'):
            tr.stats['type']='acceleration'
        elif filepath.endswith('.semd') or filepath.endswith('.ascii'):
            tr.stats['type']='displacement'
         
        
         
            
        st=Stream()
        st+=Stream(tr)
        return st

    def _process(self,inputs):
        
        
        
#        self.log("DATA:"+str(inputs))
        out=self.produceStream(inputs)
        self.write('output',out,attributes={'prov:type':'synthetic-waveform' })
        
        
        
        #self.filename=self.rootpath+"%s" % (self.streams[0],)+"%s" % (self.streams[1],)
        #self.outputdest=self.filename+'.sac'
        #example filename='ZCCA.IV.FXX.semd'
        
         
# self.streamItemsLocations.append("file://"+socket.gethostname()+self.outputdest)                        
       


if __name__ == "__main__":
    proc=Specfem3d2Stream("Conversion from specfem3d to stream Script")
    proc.process()



#works:
#cat test-resources/pyStreamTest.in | python seismo-resources/specfem3d2stream.py "{\"class\":\"eu.adma.Verce\",\"error\":null,\"input\":null,\"inputrootpath\":\"./\",\"metadata\":null,\"output\":null,\"outputdest\":\"./\",\"outputid\":\"MapSeissolOutputToStations.test\",\"pid\":null}" "{\"inputdest\":\"/test-resources/specfem3dseismogram/\",\"filename\":\"ZCCA.IV.FXX.semv\"}" >test-resources/my.out
