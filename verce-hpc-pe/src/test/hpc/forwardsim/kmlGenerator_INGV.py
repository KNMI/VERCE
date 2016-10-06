import matplotlib.pyplot as plt
import dispel4py
from dispel4py.provenance import *
import matplotlib.dates as mdt
import zipfile
import os
import socket
import traceback


def template_kml_start(name,namefolder=None):
    if not namefolder: namefolder=name
    kml = """<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
    <Document>
        <name>%s </name>
        <atom:author>      
          <atom:name>Emanuele Casarotti, Istituto Nazionale di Geofisica e Vulcanologia</atom:name>    
        </atom:author>    
        <atom:link href="http://www.ingv.it" />
        <open>1</open>
    <StyleMap id="BStyle">
        <Pair>
            <key>normal</key>
            <styleUrl>#BStyle0</styleUrl>
        </Pair>
        <Pair>
            <key>highlight</key>
            <styleUrl>#BStyle1</styleUrl>
        </Pair>
    </StyleMap>
    <Style id="BStyle0">
        <IconStyle>
            <color>ffff8000</color>
            <Icon>
                <href>http://maps.google.com/mapfiles/kml/shapes/triangle.png</href>
            </Icon>
        </IconStyle>
        <BalloonStyle>
            <text>$[description]</text>
        </BalloonStyle>
        <ListStyle>
        </ListStyle>
    </Style>
    <Style id="BStyle1">
        <IconStyle>
            <color>ffffff00</color>
            <Icon>
                <href>http://maps.google.com/mapfiles/kml/shapes/triangle.png</href>
            </Icon>
        </IconStyle>
        <BalloonStyle>
            <text>$[description]</text>
        </BalloonStyle>
        <ListStyle>
        </ListStyle>
    </Style>
    <Style id="BStyle2">
        <BalloonStyle>
            <text>$[description]</text>
        </BalloonStyle>
    </Style>
    <Style id="epicenter">
        <IconStyle>
            <color>ff0000ff</color>
            <scale>0.9</scale>
            <Icon>
                <href>http://maps.google.com/mapfiles/kml/shapes/star.png</href>
            </Icon>
        </IconStyle>
        <LabelStyle>
            <color>ff0080ff</color>
            <scale>0.5</scale>
        </LabelStyle>
        <ListStyle>
        </ListStyle>
        <BalloonStyle>
            <text>$[description]</text>
        </BalloonStyle>
    </Style>
    <Folder><name>%s</name>
    """%(name,namefolder)
    return kml

def template_kml_placemark(st,filename,lon,lat,z):
    kml = '''<Placemark>
                <name>%s</name>
                <styleUrl>#BStyle</styleUrl> 
                <description><![CDATA[Synthetics <h3>Displacement<br> <img class="imageStyle"  src="%s" width="420" /><img class="imageStyle"  src="%s" width="420" /><img class="imageStyle"  src="%s" width="420" /><br>
                Velocity<br> <img class="imageStyle"  src="%s" width="420" /><img class="imageStyle"  src="%s" width="420" /><img class="imageStyle"  src="%s" width="420" /><br>
                Acceleration<br> <img class="imageStyle"  src="%s" width="420" /><img class="imageStyle"  src="%s" width="420" /><img class="imageStyle"  src="%s" width="420" /><br>
]]></description>
                  <Point>
                    <coordinates>%s,%s,%s</coordinates>
                  </Point>
             </Placemark>
             ''' %(st,filename[0],filename[1],filename[2],filename[3],filename[4],filename[5],filename[6],filename[7],filename[8],lon,lat,z)
    return kml

def template_kml_close():
    kml='''</Folder>
           </Document>
           </kml>'''
    return kml

def template_epicenter(txt,lon,lat,z):
    kml='''
    </Folder>
    <Folder>
    <name>Earthquake</name>
    <open>1</open>
    <Placemark>
        <name>Epicenter</name>
        <description><![CDATA[Event <br>
        %s]]>
        </description>
        <styleUrl>epicenter</styleUrl>
        <Point>
            <coordinates>%s,%s,%s</coordinates>
        </Point>
    </Placemark>''' % (txt,lon,lat,z)
    return kml

def get_station_code(dt):
    if (dt <= 1e-3):
        code='F'
    elif (1e-3<dt<=4e-3):
        code='C'
    elif (4e-3<dt<=.0125):
        code='H'
    elif (.0125<dt<=.1):
        code='B'
    elif (.1<dt<1):
        code='M'
    elif (1<=dt):
        code='L'
    return code

import re
regex = re.compile("DT\s+\=(.+)")


class kmlGenerator_INGV(IterativePE):
    
    
     

    
    def _process(self,inputs):
        self.buildDerivation(inputs["streams"][0])
        stationsfile=self.parameters["stations_filtered"]
        cmtsolution=self.parameters["cmt_solution"]
        par=self.parameters["par_file"]
        f=open(stationsfile,'r')
        c=open(cmtsolution,'r')
        p=open(par,'r')
        p=p.read()
        dt=float(regex.findall(p)[0])
        stations=f.readlines()
        cmt=c.read()
        cmtdata=cmt.split('\n')
        late=cmtdata[4].split(':')[1].strip()
        lone=cmtdata[5].split(':')[1].strip()
        cmt=cmt.replace('\n','<br>')
        cmt=cmt.replace('event name:','<br>event name:')
        cmt=cmt.replace('Mrr:','<br>Mr:')
        code=get_station_code(dt)

        comp=[code+x for x in ['XE','XN','XZ']]


        images_path=self.parameters["images_path"]
        dict_stations={}
        tmp_kml=''
        for s in stations:
            st,net,lat,lon,z,v=s.split()
            dict_stations[st]={'network':net,'latitude':lat,'longitude':lon,'depth':z,'buried':v}
            filenames=[]
            for j in ['displacement','velocity','acceleration']:
                for i in comp:
                    fname=net+'.'+st+'.'+i+'.'+j+'.png'
                    filenames.append(fname)
            dict_stations[st]={'network':net,'latitude':lat,'longitude':lon,'depth':z,'buried':v,'png':filenames}
            tmp_kml=tmp_kml+template_kml_placemark(st,filenames,lon,lat,z)
    
        kml=template_kml_start('')+tmp_kml+template_epicenter(cmt,lone,late,'0')+template_kml_close()

        head,tail=os.path.split(stationsfile)
        
        destination=head+"/../"+images_path+'synthetics.kml'
        f=open(destination,'w')
        f.write(kml)
        f.flush()
        f.close()
        
        print "Producing kml zip file"
        
       
        zf = zipfile.ZipFile(head+"/../OUTPUT_FILES/"+self.runId+".kmz", mode='w')
        try:
            path=head+"/../"+images_path
            for  dir_entry in os.listdir(path):
                 
                    dir_entry_path = os.path.join(path, dir_entry)
                    
                    zf.write(dir_entry_path, dir_entry_path[len(path):] if dir_entry_path.startswith(path) else dir_entry_path)
        finally:
            print 'closing'
            self.log(traceback.format_exc())
            zf.close()
            
             
        self.write('output',head+"/../OUTPUT_FILES/"+self.runId+".kmz",location="file://"+socket.gethostname()+head+"/../OUTPUT_FILES/"+self.runId+".kmz",format="application/vnd.google-earth.kmz")
              
            
        