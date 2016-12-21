from twisted.web import server, resource, http, static
import mtensor
import solver_par_files
import json
import csv
import StringIO
from twisted.web.util import redirectTo
import cgi
import locale
from twisted.python import log

 
class RootResource(resource.Resource):

    def __init__(self, mtstore, solvergen):
        self.mtstore = mtstore
        self.solvergen = solvergen
        resource.Resource.__init__(self)
        self.putChild('mt', MomentTensorHandler(self.mtstore))
        self.putChild('solver', SolverHandler(self.solvergen))
          
              
 
    def getChild(self, path, request):
        return None


class MomentTensorHandler(resource.Resource):

    def __init__(self, store):
        self.store = store
        resource.Resource.__init__(self)
 
    def getChild(self, path, request):
        return MomentTensor(self.store, path) 
 
    
class SolverHandler(resource.Resource):

    def __init__(self, store):
        self.store = store
        resource.Resource.__init__(self)
        self.putChild('par-file', SolverParFileHandler(self.store))
        
 
    def getChild(self, path, request):
         
        return None

class SolverParFileHandler(resource.Resource):

    def __init__(self, store):
        
        self.store = store
        resource.Resource.__init__(self)
        
         
    def getChild(self, path, request):
        
        return SolverParFile(self.store, path)


class EmptyChild(resource.Resource):
    def __init__(self, path):
        self.path = path
        resource.Resource.__init__(self)
 
    def render_GET(self, request):
	    return ""
 
    def render_POST(self, request):
         
    	return ""
 
    def getChild(self, path, request):
        return EmptyChild(path)
 
 
 
class MomentTensor(resource.Resource):
    def __init__(self, store, path):
        self.store = store
        self.path = path
        resource.Resource.__init__(self)
 
    def render_GET(self, request):
        request.setHeader('Content-type', 'image/png')
        imageloc=None
        
        if self.path=="components-image":
         
            mrr = request.args['mrr'][0]
            mtt = request.args['mtt'][0]
            mpp = request.args['mpp'][0]
            mrt = request.args['mrt'][0]
            mrp = request.args['mrp'][0]
            mtp = request.args['mtp'][0]
            imageloc= self.store.produceImage(id,mrr=float(mrr),mtt=float(mtt),mpp=float(mpp),mrt=float(mrt),mrp=float(mrp),mtp=float(mtp))
          
        if self.path=="nodal-plane-image":
         
            strike = request.args['strike'][0]
            dip = request.args['dip'][0]
            rake = request.args['rake'][0]
            imageloc= self.store.produceImage(strike=float(strike),dip=float(dip),rake=float(rake))
        
        f = open(imageloc)
        return request.write(f.read());
        '    redirectTo(imageloc,request) '
            
    
    def getChild(self, path, request):
        return EmptyChild(path)
    

class SolverParFile(resource.Resource):
    def __init__(self, store, path):
        self.solvergen = store
        self.path = path
        resource.Resource.__init__(self)
        
        
    def render_POST(self, request):
        request.setHeader('Content-type', 'application/octet-stream')

        if self.path == "specfem3d_cartesian_202_dev":
            return self.solvergen.produceFileSpecfem_202_DEV(json.loads(str(request.args["jsondata"].pop(0))))

        if self.path == "specfem3d_globe":
            return self.solvergen.produceFileSpecfem_globe(json.loads(str(request.args["jsondata"].pop(0))))
            
    
    def getChild(self, path, request):
        return EmptyChild(path)


    'Launch instructions '
    'python webserver.py <output file path>'

    'dev :python webserver.py "/Users/aspinuso/runtime/apache-tomcat-7.0.32/webapps/intermediate/mt/" "http://localhost:8080/intermediate/mt/"'
 
if __name__ == "__main__":
    import sys
    from twisted.internet import reactor
    mtstore = mtensor.MtStore(sys.argv[1])
    solvergen =solver_par_files.SolverParfile(sys.argv[1])
    reactor.listenTCP(8083, server.Site(RootResource(mtstore,solvergen)))
    print("Logging to webserver.out")
    log.startLogging(open("webserver.out", 'a'))
    log.msg("Server running....")
    reactor.run()
    
    
