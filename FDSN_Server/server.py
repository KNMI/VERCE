#!/usr/bin/env python
# -*- coding: utf-8 -*-

import flask
from flask.ext.cache import Cache

import inspect
import obspy
import os

import config
from event_shelve import EventShelve
import station_query

EVENT_ROOT_URL = "/fdsnws/event/1/"

STATION_ROOT_URL = "/fdsnws/station/1/"

PATH = os.path.dirname(os.path.abspath(inspect.getfile(
    inspect.currentframe())))


app = flask.Flask("FDSNEventService")
cache = Cache(app, config={"CACHE_TYPE": "simple"})

print("Initializing event shelve...")
# Init the event shelve.
event_shelve = EventShelve(
    shelve_path=config.SHELVE_DB_PATH,
    root_folder=config.QUAKEML_ROOT_DIR,
    quakeml_glob_expr=config.QUAKEML_FILES_GLOB,
    regex_expr=config.REGEX_FOR_EVENT_ID)
print("Done initializing event shelve...")


@app.route(EVENT_ROOT_URL + "version")
def version():
    """
    Return the version string of the webservice.
    """
    return "0.0.1"


@app.route(EVENT_ROOT_URL + "application.wadl")
@cache.cached()
def wadl():
    """
    Return the WADL file.
    """
    with open(os.path.join(PATH, "application.wadl"), "rb") as fh:
        wadl_string = fh.read()
    return wadl_string


@app.route(EVENT_ROOT_URL + "query")
def query():
    """
    The actual query route.
    """
    arguments = {key: value for key, value in flask.request.args.items()}

    # Map short to long arguments.
    mappings = {
        "start": "starttime",
        "end": "endtime",
        "minlat": "minlatitude",
        "maxlat": "maxlatitude",
        "minlon": "minlongitude",
        "maxlon": "maxlongitude",
        "lat": "latitude",
        "lon": "longitude",
        "minmag": "minmagnitude",
        "maxmag": "maxmagnitude",
    }
    for key, value in mappings.items():
        if key in arguments:
            arguments[value] = arguments[key]

    # Convert times.
    if "starttime" in arguments:
        arguments["starttime"] = obspy.UTCDateTime(arguments["starttime"])
    if "endtime" in arguments:
        arguments["endtime"] = obspy.UTCDateTime(arguments["endtime"])
    arguments["query_id"] = flask.request.base_url

    try:
        cat = event_shelve.query(**arguments)
    except Exception as e:
        return str(e), 500, {}


    if cat is None:
        return ("Request was properly formatted and submitted but no data "
                "matches the selection", 204, {})

    return cat

@app.route(STATION_ROOT_URL + "query")
def stations_query():

    arguments = {key: value for key, value in flask.request.args.items()}
#query?level=station&starttime=2013-01-01T00:00:00&endtime=2013-08-02T00:00:00&network=*&maxlat=0&minlon=-25&maxlon=70&minlat=-90

    try:
        cat = station_query.query(**arguments)
    except Exception as e:
        return str(e), 500, {}


    if cat is None:
        return ("Request was properly formatted and submitted but no data "
                "matches the selection", 204, {})

    return cat

if __name__ == "__main__":
    if config.PUBLIC is True:
        app.run(host="0.0.0.0", port=config.PORT)
    else:
        app.run(port=config.PORT)
"""
extra_dirs = ['directory/to/watch',]
extra_files = extra_dirs[:]
for extra_dir in extra_dirs:
    for dirname, dirs, files in os.walk(extra_dir):
        for filename in files:
            filename = path.join(dirname, filename)
            if path.isfile(filename):
                extra_files.append(filename)
app.run(extra_files=event_db.shelve)
"""