from verce.processing import *
from obspy.core.quakeml import *
from wfs_input_generator import InputFileGenerator
import json

class inputGenerator(SeismoPreprocessingActivity):
    
    def extractEventMetadata(self,outputdir,event):
        try:
            dict={"path":str(outputdir)}    
            dict.update({'prov:type':'earthquake' })
            for ev in event: 
                for attr, value in ev.iteritems():
                    try:
                        if type(value)==obspy.core.utcdatetime.UTCDateTime:
                            dict.update({attr:str(value)});
                        else:
                            dict.update({attr:float(value)});
                    except Exception,e:
                        dict.update({attr:str(value)});
        except Exception,e:
            dict={}
            traceback.print_exc(file=sys.stderr)
         
        return dict
        
    
    def importInputData(self):
        None
     
    def strToBool(self,value):
        if value=="true":
           return True
        if value=="false":
           return False
        return value


    def compute(self):
        gen = InputFileGenerator()
        userconf = json.load(open(self.parameters["solver_conf_file"]))

        fields = userconf["fields"]

        for x in fields:
            gen.add_configuration({x["name"]:self.strToBool(x["value"])})    
    
        with open (self.parameters["quakeml"], "r") as events:
            quakeml=events.read()

        unicode_qml=quakeml.decode('utf-8')
        data = unicode_qml.encode('ascii','ignore')

##

        cat=readQuakeML(data)
        events = []
        cat = obspy.readEvents(data)
#Remove all events with no moment tensor.
        for event in cat:
            for fm in event.focal_mechanisms:
                if fm.moment_tensor and fm.moment_tensor.tensor:
                    events.append(event)
                    break
        cat.events = events

        gen.add_events(cat)

        evn=0
        outputdir=""
        for x in userconf["events"]:
            gen.event_filter=[x]
        
            if self.parameters["station_format"]=="stationXML":
                gen.add_stations(self.parameters["stations_file"])
                
        
            if self.parameters["station_format"]=="points":
                stlist = []
                with open(self.parameters["stations_file"]) as f:
                    k=False
                    for line in f:
                        
                        if (k==False):
                            k=True
                        else:
                            station={}
                            l=line.strip().split(" ")
                            station.update({"id":l[1]+"."+l[0]})           
                            station.update({"latitude":float(l[3])})
                            station.update({"longitude":float(l[2])})
                            station.update({"elevation_in_m":float(l[4])})
                            station.update({"local_depth_in_m":float(l[5])})
                            stlist.append(station)
                        
                        
                gen.add_stations(stlist)
                        
            gen.station_filter = userconf["stations"]
                        
            outputdir=self.outputdest+userconf["runId"]+"/"+userconf["runId"]+"_"+str(evn)+"/DATA"
            output_files = gen.write(format=userconf["solver"], output_dir=outputdir)
            
            
            locations = []
            for x in output_files.keys():
                locations.append("file://"+socket.gethostname()+outputdir+"/"+x)
                
            
            self.addOutput(gen._filtered_events,location=locations,metadata=self.extractEventMetadata(outputdir,gen._filtered_events),control={"con:immediateAccess":"true"})
        
            evn+=1
         
        self.addOutput(outputdir,location=locations,metadata={"to_xdecompose":str(outputdir)},control={"con:immediateAccess":"true"})
         

        


if __name__ == "__main__":
    proc=inputGenerator("inputGenerator")
    proc.process();