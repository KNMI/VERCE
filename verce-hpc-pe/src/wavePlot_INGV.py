from verce.processing import *
import matplotlib.pyplot as plt
import matplotlib.dates as mdt


class WavePlot_INGV(SeismoPreprocessingActivity):
    
    
    
    
    
    def compute(self):
        self.outputdest=self.outputdest+"%s" % (self.parameters["filedestination"],);
        try:
            if not os.path.exists(self.outputdest):
                os.makedirs(self.outputdest)
        except Exception,e:
            self.error+=str(e)
        
        
        
        
        name=str(self.st[0].stats.network) + "." + self.st[0].stats.station + "." + self.st[0].stats.channel
        tr = self.st[0]
         
        
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
        if mdt.date2num(self.st[0].stats.starttime) > t0:
            date="Date: " + str(self.st[0].stats.starttime.date)
        else:
            date=""
        fig = plt.figure()
        fig.set_size_inches(12,6)
        fig.suptitle(name)
        plt.figtext(0.1, 0.95,date)

        ax = fig.add_subplot(len(self.st),1,1)
        for i in xrange (len(self.st)):
            plt.subplot(len(self.st),1,i+1,sharex=ax)
            t0=719163.
            t2=mdt.date2num(self.st[i].stats.endtime)
            t1=mdt.date2num(self.st[i].stats.starttime)
            #print t1,t2,self.st[i].stats.npts,(t2-t1)/self.st[i].stats.npts
            t=np.linspace(0,self.st[i].stats.npts*self.st[i].stats.delta,
            self.st[i].stats.npts)
            #print self.st[i].stats
            #print self.st[0].stats.starttime.datetime
            #t=np.linspace(mdt.date2num(self.st[i].stats.starttime) ,
            #mdt.date2num(self.st[i].stats.endtime) ,
            #self.st[i].stats.npts)
            plt.plot(t, self.st[i].data,color='gray')
            #ax.set_xlim(mdt.date2num(self.st[0].stats.starttime), mdt.date2num(self.st[-1].stats.endtime))
            ax.set_xlim(0,self.st[i].stats.npts*self.st[i].stats.delta)
            #ax.xaxis.set_major_formatter(mdt.DateFormatter('%I:%M %p'))
            #ax.format_xdata = mdt.DateFormatter('%I:%M %p')

        fig1 = plt.gcf()
         
        plt.draw()
        fig1.savefig(self.outputdest)
        __file = open(self.outputdest)
        self.addOutput(self.st,location="file://"+socket.gethostname()+os.path.abspath(__file.name),format="image/png")
               
            
        return "true"

if __name__ == "__main__":
    proc=WavePlot_INGV("WavePlot Script")
    proc.process();
#    None

