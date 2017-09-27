import requests
from multiprocessing import Queue,Process
from mesh_area import getMeshArea
from lxml import etree

# FDSN nodes, currently contains IRIS but can easily accommodate other FDSN providers
FDSN_NODES = {"iris" : "http://service.iris.edu"}

# this handles station and network queries and
# determines whether to trigger a single or a multiple station search request
def query(starttime=None, endtime=None, minlat=None, maxlat=None, minlon=None, maxlon=None, network=None, level=None, provider=None, **kwargs):

    if provider in FDSN_NODES.keys():
        provider_url=FDSN_NODES[provider]
    else:
        return "No provider with the name <b>"+ provider +" </b> is found"

    if level=='network':
        return networkSearchRequest(provider_url)

    if level == 'station':
        if float(minlat) < -90 or float(maxlat) > 90 or float(minlon) < -180 or float(
                maxlon) > 180:
            # only process a search if min/max values does not exceed -360 or 360 for longitude  and  -180 or 180 for latitude
            if float(minlat) >= -180 or float(maxlat) <= 180 or float(minlon) >= -360 or float(
                    maxlon) <= 360:
                return processStationsQuery(starttime, endtime, minlat, maxlat, minlon, maxlon, network,provider_url)
        else:
            return stationSearchRequest(starttime, endtime, minlat, maxlat, minlon, maxlon, network,provider_url)

# to process a network search request
def networkSearchRequest(provider):
    response = requests.get(
        provider+"/fdsnws/station/1/query?level=network")

    return response.content

# to make a search request with the given query parameters.
def stationSearchRequest(starttime, endtime, minlat, maxlat, minlon, maxlon, network, provider,output=None):
    response = requests.get(
        provider+"/fdsnws/station/1/query?level=station&starttime=" + str(starttime) + "&endtime=" + str(
            endtime) + "&network=" + network + "&maxlat=" + str(maxlat) + "&minlon=" + str(minlon) + "&maxlon=" + str(
            maxlon) + "&minlat=" + str(minlat))
    if output:
        output.put([response.content])
    else:
        return response.content

# process all queries in a parallel way
def processStationsQuery(starttime, endtime, minlat, maxlat, minlon, maxlon, network,provider):
    # get a list of computed mesh areas
    meshes = getMeshArea(minlat, maxlat, minlon, maxlon)
    output = Queue()
    queries = []

    # trigger a query for each mesh
    for mesh in meshes:
        queries.append(
            StationSearchProcess(output, starttime, endtime, mesh.minlat, mesh.maxlat, mesh.minlon,
                                                 mesh.maxlon, network,provider))

    for p in queries:
        p.start()

    # Get process results from the output queue
    searchResults = [p.output.get()[0] for p in queries]

    return combineSearchResponse(searchResults)


# find all network nodes returned by each query and combine them in a single result
def combineSearchResponse(searchResults):

    if searchResults:
        firstResult=etree.fromstring(searchResults[0])
    else:
        return None

    namespace_tag = "{http://www.fdsn.org/xml/station/1}"
    headerTags = "<FDSNStationXML xmlns=\"http://www.fdsn.org/xml/station/1\" schemaVersion=\"1.0\" xsi:schemaLocation=\"http://www.fdsn.org/xml/station/1 http://www.fdsn.org/xml/station/fdsn-station-1.0.xsd\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:iris=\"http://www.fdsn.org/xml/station/1/iris\">"\
                 "<Source>"+firstResult.find(namespace_tag+'Source').text+"</Source> \n" \
                 "<Sender>"+firstResult.find(namespace_tag+'Sender').text+"</Sender> \n" \
                 "<Module>"+firstResult.find(namespace_tag+'Module').text+"</Module> \n" \
                 "<Created>"+firstResult.find(namespace_tag+'Created').text+"</Created> \n"
    endTag ="</FDSNStationXML>"
    networks=""
    queries=""

    for result in searchResults:
        context = etree.fromstring(result)
        queries+=context.find(namespace_tag + 'ModuleURI').text.replace("&","&amp;")+"\n"
        for network in context.findall(namespace_tag+'Network'):
            networks+=etree.tostring(network)

    return headerTags+"<ModuleURI>"+queries+"</ModuleURI> \n"+networks+endTag

# station search process set up
class StationSearchProcess(Process):

    def __init__(self, output, starttime, endtime, minlat, maxlat, minlon, maxlon, network,provider):
        super(StationSearchProcess, self).__init__()
        self.output = output
        self.starttime = starttime
        self.endtime = endtime
        self.minlat = minlat
        self.maxlat = maxlat
        self.minlon = minlon
        self.maxlon = maxlon
        self.network = network
        self.provider=provider

    def run(self):
        stationSearchRequest(self.starttime, self.endtime, self.minlat, self.maxlat, self.minlon,
                             self.maxlon, self.network, self.provider, self.output)




"""
Other FDNS nodes:
    "odc": "http://www.orfeus-eu.org"
    "gfz" : "https://geofon.gfz-potsdam.de"
    "resif" : "http://ws.resif.fr"
    "ethz" : "http://eida.ethz.ch"
    "bgr" : "http://eida.bgr.de"
    "niep" : "http://eida-sc3.infp.ro"
    "koeri" : "http://eida-service.koeri.boun.edu.tr"
    "ipgp" : "http://eida.ipgp.fr"
    "lmu" : "http://erde.geophysik.uni-muenchen.de"
    "noa" : "http://eida.gein.noa.gr"
    "ingv" : "http://webservices.rm.ingv.it"
    "ncedc" : "http://service.ncedc.org"
    "edp": "http://www.seismicportal.eu"

"""