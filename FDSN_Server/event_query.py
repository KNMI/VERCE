from multiprocessing import Process, Queue
from mesh_area import getMeshArea

# event search set up to process multiple queries in parallel
def processEventsQuery(self,starttime, endtime, minlatitude, maxlatitude, minlongitude, maxlongitude,latitude, longitude, maxradius, minradius,
              mindepth, maxdepth, minmagnitude,maxmagnitude, limit, offset, event_id):

    # get a list of possible mesh areas computed from the given min/max values for latitude and longitude
    meshes = getMeshArea(minlatitude, maxlatitude, minlongitude, maxlongitude)
    found_events = Queue()
    queries=[]

    # trigger a query for each mesh
    for mesh in meshes:
        queries.append(EventSearchProcess(self,found_events,starttime, endtime, mesh.minlat, mesh.maxlat, mesh.minlon, mesh.maxlon,latitude, longitude, maxradius, minradius,
              mindepth, maxdepth, minmagnitude,maxmagnitude, limit, offset, event_id))

    for p in queries:
        p.start()

    # Get process results from the output queue
    results ={}
    [results.update(p.found_events.get()) for p in queries]
    return results

# Find all events according to the given query.
def findEvents(self,output,starttime, endtime, minlatitude, maxlatitude, minlongitude, maxlongitude,latitude, longitude, maxradius, minradius,
              mindepth, maxdepth, minmagnitude,maxmagnitude, limit, offset, event_id):
    """
           FDSN event service like queries.
    """
    found_events={}
    counter = 0
    actually_used_counter = 0
    for filename, event in self.events.iteritems():
        if (event_id is None or event["event_id"] == event_id) and \
                (starttime is None or event["time"] >= starttime) and \
                (endtime is None or event["time"] <= endtime) and \
                (minlatitude is None or
                         event["latitude"] >= float(minlatitude)) and \
                (maxlatitude is None or
                         event["latitude"] <= float(maxlatitude)) and \
                (minlongitude is None or
                         event["longitude"] >= float(minlongitude)) and \
                (maxlongitude is None or
                         event["longitude"] <= float(maxlongitude)) and \
                (mindepth is None or
                         event["depth_in_km"] >= float(mindepth)) and \
                (maxdepth is None or
                         event["depth_in_km"] <= float(maxdepth)) and \
                (minmagnitude is None or
                         event["magnitude"] >= float(minmagnitude)) and \
                (maxmagnitude is None or
                         event["magnitude"] <= float(maxmagnitude)):
            """
            counter += 1
            if counter <= offset:
                continue
            actually_used_counter += 1
            if limit is not None and limit >= actually_used_counter:
                break
            """
            found_events[filename] = event

    if output:
        output.put(found_events)
    else:
        return found_events;

    def __del__(self):
        self._s.close()

class EventSearchProcess(Process):
    def __init__(self,events,found_events,starttime, endtime, minlat, maxlat, minlon, maxlon,latitude, longitude, maxradius, minradius,
              mindepth, maxdepth, minmagnitude,maxmagnitude, limit, offset, event_id):
        super(EventSearchProcess, self).__init__()
        self.events=events
        self.starttime = starttime
        self.endtime = endtime
        self.minlat = minlat
        self.maxlat = maxlat
        self.minlon = minlon
        self.maxlon = maxlon
        self.latitude = latitude
        self.longitude = longitude
        self.maxradius = maxradius
        self.minradius = minradius
        self.mindepth = mindepth
        self.maxdepth = maxdepth
        self.minmagnitude = minmagnitude
        self.maxmagnitude = maxmagnitude
        self.limit = limit
        self.offset = offset
        self.event_id = event_id
        self.found_events = found_events

    def run(self):

        findEvents(self.events, self.found_events,self.starttime, self.endtime, self.minlat, self.maxlat, self.minlon, self.maxlon, self.latitude, self.longitude, self.maxradius,
                   self.minradius, self.mindepth, self.maxdepth, self.minmagnitude, self.maxmagnitude, self.limit, self.offset, self.event_id)

