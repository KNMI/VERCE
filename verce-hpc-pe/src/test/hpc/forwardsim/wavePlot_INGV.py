from dispel4py.core import GenericPE, NAME
from dispel4py.seismo.seismo import *
import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdt
import numpy as np
import socket
from dispel4py.provenance import ProvenancePE
import gc 



class WavePlot_INGV(IterativePE):
    
    
     

    
    
    def _process(self,data):
        self.outputdest=self.outputdest+"%s" % (self.parameters["filedestination"],);
        try:
            if not os.path.exists(self.outputdest):
                os.makedirs(self.outputdest)
        except Exception,e:
            self.error+=str(e)
        
        
        
        
        name=str(data[0].stats.network) + "." + data[0].stats.station + "." + data[0].stats.channel
        tr = data[0]
         
        
        try:
            if tr.stats['type']=="velocity":
                name= str(name)+".velocity"
            else:
                if tr.stats['type']=="acceleration":
                    name= str(name)+".acceleration"
                else:
                    if tr.stats['type']=="displacement":
                         name= str(name)+".displacement"
                    else:
                        name= str(name)
        except Exception, err:
            name= str(name)
        
        t0=719164.
        self.outputdest=self.outputdest+"/"+name+".png"
        if mdt.date2num(data[0].stats.starttime) > t0:
            date="Date: " + str(data[0].stats.starttime.date)
        else:
            date=""
        fig = plt.figure()
        fig.set_size_inches(12,6)
        fig.suptitle(name)
        plt.figtext(0.1, 0.95,date)

        ax = fig.add_subplot(len(data),1,1)
        for i in xrange (len(data)):
            plt.subplot(len(data),1,i+1,sharex=ax)
            t0=719163.
            t2=mdt.date2num(data[i].stats.endtime)
            t1=mdt.date2num(data[i].stats.starttime)
            #print t1,t2,data[i].stats.npts,(t2-t1)/data[i].stats.npts
            t=np.linspace(0,data[i].stats.npts*data[i].stats.delta,
            data[i].stats.npts)
            #print data[i].stats
            #print data[0].stats.starttime.datetime
            #t=np.linspace(mdt.date2num(data[i].stats.starttime) ,
            #mdt.date2num(data[i].stats.endtime) ,
            #data[i].stats.npts)
            plt.plot(t, data[i].data,color='gray')
            #ax.set_xlim(mdt.date2num(data[0].stats.starttime), mdt.date2num(data[-1].stats.endtime))
            ax.set_xlim(0,data[i].stats.npts*data[i].stats.delta)
            #ax.xaxis.set_major_formatter(mdt.DateFormatter('%I:%M %p'))
            #ax.format_xdata = mdt.DateFormatter('%I:%M %p')

        fig1 = plt.gcf()
         
        plt.draw()
        fig1.savefig(self.outputdest)
        __file = open(self.outputdest)
        plt.close(fig1)
        fig1.clf()
        plt.close(fig1)
        del t
        gc.collect()
        
        
        self.write('output',data,location="file://"+socket.gethostname()+os.path.abspath(__file.name),format="image/png",metadata={"test":"vvvv"},attributes={'prov:type':'synthetic-waveform' })
               
            
      

if __name__ == "__main__":
    proc=WavePlot_INGV("WavePlot Script")
    proc.process();
#    None

