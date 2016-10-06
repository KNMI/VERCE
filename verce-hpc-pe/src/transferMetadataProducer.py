import os
import sys
import json
import pickle

class transferMetadataProducer():



    def __init__(self,args):


        self.input=args

    def setProperty(self):
        doc = json.load(open(self.input[1]))
        doc.update({"target_base_url":self.input[2]})
        key = self.input[3]
        try:
            doc.update({key:doc[key]+" "+self.input[4]})
        except Exception, e:
            doc.update({key:self.input[4]})

        json.dump(doc,open(self.input[1],"wb"))


if __name__ == "__main__":
    proc = transferMetadataProducer(sys.argv)
    proc.setProperty()
