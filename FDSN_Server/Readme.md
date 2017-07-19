# FDSN Event Server

This little server implements the [fdsn-event webservice](http://www.fdsn.org/webservices/) to serve events to local users. Its main purpose is to offer a search interface to a large number of QuakeML files using standard tools.

Upon launching it recursively searches the specified folder for QuakeML files and indexes some values (persistent in the shelf file) to built a trivial in-memory database which is then used for the queries.

It is pretty fast for catalogs of about 100.000 events and could easily be adapted to even larger data sets.

## Requirements

* Python 2.7
* Flask
* Flask-Cache
* [ObsPy](http://obspy.org) in a recent version

On a UNIX system you should be able to install it with pip.

```bash
$ pip install flask flask-cache
$ pip install obspy
```

If the ObsPy installation proves troublesome, please refer to the [project's homepage](http://obspy.org).

## Setup

It is not in any package repository so you will have to work with the git repository.

```bash
$ git clone https://github.com/krischer/FDSN_Event_Server.git
$ cd FDSN_Event_Server
```

The configuration is done by editing the `config.py` file and it should be self-explanatory:

```python
# If False the server is only accessible from your own computer.
PUBLIC = False

# The port the webserver will run on.
PORT = 5000

# The directory where the QuakeML files are located. The script will search
# recursively through all subfolders.
QUAKEML_ROOT_DIR = "../../data/2014_04_15--VERCE_GCMT_Catalog/quakemls/"

# A glob expression to find the actual QuakeML files. Usually "*.xml" or "*
# .qml".
QUAKEML_FILES_GLOB = "*.xml"

# The location of the shelve file to store the event information. The event
# indices are stored there so they do not have to be created each time the
# server starts.
SHELVE_DB_PATH = "event_db.shelve"

# The regex used on the resource id of the event to extract the event id. If
# not given or not found, a random one will be used. The first parenthesized
# subgroup will be used, e.g.
# event_id = re.match(REGEX_FOR_EVENT_ID, resource_id).group(1)
#
# The example will extract 'B061690B' from 'smi:local/ndk/B061690B/event'
#
# The event id is only useful when wanting to request an event via its id.
REGEX_FOR_EVENT_ID = r"\w+\:\w+\/\w+\/(\w+)"
```

The final step is to start the server.

```bash
$ python server.py
```

Once the server has started use any tool able to deal with the FDSN event webservice to query for some events. Make sure to pass the correct address and port to the server. This example utilizes ObsPy.

```python
In [1]: import obspy

In [2]: from obspy.fdsn import Client

In [3]: c = Client("http://127.0.0.1:5000")

In [4]: print c.get_events(starttime=obspy.UTCDateTime(2013,11,1), minmagnitude=6)
9 Event(s) in Catalog:
2013-11-02T18:53:52.000000Z | -19.330, -172.260 | 6.25 Mwc
2013-11-12T07:03:54.900000Z | +54.790, +162.290 | 6.5 Mwc
2013-11-13T23:45:52.700000Z | -60.500,  -47.520 | 6.03 Mwc
2013-11-16T03:34:44.000000Z | -60.540,  -47.000 | 6.88 Mwc
2013-11-17T09:05:41.000000Z | -60.490,  -45.320 | 7.78 Mwc
2013-11-19T13:32:55.500000Z |  +2.790, +128.340 | 6.11 Mwc
2013-11-19T17:00:47.300000Z | +18.540, +145.180 | 6.0 Mwc
2013-11-23T07:48:37.900000Z | -17.090, -176.380 | 6.5 Mwc
2013-11-25T06:27:45.000000Z | -54.050,  -54.590 | 6.92 Mwc
```

## Limitations

This is nothing but a collection of simple scripts so some caveats apply.

* **DO NOT OPEN THE SERVER TO THE PUBLIC** - zero effort has been put into security!
* Only one event per QuakeML file is allowed. This is only to simplify the implementation. During indexing it will warn you if it cannot read a file due to this or other issues.
* Essentially untested.
* Not a complete fdsnws-event implementation. The HTTP codes are oftentimes not correct and other issues are likely.
* The following query parameters are silently ignored: `latitude`, `longitude`, `minradius`, `maxradius` (these four are used for radial search queries which could be implemented pretty easily if desired - `minlatitude` and consorts work fine), `magnitudetype`, `catalog`, `contributor`, `updatedafter`, and `include*`.
* The database is only updated upon starting the server. So every time your
data set changes you will need to restart the server (the indexes are persistent so restarting is fairly cheap).