#!/usr/bin/env python
import array
import numpy
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from scipy.interpolate import griddata
import gc
from mpl_toolkits.axes_grid1 import make_axes_locatable
import os
from mpi4py import MPI
import matplotlib.animation as animation
from math import radians, cos, sin, sqrt, pow, atan2

def create_image(filename, cent_lat, cent_lon, eta_deg, xi_deg,mesh):
    outputFile = "OUTPUT_FILES/" + filename + '.png'
    lons, lats, zs, vxs, vys, vzs, pgv, step, extreme = read_movie_data(filename)

    minlon = numpy.amin(lons)
    maxlon = numpy.amax(lons)
    minlat = numpy.amin(lats)
    maxlat = numpy.amax(lats)


    x_axis = maxlon - minlon
    y_axis = maxlat - minlat
    x_steps = 30 if x_axis >= 120 else 20 if x_axis >= 60 else 10 if x_axis >= 30 else 5
    y_steps = 30 if y_axis >= 60 else 10 if y_axis >= 30 else 5

    parallels = numpy.arange(-90, 90, y_steps)
    meridians = numpy.arange(-180, 180., x_steps)

    fig = plt.figure(figsize=[22, 15])

    if mesh=="Globe":
        ax1 = globe_subplot(lons, lats, vxs, extreme, minlon, minlat, maxlon, maxlat, parallels, meridians, 'seismic',
                      (-1 * extreme), 'Vx, m/s', 221,'k','w')
        ax2 = globe_subplot(lons, lats, vys, extreme, minlon, minlat, maxlon, maxlat, parallels, meridians, 'seismic',
                      (-1 * extreme), 'Vy, m/s', 222,'k','w')
        ax3 = globe_subplot(lons, lats, vzs, extreme, minlon, minlat, maxlon, maxlat, parallels, meridians, 'seismic',
                      (-1 * extreme), 'Vz, m/s', 223,'k','w')
        ax4 = globe_subplot(lons, lats, pgv, extreme, minlon, minlat, maxlon, maxlat, parallels, meridians, 'hot', 0,
                      'PGV, m/s',
                      224,'w','k')


    else:
        ax1 = regional_subplot(lons, lats, vxs, extreme, cent_lat, cent_lon, minlon, maxlon, minlat, maxlat, parallels,
                               meridians, 'seismic',(-1 * extreme), 'Vx, m/s', 221, 'k', 'w')
        ax2 = regional_subplot(lons, lats, vys, extreme, cent_lat, cent_lon, minlon, maxlon, minlat, maxlat, parallels,
                               meridians, 'seismic',(-1 * extreme), 'Vy, m/s', 222, 'k', 'w')
        ax3 = regional_subplot(lons, lats, vzs, extreme, cent_lat, cent_lon, minlon, maxlon, minlat, maxlat, parallels,
                               meridians, 'seismic',(-1 * extreme), 'Vz, m/s', 223, 'k', 'w')
        ax4 = regional_subplot(lons, lats, pgv, extreme, cent_lat, cent_lon, minlon, maxlon, minlat, maxlat, parallels,
                               meridians, 'hot', 0, 'PGV, m/s',224, 'w', 'k')

    fig.add_subplot(ax1, ax2, ax3, ax4)
    fig.suptitle(filename)
    plt.savefig(outputFile, dpi=300)
    plt.close(fig)
    gc.collect()


def regional_subplot(lons, lats, data, extreme, cent_lat, cent_lon, min_lon, max_lon, min_lat, max_lat, parallels, meridians, cmap, vmin, title,
            plot_number, coastline_color, background_color):

    ax = plt.subplot(plot_number)
    ax.set_axis_bgcolor(background_color)

    ETA_m = haversine_distance((min_lat, cent_lon), (max_lat, cent_lon), True)
    XI_m = haversine_distance((min_lat, min_lon), (max_lat, max_lon),True)
    map = Basemap(height=ETA_m, width=XI_m,
            resolution='l', area_thresh=1000., projection='omerc', \
            lon_0=cent_lon, lat_0=cent_lat, lon_2=cent_lon, lat_2=min_lat, lon_1=cent_lon, lat_1=max_lat)
    map.drawcoastlines(color=coastline_color)

    # labels = [left,right,top,bottom]
    map.drawparallels(parallels, labels=[True, False, False, False])
    map.drawmeridians(meridians, labels=[False, False, False, True])

    cs = map.contourf(lons, lats, data, levels=numpy.linspace((-1 * extreme), extreme, 101), cmap=cmap,
                      vmin=vmin, vmax=extreme, extend='both', latlon=True)
    divider = make_axes_locatable(ax)
    cax = divider.append_axes("right", size="2%", pad=0.05)
    plt.colorbar(cs, cax=cax, ticks=[-1 * extreme, 0, extreme], extend='both')
    ax.set_title(title)

    return ax

