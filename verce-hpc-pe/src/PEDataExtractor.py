import os
import sys
import json
import pickle

class PEDataExtractor():


    
    def __init__(self,args):
         

        self.input=args

    def getDataString(self):
        doc = json.load(open(self.input[1]))
        key=None
        try:
            fromprop = self.input[2]
            key=self.input[3]
        except Exception, err:
            key=None
        
        
        string=""
        
        if fromprop == "root":
            if key!=None:
                try:
                    string= doc[key]
                except Exception, err:
                    string = None
                    
        if fromprop == "metadata":
            if key!=None:
                try:
                    string= doc["metadata"][key]
                except Exception, err:
                    string = None
        
        if fromprop == "content":
            if key!=None:
                try:
                    for x in doc["metadata"]["streams"]:
                        if key in x["content"][0].keys():
                            string+=x["content"][0][key]+" "
                except Exception, err:
                    string = None
        
        print string


if __name__ == "__main__":     
    proc = PEDataExtractor(sys.argv)
    proc.getDataString() 