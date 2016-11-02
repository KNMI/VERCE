from obspy.imaging.beachball import Beachball
import json
import uuid
import base64
import os.path
import urllib


class Struct:
    
    def __init__(self, **entries): 
        self.__dict__.update(entries)

' test curl -d @specfem.json http://localhost:8083/solver/par-file/specfem --header "application/x-www-form-urlencoded" -X POST > response.txt '
class SolverParfile(object):
    
    
      
    
    

    def __init__(self, path):
        self.__filespath__=path+"solver/";
        
        self.specfem_template = (
        "# simulation input parameters\n"
        "#\n"
        "# forward or adjoint simulation\n"
        "# 1 = forward, 2 = adjoint, 3 = both simultaneously\n"
        "SIMULATION_TYPE                 = {SIMULATION_TYPE}\n"
        "# 0 = earthquake simulation,  1/2/3 = "
        "three steps in noise simulation\n"
        "NOISE_TOMOGRAPHY                = {NOISE_TOMOGRAPHY}\n"
        "SAVE_FORWARD                    = {SAVE_FORWARD}\n"
        "\n"
        "# UTM projection parameters\n"
        "# Use a negative zone number for the Southern hemisphere:\n"
        "# The Northern hemisphere corresponds to zones +1 to +60,\n"
        "# The Southern hemisphere corresponds to zones -1 to -60.\n"
        "UTM_PROJECTION_ZONE             = {UTM_PROJECTION_ZONE}\n"
        "SUPPRESS_UTM_PROJECTION         = {SUPPRESS_UTM_PROJECTION}\n"
        "\n"
        "# number of MPI processors\n"
        "NPROC                           = {NPROC}\n"
        "\n"
        "# time step parameters\n"
        "NSTEP                           = {NSTEP}\n"
        "DT                              = {DT}\n"
        "\n"
        "# number of nodes for 2D and 3D shape functions for hexahedra\n"
        "# we use either 8-node mesh elements (bricks) or 27-node elements.\n"
        "# If you use our internal mesher, the only option is 8-node bricks "
        "(27-node elements are not supported)\n"
        "# CUBIT does not support HEX27 elements either (it can generate them,"
        " but they are flat, i.e. identical to HEX8).\n"
        "# To generate HEX27 elements with curvature properly taken into "
        "account, you can use Gmsh http://geuz.org/gmsh/\n"
        "NGNOD                           = {NGNOD}\n"
        "\n"
        "# models:\n"
        "# available options are:\n"
        "#   default (model parameters described by mesh properties)\n"
        "# 1D models available are:\n"
        "#   1d_prem,1d_socal,1d_cascadia\n"
        "# 3D models available are:\n"
        "#   aniso,external,gll,salton_trough,tomo,SEP...\n"
        "MODEL                           = {MODEL}\n"
        "# parameters describing the model\n"
        "APPROXIMATE_OCEAN_LOAD          = {APPROXIMATE_OCEAN_LOAD}\n"
        "TOPOGRAPHY                      = {TOPOGRAPHY}\n"
        "ATTENUATION                     = {ATTENUATION}\n"
        "FULL_ATTENUATION_SOLID          = {FULL_ATTENUATION_SOLID}\n"
        "ANISOTROPY                      = {ANISOTROPY}\n"
        "GRAVITY                         = {GRAVITY}\n"
        "\n"
        "# path for external tomographic models files\n"
        "TOMOGRAPHY_PATH                 = {TOMOGRAPHY_PATH}\n"
        "\n"
        "# Olsen's constant for Q_mu = constant * v_s attenuation rule\n"
        "USE_OLSEN_ATTENUATION           = {USE_OLSEN_ATTENUATION}\n"
        "OLSEN_ATTENUATION_RATIO         = {OLSEN_ATTENUATION_RATIO}\n"
        "\n"
        "# C-PML boundary conditions for a regional simulation\n"
        "PML_CONDITIONS                  = {PML_CONDITIONS}\n"
        "\n"
        "# C-PML top surface\n"
        "PML_INSTEAD_OF_FREE_SURFACE     = {PML_INSTEAD_OF_FREE_SURFACE}\n"
        "\n"
        "# C-PML dominant frequency\n"
        "f0_FOR_PML                      = {f0_FOR_PML}\n"
        "\n"
        "# parameters used to rotate C-PML boundary conditions by a given "
        "angle (not completed yet)\n"
        "# ROTATE_PML_ACTIVATE           = {ROTATE_PML_ACTIVATE}\n"
        "# ROTATE_PML_ANGLE              = {ROTATE_PML_ANGLE}\n"
        "\n"
        "# absorbing boundary conditions for a regional simulation\n"
        "STACEY_ABSORBING_CONDITIONS     = {STACEY_ABSORBING_CONDITIONS}\n"
        "\n"
        "# absorbing top surface (defined in mesh as 'free_surface_file')\n"
        "STACEY_INSTEAD_OF_FREE_SURFACE  = {STACEY_INSTEAD_OF_FREE_SURFACE}\n"
        "\n"
        "# save AVS or OpenDX movies\n"
        "# MOVIE_TYPE = 1 to show the top surface\n"
        "# MOVIE_TYPE = 2 to show all the external faces of the mesh\n"
        "CREATE_SHAKEMAP                 = {CREATE_SHAKEMAP}\n"
        "MOVIE_SURFACE                   = {MOVIE_SURFACE}\n"
        "MOVIE_TYPE                      = {MOVIE_TYPE}\n"
        "MOVIE_VOLUME                    = {MOVIE_VOLUME}\n"
        "SAVE_DISPLACEMENT               = {SAVE_DISPLACEMENT}\n"
        "USE_HIGHRES_FOR_MOVIES          = {USE_HIGHRES_FOR_MOVIES}\n"
        "NTSTEP_BETWEEN_FRAMES           = {NTSTEP_BETWEEN_FRAMES}\n"
        "HDUR_MOVIE                      = {HDUR_MOVIE}\n"
        "\n"
        "# save AVS or OpenDX mesh files to check the mesh\n"
        "SAVE_MESH_FILES                 = {SAVE_MESH_FILES}\n"
        "\n"
        "# path to store the local database file on each node\n"
        "LOCAL_PATH                      = {LOCAL_PATH}\n\n"

        "# interval at which we output time step info and max of norm of "
        "displacement\n"
        "NTSTEP_BETWEEN_OUTPUT_INFO      = {NTSTEP_BETWEEN_OUTPUT_INFO}\n"
        "\n"
        "# interval in time steps for writing of seismograms\n"
        "NTSTEP_BETWEEN_OUTPUT_SEISMOS   = {NTSTEP_BETWEEN_OUTPUT_SEISMOS}\n"
        "\n"
        "# interval in time steps for reading adjoint traces\n"
        "# 0 = read the whole adjoint sources at the same time\n"
        "NTSTEP_BETWEEN_READ_ADJSRC      = {NTSTEP_BETWEEN_READ_ADJSRC}\n"
        "\n"
        "# use a (tilted) FORCESOLUTION force point source (or several) "
        "instead of a CMTSOLUTION moment-tensor source.\n"
        "# This can be useful e.g. for oil industry foothills simulations or "
        "asteroid simulations\n"
        "# in which the source is a vertical force, normal force, inclined "
        "force, impact etc.\n"
        "# If this flag is turned on, the FORCESOLUTION file must be edited "
        "by giving:\n"
        "# - the corresponding time-shift parameter,\n"
        "# - the half duration parameter of the source,\n"
        "# - the coordinates of the source,\n"
        "# - the magnitude of the force source,\n"
        "# - the components of a direction vector for the force "
        "source in the E/N/Z_UP basis.\n"
        "# The direction vector is made unitary internally in the code and "
        "thus only its direction matters here;\n"
        "# its norm is ignored and the norm of the force used is the factor "
        "force source times the source time function.\n"
        "USE_FORCE_POINT_SOURCE          = {USE_FORCE_POINT_SOURCE}\n"
        "\n"
        "# set to true to use a Ricker source time function instead of the "
        "source time functions set by default\n"
        "# to represent a (tilted) FORCESOLUTION force point source or a "
        "CMTSOLUTION moment-tensor source.\n"
        "USE_RICKER_TIME_FUNCTION        = {USE_RICKER_TIME_FUNCTION}\n"
        "\n"
        "# print source time function\n"
        "PRINT_SOURCE_TIME_FUNCTION      = {PRINT_SOURCE_TIME_FUNCTION}\n"
        "\n"
        "# to couple with an external code (such as DSM, AxiSEM, or FK)\n"
        "COUPLE_WITH_EXTERNAL_CODE       = {COUPLE_WITH_EXTERNAL_CODE}\n"
        "EXTERNAL_CODE_TYPE              = {EXTERNAL_CODE_TYPE}"
        "   # 1 = DSM, 2 = AxiSEM, 3 = FK\n"
        "TRACTION_PATH                   = {TRACTION_PATH}\n"
        "MESH_A_CHUNK_OF_THE_EARTH       = {MESH_A_CHUNK_OF_THE_EARTH}\n"
        "\n# set to true to use GPUs\n"
        "GPU_MODE                        = {GPU_MODE}\n\n"
        "# ADIOS Options for I/Os\n"
        "ADIOS_ENABLED                   = {ADIOS_ENABLED}\n"
        "ADIOS_FOR_DATABASES             = {ADIOS_FOR_DATABASES}\n"
        "ADIOS_FOR_MESH                  = {ADIOS_FOR_MESH}\n"
        "ADIOS_FOR_FORWARD_ARRAYS        = {ADIOS_FOR_FORWARD_ARRAYS}\n"
        "ADIOS_FOR_KERNELS               = {ADIOS_FOR_KERNELS}")