"""
def regional_subplot(lons, lats, data, extreme, cent_lat, cent_lon, eta_deg, xi_deg, parallels, meridians, cmap, vmin, title,
            plot_number, coastline_color, background_color):

    ax = plt.subplot(plot_number)
    ax.set_axis_bgcolor(background_color)
    min_lat = cent_lat - (eta_deg/2)
    max_lat = cent_lat + (eta_deg / 2)
    min_lon=cent_lon - (xi_deg / 2)
    max_lon = cent_lon + (xi_deg / 2)

    ETA_m = haversine_distance((min_lat, cent_lon), (max_lat, cent_lon), True)
    if cent_lat >= 0:
        # Northern Hemisphere
        XI_m = haversine_distance((min_lat, min_lon), (max_lat, max_lon),True)
    elif cent_lat < 0:
        # Southern Hemisphere
        XI_m = haversine_distance((max_lat, min_lon), (max_lat, max_lon), True)

    if max_lat/numpy.abs(max_lat)!=min_lat/numpy.abs(min_lat):
        # at the equator
        XI_m = haversine_distance((0, min_lon), (0, max_lon), True)

    map = Basemap(height=ETA_m, width=XI_m,
            resolution='l', area_thresh=1000., projection='omerc', \
            lon_0=cent_lon, lat_0=cent_lat, lon_2=cent_lon, lat_2=min_lat, lon_1=cent_lon, lat_1=max_lat)
    map.drawcoastlines(color=coastline_color)

    # labels = [left,right,top,bottom]
    map.drawparallels(parallels, labels=[True, False, False, False])
    map.drawmeridians(meridians, labels=[False, False, False, True])

    cs = map.contourf(lons, lats, data, levels=numpy.linspace((-1 * extreme), extreme, 101), cmap=cmap,
                      vmin=vmin, vmax=extreme, extend='both', latlon=True)
    divider = make_axes_locatable(ax)
    cax = divider.append_axes("right", size="2%", pad=0.05)
    plt.colorbar(cs, cax=cax, ticks=[-1 * extreme, 0, extreme], extend='both')
    ax.set_title(title)

    return ax
"""
def globe_subplot(lons, lats, data, extreme, minlon, minlat, maxlon, maxlat, parallels, meridians, cmap, vmin, title,
            plot_number, coastline_color, background_color):

    ax = plt.subplot(plot_number)
    ax.set_axis_bgcolor(background_color)
    centlon = (maxlon + minlon) / 2
    centlat = (maxlat + minlat) / 2

    map = Basemap(lon_0=centlon, lat_0=centlat, lat_ts=centlat, llcrnrlon=minlon, llcrnrlat=minlat, urcrnrlon=maxlon,
                   urcrnrlat=maxlat, resolution='l')
    map.drawcoastlines(color=coastline_color)

    # labels = [left,right,top,bottom]
    map.drawparallels(parallels, labels=[True, False, False, False])
    map.drawmeridians(meridians, labels=[False, False, False, True])

    cs = map.contourf(lons, lats, data, levels=numpy.linspace((-1 * extreme), extreme, 101), cmap=cmap,
                      vmin=vmin, vmax=extreme, extend='both', latlon=True)
    divider = make_axes_locatable(ax)
    cax = divider.append_axes("right", size="2%", pad=0.05)
    plt.colorbar(cs, cax=cax, ticks=[-1 * extreme, 0, extreme], extend='both')
    ax.set_title(title)

    return ax
def read_movie_data(filename):
    filename = "OUTPUT_FILES/" + filename
    x, y, vx = numpy.loadtxt(filename + '.E.xyz', usecols=(0, 1, 2), unpack=True)
    z = numpy.zeros(len(x))
    x, y, vy = numpy.loadtxt(filename + '.N.xyz', usecols=(0, 1, 2), unpack=True)
    x, y, vz = numpy.loadtxt(filename + '.Z.xyz', usecols=(0, 1, 2), unpack=True)
    max_x = numpy.amax(x)
    min_x = numpy.amin(x)
    num_pixels = 1000
    step = (max_x - min_x) / num_pixels
    xs = numpy.arange(min(x), max(x), step)
    ys = numpy.arange(min(y), max(y), step)

    X, Y = numpy.meshgrid(xs, ys)

    vxs = griddata((x, y), vx, (X, Y), method='linear')
    vys = griddata((x, y), vy, (X, Y), method='linear')
    vzs = griddata((x, y), vz, (X, Y), method='linear')
    zs = griddata((x, y), z, (X, Y), method='linear')

    pgv = numpy.maximum(numpy.abs(vxs), numpy.abs(vys))
    pgv = numpy.maximum(pgv, numpy.abs(vzs))
    pgv.shape = vxs.shape
    ext = compute_extreme_val(vx, vy, vz)
    gc.collect()
    return X, Y, zs, vxs, vys, vzs, pgv, step, ext


