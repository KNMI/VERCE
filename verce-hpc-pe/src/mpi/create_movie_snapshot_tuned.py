#!/usr/bin/env python
import array
import numpy
import matplotlib.pyplot as plt
from scipy.interpolate import griddata
#from matplotlib.mlab import griddata
import gc
from mpl_toolkits.axes_grid1 import make_axes_locatable
import os


def createimg(f,step=1000,extreme=0.0008):
    splitStr = f.split("/")
    outputFile='/'.join(map(str,f.split("/")[:-1]))+'/plt'+splitStr[-1]+'.png'
    X,Y,zs,vxs,vys,vzs,pgv=read_moviedata(f)
    fig = plt.figure(figsize=[22,15])
    ax1=plt.subplot(221,aspect='equal')
    cs1=ax1.contourf(X,Y,vxs,levels=numpy.linspace(-1*extreme,extreme,101),cmap='seismic',vmin=-1*extreme,vmax=extreme,extend='both')
    divider = make_axes_locatable(ax1)
    cax1 = divider.append_axes("right", size="1%", pad=0.05)
    plt.colorbar(cs1,cax=cax1,ticks=[-1*extreme,0,extreme],extend='both')
    ax1.contour(X,Y,zs,levels=[-5,0,300,2000],linewidths=0.5,colors='k')
    ax1.set_title('Vx, m/s')
    
    ax2=plt.subplot(222,aspect='equal')
    cs2=ax2.contourf(X,Y,vys,levels=numpy.linspace(-1*extreme,extreme,101),cmap='seismic',vmin=-1*extreme,vmax=extreme,extend='both')
    divider = make_axes_locatable(ax2)
    cax2 = divider.append_axes("right", size="1%", pad=0.05)
    plt.colorbar(cs2,cax=cax2,ticks=[-1*extreme,0,extreme],extend='both')
    ax2.contour(X,Y,zs,levels=[-5,0,300,2000],linewidths=0.5,colors='k')
    ax2.set_title('Vy, m/s')
    
    ax3=plt.subplot(223,aspect='equal')
    cs3=ax3.contourf(X,Y,vzs,levels=numpy.linspace(-1*extreme,extreme,101),cmap='seismic',vmin=-1*extreme,vmax=extreme,extend='both')
    divider = make_axes_locatable(ax3)
    cax3 = divider.append_axes("right", size="1%", pad=0.05)
    plt.colorbar(cs3,cax=cax3,ticks=[-1*extreme,0,extreme],extend='both')
    ax3.contour(X,Y,zs,levels=[-5,0,300,2000],linewidths=0.5,colors='k')
    ax3.set_title('Vz, m/s')
    
    ax4=plt.subplot(224,aspect='equal')
    cs4=ax4.contourf(X,Y,pgv,levels=numpy.linspace(0,extreme,101),cmap='hot',vmin=0,vmax=extreme)
    divider = make_axes_locatable(ax4)
    cax4 = divider.append_axes("right", size="1%", pad=0.05)
    plt.colorbar(cs4,cax=cax4,ticks=[0,extreme],extend='both')
    ax4.contour(X,Y,zs,levels=[-5,0,300,2000],linewidths=0.5,colors='white')
    ax4.set_title('PGV, m/s')
    fig.suptitle(splitStr[-1])
    plt.savefig(outputFile,dpi=300)
    plt.close(fig)
    gc.collect()

def read_moviedata(f,step=1000):
    inputf=open(f,'rb')
    a=array.array('f')
    while True:
        try: 
            a.fromfile(inputf, 2000)
        except EOFError:
            break
    
    data=numpy.array(a)
    del a
            
    field=6
    np=len(data)/field
    data.shape=(6,np)
    
    x=data[0][1:-1]
    y=data[1][1:-1]
    z=data[2][1:-1]
    vx=data[3][1:-1]
    vy=data[4][1:-1]
    vz=data[5][1:-1]
    xs = numpy.arange(min(x), max(x), step)
    ys = numpy.arange(min(y), max(y), step)
    
    X, Y = numpy.meshgrid(xs, ys)
    
    vxs = griddata((x, y), vx, (X, Y), method='linear')
    vys = griddata((x, y), vy, (X, Y), method='linear')
    vzs = griddata((x, y), vz, (X, Y), method='linear')
    zs = griddata((x, y), z, (X, Y), method='linear')

    #vxs=griddata(x,y,vx,X,Y,interp='linear')
    #vys=griddata(x,y,vy,X,Y,interp='linear')
    #vzs=griddata(x,y,vz,X,Y,interp='linear')
    #zs=griddata(x,y,z,X,Y,interp='linear')
    
    pgv=numpy.maximum(numpy.abs(vxs),numpy.abs(vys))
    pgv=numpy.maximum(pgv,numpy.abs(vzs))
    pgv.shape=vxs.shape
    gc.collect()
    return X,Y,zs,vxs,vys,vzs,pgv