#        self.conection = MongoClient(host=url)
#        self.db = self.conection["verce-prov"]
#        self.collection = self.db['lineage']
#namefile='specfem.json'

    
 
    def form2vd(self,fields):
         
        l=[]
        ld={}
        for r in fields:
            name=r[u'name']
            try:
                ld[name]=r[u'value']
                value=r[u'value']
            except:
                ld[name]=None
                value=None    #if the value is not defined.....
            l.append('{KEY} = s.{KEY}'.format(KEY = name, VALUE = value))
        return l,ld
    
    def produceFileSpecfem_202_DEV(self,json):
         
        vs,ds=self.form2vd(json["fields"])
        s = Struct(**ds)

#label="("+',\n'.join(v for v in vs)+")"
#print label
        self.parfile=self.specfem_template.format(NPROC = s.NPROC,
        NSTEP = s.NSTEP,
        DT = s.DT,
        SIMULATION_TYPE = s.SIMULATION_TYPE,
        NOISE_TOMOGRAPHY = s.NOISE_TOMOGRAPHY,
        SAVE_FORWARD = s.SAVE_FORWARD,
        UTM_PROJECTION_ZONE = s.UTM_PROJECTION_ZONE,
        SUPPRESS_UTM_PROJECTION = s.SUPPRESS_UTM_PROJECTION,
        NGNOD = s.NGNOD,
        MODEL = s.MODEL,
        APPROXIMATE_OCEAN_LOAD = s.APPROXIMATE_OCEAN_LOAD,
        TOPOGRAPHY = s.TOPOGRAPHY,
        ATTENUATION = s.ATTENUATION,
        ANISOTROPY = s.ANISOTROPY,
        GRAVITY = s.GRAVITY,
        TOMOGRAPHY_PATH = s.TOMOGRAPHY_PATH,
        USE_OLSEN_ATTENUATION = s.USE_OLSEN_ATTENUATION,
        PML_CONDITIONS = s.PML_CONDITIONS,
        OLSEN_ATTENUATION_RATIO = s.OLSEN_ATTENUATION_RATIO,
        PML_INSTEAD_OF_FREE_SURFACE = s.PML_INSTEAD_OF_FREE_SURFACE,
        f0_FOR_PML = s.f0_FOR_PML,
        STACEY_ABSORBING_CONDITIONS = s.STACEY_ABSORBING_CONDITIONS,
        STACEY_INSTEAD_OF_FREE_SURFACE = s.STACEY_INSTEAD_OF_FREE_SURFACE,
        CREATE_SHAKEMAP = s.CREATE_SHAKEMAP,
        MOVIE_SURFACE = s.MOVIE_SURFACE,
        MOVIE_TYPE = s.MOVIE_TYPE,
        MOVIE_VOLUME = s.MOVIE_VOLUME,
        SAVE_DISPLACEMENT = s.SAVE_DISPLACEMENT,
        USE_HIGHRES_FOR_MOVIES = s.USE_HIGHRES_FOR_MOVIES,
        NTSTEP_BETWEEN_FRAMES = s.NTSTEP_BETWEEN_FRAMES,
        HDUR_MOVIE = s.HDUR_MOVIE,
        SAVE_MESH_FILES = s.SAVE_MESH_FILES,
        LOCAL_PATH = s.LOCAL_PATH,
        NTSTEP_BETWEEN_OUTPUT_INFO = s.NTSTEP_BETWEEN_OUTPUT_INFO,
        NTSTEP_BETWEEN_OUTPUT_SEISMOS = s.NTSTEP_BETWEEN_OUTPUT_SEISMOS,
        NTSTEP_BETWEEN_READ_ADJSRC = s.NTSTEP_BETWEEN_READ_ADJSRC,
        USE_FORCE_POINT_SOURCE = s.USE_FORCE_POINT_SOURCE,
        USE_RICKER_TIME_FUNCTION = s.USE_RICKER_TIME_FUNCTION,
        PML_WIDTH_MIN = s.PML_WIDTH_MIN,
        PML_WIDTH_MAX = s.PML_WIDTH_MAX,
        GPU_MODE = s.GPU_MODE,
        ROTATE_PML_ACTIVATE = s.ROTATE_PML_ACTIVATE,
        ROTATE_PML_ANGLE = s.ROTATE_PML_ANGLE,
        PRINT_SOURCE_TIME_FUNCTION =s.PRINT_SOURCE_TIME_FUNCTION,
        FULL_ATTENUATION_SOLID =s.FULL_ATTENUATION_SOLID,
        COUPLE_WITH_EXTERNAL_CODE=s.COUPLE_WITH_EXTERNAL_CODE,
        EXTERNAL_CODE_TYPE=s.EXTERNAL_CODE_TYPE,
        TRACTION_PATH=s.TRACTION_PATH,
        MESH_A_CHUNK_OF_THE_EARTH=s.MESH_A_CHUNK_OF_THE_EARTH,
        ADIOS_ENABLED=s.ADIOS_ENABLED,
        ADIOS_FOR_DATABASES=s.ADIOS_FOR_DATABASES,
        ADIOS_FOR_MESH=s.ADIOS_FOR_MESH,
        ADIOS_FOR_FORWARD_ARRAYS=s.ADIOS_FOR_FORWARD_ARRAYS,
        ADIOS_FOR_KERNELS=s.ADIOS_FOR_KERNELS)
        
        
        filename = "specfem-"+str(uuid.uuid1())+".txt"
        outfile=self.__filespath__+filename;

         
        
        
    
        return  self.parfile
        






 

    
#    