def compute_extreme_val(vx, vy, vz):
    max_xy = numpy.maximum(numpy.abs(vx), numpy.abs(vy))
    max_xyz = numpy.maximum(numpy.abs(max_xy), numpy.abs(vz))
    ext = numpy.amax(max_xyz)
    return ext


def haversine_distance(point1, point2, meters=False):
    R = 6371  # average earth radius in kilometers
    if meters:
        R = 6371 * 1000

    lat1, lon1 = point1
    lat2, lon2 = point2

    # convert from degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, (lat1, lon1, lat2, lon2))

    # calculate haversine
    lat = lat2 - lat1
    lon = lon2 - lon1
    a = pow(sin(lat / 2), 2) + cos(lat1) * cos(lat2) * pow(sin(lon / 2), 2)
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    d = R * c
    return d


def create_movie(Files, videoname,mesh, cent_lat, cent_lon, eta_deg, xi_deg,framerate):
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
    noFiles = len(Files)
    noFilesToConvert = noFiles / size
    remainderFiles = noFiles % size

    startFile = (rank * noFilesToConvert)
    endFile = startFile + noFilesToConvert

    try:
        if rank < noFiles:
            for i in range(startFile, endFile):
                print "index: " + `i`
                create_image(Files[i],cent_lat, cent_lon, eta_deg, xi_deg,mesh)
        if rank < remainderFiles:
            print "remainder index: " + `size * noFilesToConvert + rank`
            create_image(Files[size * noFilesToConvert + rank],cent_lat, cent_lon, eta_deg, xi_deg)
    except IndexError:
        print "Index Error: Array out of bounds."

    MPI.Finalize()
    inputPNGFiles = 'OUTPUT_FILES/gmt_movie%*.png'
    print videoname
    print '"ffmpeg" "-framerate" "' + str(
        framerate) + '" "-i" "' + inputPNGFiles + '" "-s:v" "1280x720" "-c:v" "libx264"  "-profile:v" "high" "-crf" "23" "-pix_fmt" "yuv420p" "-r" "30" ' + videoname
    os.system('"ffmpeg" "-framerate" "' + str(
        framerate) + '" "-i" "' + inputPNGFiles + '" "-s:v" "1280x720" "-c:v" "libx264"  "-profile:v" "high" "-crf" "23" "-pix_fmt" "yuv420p" "-r" "30" ' + videoname)


if __name__ == '__main__':
    try:
        import optparse_gui
    except:
        pass

    import optparse
    import sys

    if 1 == len(sys.argv):
        try:
            option_parser_class = optparse_gui.OptionParser
        except:
            option_parser_class = optparse.OptionParser
    else:
        option_parser_class = optparse.OptionParser

    usage = """
    """
    parser = option_parser_class(usage=usage)

    parser.add_option("--filespath", dest="filespath", default="OUTPUT_FILES", help="path of the input files")
    parser.add_option("--videoname", dest="videoname", default="simple_finalvideo.mp4", help="name of output video")
    parser.add_option("--mesh", dest="mesh", default='Globe', help="type of mesh selected. Bespoke for regional simulation or Globe for global simulation")
    parser.add_option("--lat", dest="centlat", default='0', help="central latitude of mesh area")
    parser.add_option("--lon", dest="centlon", default='0', help="central longitude of mesh area")
    parser.add_option("--xi", dest="xi_deg", default='180', help="angular width of xi in degrees")
    parser.add_option("--eta", dest="eta_deg", default='90', help="angular width of eta in degrees")

    (options, args) = parser.parse_args()
    print options

    Files = list({name.split(".")[0] for name in os.listdir(options.filespath) if "gmt_movie" in name})
    print Files
    create_movie(Files,options.videoname, options.mesh, float(options.centlat), float(options.centlon), float(options.eta_deg), float(options.xi_deg),framerate=0.5)



