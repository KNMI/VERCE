import json
import sys

class PEProvenanceMerge():


    
    def __init__(self,args):
         

        self.input=args

    def mergeProvenance(self):
        
        provenancebulk=[]
        for x in self.input:
            try:
                provenancebulk+=json.load(open(x))
            except Exception, error:
                None
        
        print json.dumps(provenancebulk)        
        filep = open("provenancebulk","wr")
        filep.write(json.dumps(provenancebulk))
        


if __name__ == "__main__":     
    proc = PEProvenanceMerge(sys.argv)
    proc.mergeProvenance()