def createmovie(Files,step=1000,extreme=0.0008,parallel=False,animation=False,videoname='animation.mp4',framerate=3):
    import matplotlib.animation as animation
    if parallel:
        from mpi4py import MPI
        comm = MPI.COMM_WORLD
        rank = comm.Get_rank()
        size = comm.Get_size()
        noFiles = len(Files)
        noFilesToConvert = noFiles/size
        remainderFiles = noFiles%size 
      
        startFile = (rank*noFilesToConvert)
        endFile = startFile + noFilesToConvert 
        try:
            if rank<noFiles:
                for i in range (startFile, endFile):
                    print "index: "+`i`
                    createimg(Files[i], step=step, extreme=extreme)
            if rank < remainderFiles:
                print "remainder index: "+`size*noFilesToConvert+rank`
                createimg(Files[size*noFilesToConvert+rank],step=step, extreme=extreme)
        except IndexError:
                print "Index Error: Array out of bounds."
        
        #comm.Barrier()
	MPI.Finalize()    
        if animation:
            #if rank==0:
                inputPNGFiles='/'.join(map(str,Files[0].split("/")[:-1]))+'/pltmoviedata%*.png'
                print videoname
                print '"ffmpeg" "-framerate" "'+str(framerate)+'" "-i" "' + inputPNGFiles + '" "-s:v" "1280x720" "-c:v" "libx264"  "-profile:v" "high" "-crf" "23" "-pix_fmt" "yuv420p" "-r" "30" ' + videoname
                os.system('"ffmpeg" "-framerate" "'+str(framerate)+'" "-i" "' + inputPNGFiles + '" "-s:v" "1280x720" "-c:v" "libx264"  "-profile:v" "high" "-crf" "23" "-pix_fmt" "yuv420p" "-r" "30" ' + videoname)
    
        #MPI.Finalize()
    else:
        print 'serial'
        for f in Files:
            print f
            try:
                createimg(f, step=step, extreme=extreme)
            except:
                continue
        if animation:
            inputPNGFiles='/'.join(map(str,Files[0].split("/")[:-1]))+'/pltmoviedata%*.png'
            print videoname
            print '"ffmpeg" "-framerate" "'+str(framerate)+'" "-i" "' + inputPNGFiles + '" "-s:v" "1280x720" "-c:v" "libx264"  "-profile:v" "high" "-crf" "23" "-pix_fmt" "yuv420p" "-r" "30" ' + videoname
            os.system('"ffmpeg" "-framerate" "'+str(framerate)+'" "-i" ' + inputPNGFiles + ' "-s:v" "1280x720" "-c:v" "libx264"  "-profile:v" "high" "-crf" "23" "-pix_fmt" "yuv420p" "-r" "30" ' + videoname)	 

def df(m1,m2):
    d=10**(3/2*(m1-m2))
    return d

if __name__ == '__main__':
    try:
        import optparse_gui
    except:
        pass
    
    import optparse
    import glob,sys
    
    
    if 1 == len( sys.argv ):
            try:
                option_parser_class = optparse_gui.OptionParser
            except:
                option_parser_class = optparse.OptionParser
    else:
            option_parser_class = optparse.OptionParser
    
    usage="""
    """
    
    parser = option_parser_class(usage=usage)
    
    #print parser.usage
    
    parser.add_option("--files",dest="filenames", default=False,help="name of the inp files")
    parser.add_option("--ext",dest="extreme", default=False,help="extremes of the color scale")
    parser.add_option("--step",dest="step", default='1000',help="interpolation step")
    parser.add_option("--mag",dest="mag", default=False,help="magnitude of event")
    parser.add_option("--ani",dest="animation", action="store_true", default=False,help="create animation (it requires ffmeg)")
    parser.add_option("--videoname",dest="videoname",default="simple_finalvideo.mp4",help="name of output video")
    parser.add_option("--parallel",dest="parallel",action="store_true",default=False,help="Turn off parallelisation")
    parser.add_option("--nstep",dest="nstep", default='false',help="nstep for frame")
    parser.add_option("--dt",dest="dt", default='false',help="timestep")
    
    #parser.add_option("--nstep",dest="nstep", default=False,help="number of steps")
    #parser.add_option("--roll",dest="roll", default="-45",help="camera rotation around vertical visual axis (negative = right)")
    #parser.add_option("--elevation",dest="elevation", default="-60",help="camera rotation around x visual axis (negative = down for zenit)")
    #parser.add_option("--output",dest="output", default="output",help="output filename")
    #parser.add_option("--vmax",dest="vmax", default=False,help="maximum absolute value for color scale")
    #parser.add_option("--fr",dest="fr", default="3",help="frame rate [def: 3 frames per second]")
    #parser.add_option("--resolution",dest="resolution", default="426x240",help="resolution")
    #parser.add_option("--zscale",dest="zscale", default="1",help="scale z axis")
    #parser.add_option("--magnification",dest="magnification", default="3",help="magnify output")
    
    
    (options, args) = parser.parse_args()
    print options
    
    if not '/' in options.filenames:
        s='./'+options.filenames
    else:
        s=options.filenames
    
    Files=glob.glob(s)
    print Files
    
    if not options.extreme:
        if options.mag:
            m2=5
            m1=float(options.mag)
            factor=df(m1,m2)
            ext=0.003*factor
        else:
            ext=0.005
    else:
        ext=float(options.extreme)
            
    if options.dt and options.nstep:
        framerate=1/(float(options.dt)*float(options.nstep))
        print framerate
    else:
        framerate=3
        print framerate
    
    
    
    
    
    
    
    createmovie(Files,extreme=ext,step=float(options.step),animation=options.animation,videoname=options.videoname,parallel=options.parallel,framerate=framerate)


