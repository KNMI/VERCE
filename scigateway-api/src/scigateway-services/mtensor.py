from pymongo import *
from obspy.imaging.beachball import Beachball
import json
import uuid
import base64
import os.path
import urllib


' test localhost:8082/mt/components-image?mrr=358&mpp=72&mtt=-155&mrt=312&mrp=43&mtp=44&id=testmtxx'

class MtStore(object):

    def __init__(self, path,):
        self.__imagespath__=path+"mt/";
        
#        self.conection = MongoClient(host=url)
#        self.db = self.conection["verce-prov"]
#        self.collection = self.db['lineage']
        None        
    
    def produceImage(self, strike=None, dip=None, rake=None,mrr=None,mtt=None,mpp=None,mrt=None,mtp=None,mrp=None):
        
        mt=[]
        filename=None
        if (strike!=None and dip!=None and rake!=None):
            mt = [strike, dip, rake]
            filename=base64.urlsafe_b64encode(str(strike)+"-"+str(dip)+"-"+str(rake))+".png"
        
        else:
            if (mrr!=None and mtt!=None and mpp!=None and mrt!=None and mrp!=None and mtp!=None):
                mt= [mrr,mtt,mpp,mrt,mrp,mtp]
                filename=base64.urlsafe_b64encode(str(mrr)+"-"+str(mtt)+"-"+str(mpp)+"-"+str(mrt)+"-"+str(mrp)+"-"+str(mtp))+".png"
        
        
        
        
        
            
        outfile=self.__imagespath__+filename;
        
        if os.path.isfile(outfile)!=True:
            Beachball(mt, size=100, linewidth=2, facecolor='r',outfile=outfile)
            
         
        
    
        return  outfile
    
    def getImage(self, id, start,limit):
        
         
        output=None
        
         
    
        return  output
     
    
    
#    