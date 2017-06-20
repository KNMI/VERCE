import os
import sys
import requests
from obspy import readEvents
import datetime
import config
# this will allow the download of available events data on the gcmt catalog and convert them into a quakeml format
# the converted files will then be saved in the data directory
def request_gcmt_events(gcmt_urls):
    for key in gcmt_urls.keys():
        url=gcmt_urls[key]
        request = requests.get(url)
        if request.status_code == 200:
            cat = readEvents(url)
            if len(cat) > 0:
                directory=config.QUAKEML_ROOT_DIR+key
                if not os.path.exists(directory):
                    os.makedirs(directory)
                for event in cat:
                    fileName=str(event.resource_id).replace("smi:local/ndk/","").replace("/event","")+".xml"
                    event.write(directory+"/"+fileName, format="quakeml")

# this will perform a search request for the past months of the current year up to present month
# a server restart is required to update the database file
def update_gcmt_events(date):
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    yy = str(date.year)[2:]
    # a list of successful past searches with results for present year
    past_searches=[name for name in os.listdir(config.QUAKEML_ROOT_DIR) for month in months if month+yy == name]
    mm = date.month
    gcmt_urls = {}
    for month in months:
        if(months.index(month)+1 <= mm):
            key = month+yy
            if key not in past_searches:
                gcmt_urls[key] = "http://www.ldeo.columbia.edu/~gcmt/projects/CMT/catalog/NEW_MONTHLY/20" + yy + "/" + key + ".ndk"

    request_gcmt_events(gcmt_urls)


#this will perform a full search request from Jan 1976 up to Dec 2017
def initial_full_search_request():
    # set up a dictionary with a key referring to the name of the directory for which the output will be written to
    # and a value corresponding to the gcmt url where the events data are available at
    gcmt_urls = {}
    gcmt_urls["jan76_dec05"] = "http://www.ldeo.columbia.edu/~gcmt/projects/CMT/catalog/jan76_dec05.ndk"
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    years = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17']
    for year in years:
        for month in months:
            key = month + year
            gcmt_urls[
                key] = "http://www.ldeo.columbia.edu/~gcmt/projects/CMT/catalog/NEW_MONTHLY/20" + year + "/" + key + ".ndk"

    request_gcmt_events(gcmt_urls)

if __name__ == "__main__":
    # the keyword "initial" can be passed as an argument if we need to perform a full search request
    if len(sys.argv) >1 and sys.argv[1].lower()=="initial":
         initial_full_search_request()
    else:
        date=datetime.date.today()
        update_gcmt_events(date)

