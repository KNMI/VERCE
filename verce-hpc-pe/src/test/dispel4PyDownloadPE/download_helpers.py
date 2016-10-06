#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Download helpers.

:copyright:
    Lion Krischer (krischer@geophysik.uni-muenchen.de), 2014
:license:
    GNU Lesser General Public License, Version 3
    (http://www.gnu.org/copyleft/lesser.html)
"""
import sys
import itertools
import traceback
import copy
import collections
import logging
import lxml.etree
from multiprocessing.pool import ThreadPool
import os
import time
import warnings

import obspy
from obspy.core.util.obspy_types import OrderedDict
from obspy.fdsn.header import URL_MAPPINGS, FDSNException
from obspy.fdsn import Client

from . import utils

# Setup the logger.
logger = logging.getLogger("obspy-download-helper")
logger.setLevel(logging.DEBUG)
# Prevent propagating to higher loggers.
logger.propagate = 0
# Console log handler.
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
# Add formatter
FORMAT = "[%(asctime)s] - %(name)s - %(levelname)s: %(message)s"
formatter = logging.Formatter(FORMAT)
ch.setFormatter(formatter)
logger.addHandler(ch)


class FDSNDownloadHelperException(FDSNException):
    pass


class Restrictions(object):
    """
    Class storing non-domain restrictions of a query.
    :param starttime: The starttime of the data.
    :param endtime: The endtime of the data.
    :param network: The network code.
    :param station: The station code.
    :param location: The location code.
    :param channel: The channel code.
    :param reject_channels_with_gaps: If True (default), MiniSEED files with
        gaps and/or overlaps will be deleted.
    :param minimum_length: The minimum length of the data as a fraction of
        the requested time frame. After a channel has been downloaded it
        will be checked that its total length is at least that fraction of
        the requested time span. Will be deleted otherwise.
    :param minimum_interstation_distance_in_m: The minimum inter-station
        distance. Data from any new station closer to any existing station
        will not be downloaded. Also used for duplicate station detection as
        sometimes stations have different names for different webservice
        providers.
    :param channel_priorities: Priority list for the channels.
    :param location_priorities: Priority list for the locations.
    """
    def __init__(self, starttime, endtime, network=None, station=None,
                 location=None, channel=None, reject_channels_with_gaps=True,
                 minimum_length=0.9, minimum_interstation_distance_in_m=1000,
                 channel_priorities=("HH[Z,N,E]", "BH[Z,N,E]",
                                     "MH[Z,N,E]", "EH[Z,N,E]",
                                     "LH[Z,N,E]"),
                 location_priorities=("", "00", "10")):
        self.starttime = obspy.UTCDateTime(starttime)
        self.endtime = obspy.UTCDateTime(endtime)
        self.network = network
        self.station = station
        self.location = location
        self.channel = channel
        self.reject_channels_with_gaps = reject_channels_with_gaps
        self.minimum_length = minimum_length
        self.channel_priorities = channel_priorities
        self.location_priorities = location_priorities
        self.minimum_interstation_distance_in_m = \
            float(minimum_interstation_distance_in_m)


class DownloadHelper(object):
    """
    Class facilitating data acquistion across all FDSN web service
    implementation.

    :param providers: List of FDSN client names or service URLS. Will use
        all FDSN implementations known to ObsPy if set to None. The order
        in the list also determines their priority, if data is available at
        more then one provider it will always be downloaded from the
        provider that comes first in the list.
    """
    def __init__(self, providers=None):
        # Bit of a hack!
        URL_MAPPINGS["INGV"] =  "http://webservices.rm.ingv.it"
        
        if providers is None:
            providers = dict(URL_MAPPINGS.items())
            # In that case make sure IRIS is first, and ORFEUS second! The
            # remaining items will be sorted alphabetically.
            _p = []
          #  del providers["ORFEUS"]
            if "IRIS" in providers:
                _p.append("IRIS")
                del providers["IRIS"]
            #if "ORFEUS" in providers:
            #    _p.append("ORFEUS")
            #del providers["ODC"]
            del providers["ORFEUS"]
            _p.extend(sorted(providers))
            providers = _p
            
        self.providers = tuple(providers)

        # Initialize all clients.
        self._initialized_clients = OrderedDict()
        self.__initialize_clients()

    def download(self, domain, restrictions, chunk_size_in_mb=50,
                 threads_per_client=5, mseed_path=None,
                 stationxml_path=None):
        # Collect all the downloaded stations.
        existing_stations = set()
        report = []
        discarded_stationids = set()
        
        # Do it sequentially for each client. Doing it in parallel is not
        # really feasible as long as the availability queries are not reliable.
        for client_name, client in self._initialized_clients.items():
            logger.info("Stations already acquired during this run: %i" %
                        len(existing_stations))
            info={}
            try:
                
                info = utils.get_availability_from_client(
                                                          client, client_name, restrictions, domain, logger)
                availability = info["availability"]
            except:
                info['availability'] = False
            
            if not info["availability"]:
                availability = []
            else:
                availability = availability.values()

            # First filter stage. Remove stations based on the station id,
            # e.g. NETWORK.STATION. Remove all that already exist and all
            # the are in the discarded station ids set.
            availability = utils.filter_stations_based_on_duplicate_id(
                existing_stations, discarded_stationids, availability)
            logger.info("Client '%s' - After discarding duplicates based on "
                        "the station id, %i stations remain." % (
                        client_name, len(availability)))
            # If nothing is there, no need to keep going.
            if not availability:
                report.append({"client": client_name, "data": []})
                continue

            # Filter based on the distance to the next closest station. If
            # info["reliable"] is True, it is assumed that we can actually
            # get all the data in the availability, otherwise everything
            # will be attempted to be downloaded.
            f = utils.filter_based_on_interstation_distance(
                existing_stations=existing_stations,
                new_stations=availability,
                reliable_new_stations=info["reliable"],
                minimum_distance_in_m=
                restrictions.minimum_interstation_distance_in_m)
            # Add the rejected stations to the set of discarded station ids
            # so they will not be attempted to be downloaded again.
            for station in f["rejected_stations"]:
                discarded_stationids.add((station.network, station.station))
            availability = f["accepted_stations"]

            logger.info("Client '%s' - %i station(s) satisfying the "
                        "minimum inter-station distance found." % (
                        client_name, len(availability)))
            if not availability:
                report.append({"client": client_name, "data": []})
                continue

            # Now attach filenames to the channel objects, and split into a
            # set of existing and non-existing data files.
            f = utils.attach_miniseed_filenames(availability, mseed_path)
            mseed_availability = f["stations_to_download"]
            existing_miniseed_filenames = f["existing_miniseed_filenames"]

            if not mseed_availability and not existing_miniseed_filenames:
                logger.info("Nothing to be done for client %s." %
                            client_name)
                report.append({"client": client_name, "data": []})
                continue

            logger.info("Client '%s' - MiniSEED data from %i channels "
                        "already exists." % (
                        client_name, len(existing_miniseed_filenames)))
            logger.info("Client '%s' - MiniSEED data from %i channels "
                        "will be downloaded." % (
                        client_name, sum(len(_i.channels) for _i in
                                         mseed_availability)))

            # Download the missing channels and get a list of filenames
            # that just got downloaded.
            if mseed_availability:
                a = time.time()
                downloaded_miniseed_filenames = self.download_mseed(
                    client, client_name, mseed_availability, restrictions,
                    chunk_size_in_mb=chunk_size_in_mb,
                    threads_per_client=threads_per_client)
                b = time.time()
                f = sum(os.path.getsize(_i) for _i in
                        downloaded_miniseed_filenames)
                f_kb = f / 1024.0
                f_mb = f_kb / 1024.0
                logger.info("Client '%s' - Downloaded %i MiniSEED files "
                            "(%.2f MB) in %.1f seconds (%.1f KB/sec)" % (
                            client_name,
                            len(downloaded_miniseed_filenames), f_mb,
                            b - a, f_kb / (b - a)))
            else:
                downloaded_miniseed_filenames = []

            # Parse the just downloaded and existing MiniSEED files and
            # thus create a list of stations that require StationXML files.
            available_miniseed_data = self._parse_miniseed_filenames(
                downloaded_miniseed_filenames +
                existing_miniseed_filenames, restrictions)

            # Stations will be list of Stations with Channels that all
            # need a StationXML file. This is necessary as MiniSEED data
            # might not be available for all stations.
            station_availability = utils.filter_stations_with_channel_list(
                availability, available_miniseed_data)
            f = utils.attach_stationxml_filenames(
                stations=station_availability,
                restrictions=restrictions, stationxml_path=stationxml_path,
                logger=logger)
            existing_stationxml_channels = f["existing_stationxml_contents"]
            stations_availability = f["stations_to_download"]

            logger.info("Client '%s' - StationXML data for %i stations ("
                        "%i channels) already exists." % (client_name,
                        len(set((_i.network, _i.station) for _i in
                                existing_stationxml_channels)),
                        len(existing_stationxml_channels)))
            logger.info("Client '%s' - StationXML data for %i stations ("
                        "%i channels) will be downloaded." % (
                        client_name, len(stations_availability), sum(len(
                        _i.channels) for _i in stations_availability)))

            # Now actually download the missing StationXML files.
            if stations_availability:
                i = self.download_stationxml(
                    client, client_name, stations_availability,
                    restrictions, threads_per_client)
                b = time.time()
                f = sum(os.path.getsize(_i) for _i in i)
                f_kb = f / 1024.0
                f_mb = f_kb / 1024.0
                #logger.info("Client '%s' - Downloaded %i StationXML files "
                #            "(%.2f MB) in %.1f seconds (%.1f KB/sec)" % (
                #                client_name,
                #                len(i), f_mb,
                #                b - a, f_kb / (b - a)))

                downloaded_stationxml_channels = []
                for _i in i:
                    try:
                        downloaded_stationxml_channels.extend(
                            utils.get_stationxml_contents(_i))
                    except lxml.etree.Error:
                        logger.error("StationXML file '%s' is not a valid "
                                     "XML file. Will be deleted." % i)
                        utils.safe_delete(i)
            else:
                downloaded_stationxml_channels = []

            # Collect all StationXML channels in a dictionary..
            available_stationxml_channels = collections.defaultdict(list)
            for i in existing_stationxml_channels + \
                    downloaded_stationxml_channels:
                available_stationxml_channels["%s.%s" % (i.network,
                                                         i.station)].append(i)

            # Do the same for the MiniSEED data while also removing MiniSEED
            # files that have no corresponding station file.
            available_miniseed_channels = collections.defaultdict(list)
            for mseed in available_miniseed_data:
                station_id = "%s.%s" % (mseed.network, mseed.station)
                if station_id not in available_stationxml_channels:
                    msg = "No station file for '%s'. Will be deleted."
                    logger.warning(msg % mseed.filename)
                    utils.safe_delete(mseed.filename)
                    continue
                station = available_stationxml_channels[station_id]
                # Try to find the correct timespan!
                found_ts = False
                for channel in station:
                    if (channel.location == mseed.location) and \
                            (channel.channel == mseed.channel) and \
                            (channel.starttime <= mseed.starttime) and \
                            (channel.endtime >= mseed.endtime):
                        found_ts = True
                        break
                if found_ts is False:
                    msg = "No corresponding station file could be " \
                          "retrieved for '%s'. Will be deleted."
                    logger.warning(msg % mseed.filename)
                    utils.safe_delete(mseed.filename)
                available_miniseed_channels[station_id].append(utils.Channel(
                    mseed.location, mseed.channel, mseed.filename
                ))

            # Assemble everything that has been downloaded for this loop
            # iteration including station and channel filenames.
            stations_for_loop = set()
            for station in availability:
                station_id = "%s.%s" % (station.network, station.station)
                if station_id not in available_stationxml_channels or \
                        station_id not in available_miniseed_channels:
                    continue
                station = copy.deepcopy(station)
                station.stationxml_filename = \
                    available_stationxml_channels[station_id][0].filename
                station.channels = available_miniseed_channels[station_id]
                stations_for_loop.add(station)

            if not stations_for_loop:
                report.append({"client": client_name, "data": []})
                continue

            if info["reliable"]:
                report.append({"client": client_name, "data": copy.copy(
                    stations_for_loop)})
                existing_stations = existing_stations.union(stations_for_loop)
            else:
                f = utils.filter_based_on_interstation_distance(
                    existing_stations, stations_for_loop,
                    reliable_new_stations=True,
                    minimum_distance_in_m=
                    restrictions.minimum_interstation_distance_in_m)
                report.append({"client": client_name, "data": copy.copy(
                    f["accepted_stations"])})
                existing_stations = existing_stations.union(f[
                    "accepted_stations"])

                if f["rejected_stations"]:
                    logger.info("Data from %i stations does not fulfill the "
                                "minimum inter-station distance requirement. "
                                "It will be deleted." %
                                len(f["rejected_stations"]))

                for station in f["rejected_stations"]:
                    discarded_stationids.add((station.network,
                                              station.station))

                    logger.info("Deleting '%s'." %
                                station.stationxml_filename)
                    utils.safe_delete(station.stationxml_filename)
                    for channel in station.channels:
                        utils.safe_delete(channel.mseed_filename)
                        logger.info("Deleting '%s'." %
                                    channel.mseed_filename)
        return report

    def download_mseed(self, client, client_name, stations, restrictions,
                       chunk_size_in_mb=25, threads_per_client=5):
        # Estimate the download size to have equally sized chunks.
        duration_req = restrictions.endtime - restrictions.starttime
        channel_sampling_rate = {
            "F": 5000, "G": 5000, "D": 1000, "C": 1000, "E": 250, "S": 80,
            "H": 250, "B": 80, "M": 10, "L": 1, "V": 0.1, "U": 0.01,
            "R": 0.001, "P": 0.0001, "T": 0.00001, "Q": 0.000001, "A": 5000,
            "O": 5000}

        station_chunks = []
        station_chunks_curr = []
        curr_chunks_mb = 0
        for sta in stations:
            for cha in sta.channels:
                # Assume that each sample needs 4 byte, STEIM
                # compression reduces size to about a third.
                # chunk size is in MB
                curr_chunks_mb += \
                    channel_sampling_rate[cha.channel[0].upper()] * \
                    duration_req * 4.0 / 3.0 / 1024.0 / 1024.0
            if curr_chunks_mb >= chunk_size_in_mb:
                station_chunks.append(station_chunks_curr)
                station_chunks_curr = []
                curr_chunks_mb = 0
            else:
               #print('STREAM:'+str(sta)) 
               station_chunks_curr.append(sta)
        if station_chunks_curr:
            station_chunks.append(station_chunks_curr)

        def star_download_mseed(args):
            try:
                ret_val = utils.download_and_split_mseed_bulk(
                    *args, logger=logger)
            except utils.ERRORS as e:
                msg = ("Client '%s' - " % args[1]) + str(e)
                if "no data available" in msg.lower():
                    logger.info(msg)
                else:
                    logger.error(msg)
                return []
            return ret_val

        pool = ThreadPool(min(threads_per_client, len(station_chunks)))
        #print (client, client_name, restrictions.starttime,
        #      restrictions.endtime)
        #print station_chunks
        result=None
        try:
            result = pool.map(
                star_download_mseed,
                [(client, client_name, restrictions.starttime,
                restrictions.endtime, chunk) for chunk in station_chunks])
            pool.close()

            filenames = itertools.chain.from_iterable(result)
            return list(filenames)
        except:
           traceback.print_exc(file=sys.stderr) 
           return []

    def _parse_miniseed_filenames(self, filenames, restrictions):
        time_range = restrictions.minimum_length * (restrictions.endtime -
                                                    restrictions.starttime)
        channel_availability = []
        for filename in filenames:
            st = obspy.read(filename, format="MSEED", headonly=True)
            if restrictions.reject_channels_with_gaps and len(st) > 1:
                logger.warning("Channel %s has gap or overlap. Will be "
                               "removed." % st[0].id)
                try:
                    os.remove(filename)
                except OSError:
                    pass
                continue
            elif len(st) == 0:
                logger.error("MiniSEED file with no data detected. Should "
                             "not happen!")
                continue
            tr = st[0]
            duration = tr.stats.endtime - tr.stats.starttime
            if restrictions.minimum_length and duration < time_range:
                logger.warning("Channel %s does not satisfy the minimum "
                               "length requirement. %.2f seconds instead of "
                               "the required %.2f seconds." % (
                               tr.id, duration, time_range))
                try:
                    os.remove(filename)
                except OSError:
                    pass
                continue
            channel_availability.append(utils.ChannelAvailability(
                tr.stats.network, tr.stats.station, tr.stats.location,
                tr.stats.channel, tr.stats.starttime, tr.stats.endtime,
                filename))
        return channel_availability

    def download_stationxml(self, client, client_name, stations,
                            restrictions, threads_per_client=10):

        def star_download_station(args):
            try:
                ret_val = utils.download_stationxml(*args, logger=logger)
            except utils.ERRORS as e:
                logger.error(str(e))
                return None
            return ret_val

        pool = ThreadPool(min(threads_per_client, len(stations)))

        results = pool.map(star_download_station, [
                           (client, client_name, restrictions.starttime,
                            restrictions.endtime, s) for s in stations])
        pool.close()

        if isinstance(results[0], list):
            results = itertools.chain.from_iterable(results)
        return [_i for _i in results if _i is not None]

    def __initialize_clients(self):
        """
        Initialize all clients.
        """
        logger.info("Initializing FDSN client(s) for %s."
                    % ", ".join(self.providers))

        def _get_client(client_name):
            try:
                this_client = Client(client_name)
            except utils.ERRORS as e:
                if "timeout" in str(e).lower():
                    extra = " (timeout)"
                else:
                    extra = ""
                logger.warn("Failed to initialize client '%s'.%s"
                            % (client_name, extra))
                return client_name, None
            services = sorted([_i for _i in this_client.services.keys()
                               if not _i.startswith("available")])
            if "dataselect" not in services or "station" not in services:
                logger.info("Cannot use client '%s' as it does not have "
                            "'dataselect' and/or 'station' services."
                            % client_name)
                return client_name, None
            return client_name, this_client

        # Catch warnings in the main thread. The catch_warnings() context
        # manager does not reliably work when used in multiple threads.
        p = ThreadPool(len(self.providers))
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            clients = p.map(_get_client, self.providers)
        p.close()
        for warning in w:
            logger.debug("Warning during initializing one of the clients: " +
                         str(warning.message))

        clients = {key: value for key, value in clients if value is not None}
        # Write to initialized clients dictionary preserving order.
        for client in self.providers:
            if client not in clients:
                continue
            self._initialized_clients[client] = clients[client]

        logger.info("Successfully initialized %i client(s): %s."
                    % (len(self._initialized_clients),
                       ", ".join(self._initialized_clients.keys())))
