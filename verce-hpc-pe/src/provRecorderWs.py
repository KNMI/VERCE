import sys
import httplib, urllib
import json

class provRecorderWs():
    
    def __init__(self,  args ):
        self.connection = httplib.HTTPConnection(args[1],args[2])
        self.provfile=args[3]
        
     
        
    def updateProv(self):
        
        params = urllib.urlencode({'prov': open(self.provfile).read()})
        headers = {"Content-type": "application/x-www-form-urlencoded","Accept": "application/json"}
        self.connection.request("POST", "/workflow/insert", params, headers)
         
        response = self.connection.getresponse()
        print response.status, response.reason, response, response.read()

        self.connection.close()
        
        


if __name__ == "__main__":
    proc=provRecorderWs(sys.argv)
    proc.updateProv();       

