import sys
import httplib, urllib
from pymongo import *
import json

class provRecorderGen():
    
    def __init__(self,  args ):
        self.connection = MongoClient(host=args[1])
        self.db = self.connection["verce-prov"]
        self.collection = self.db['lineage']
        self.provfile=args[2]
        
     
        
    def updateProv(self):
        
        params = urllib.urlencode({'prov': open(self.provfile).read()})
        headers = {"Content-type": "application/json","Accept": "application/json"}
        conn = httplib.HTTPConnection("bugs.python.org")
        conn.request("POST", "", params, headers)
        response = conn.getresponse()
        print response.status, response.reason

        conn.close()
        
        


if __name__ == "__main__":
    proc=provRecorderGen(sys.argv)
    proc.updateProv();       

