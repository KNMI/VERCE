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
        self.__filespath__ = path + "solver/";

        self.specfem3d_cartesian_202_dev_template = (
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

        self.specfem3d_globe_template = ("#----------------------------------------------------------- \n"
                                "# \n"
                                "# Simulation input parameters \n"
                                "# \n"
                                "#----------------------------------------------------------- \n"
                                "\n"
                                "# forward or adjoint simulation \n"
                                "SIMULATION_TYPE                 = {SIMULATION_TYPE}   # set to 1 for forward simulations, 2 for adjoint simulations for sources, and 3 for kernel simulations \n"
                                "NOISE_TOMOGRAPHY                = {NOISE_TOMOGRAPHY}   # flag of noise tomography, three steps (1,2,3). If earthquake simulation, set it to 0. \n"
                                "SAVE_FORWARD                    = .{SAVE_FORWARD}.   # save last frame of forward simulation or not \n"
                                "\n"
                                "# number of chunks (1,2,3 or 6) \n"
                                "NCHUNKS                         =  {NCHUNKS}\n"
                                "\n"
                                "# angular width of the first chunk (not used if full sphere with six chunks) \n"
                                "ANGULAR_WIDTH_XI_IN_DEGREES     = {ANGULAR_WIDTH_XI_IN_DEGREES}.d0   # angular size of a chunk \n"
                                "ANGULAR_WIDTH_ETA_IN_DEGREES    = {ANGULAR_WIDTH_ETA_IN_DEGREES}.d0 \n"
                                "CENTER_LATITUDE_IN_DEGREES      = {CENTER_LATITUDE_IN_DEGREES}.d0 \n"
                                "CENTER_LONGITUDE_IN_DEGREES     = {CENTER_LONGITUDE_IN_DEGREES}.d0\n"
                                "GAMMA_ROTATION_AZIMUTH          = {GAMMA_ROTATION_AZIMUTH}.d0 \n"
                                "\n"
                                "# number of elements at the surface along the two sides of the first chunk \n"
                                "# (must be multiple of 16 and 8 * multiple of NPROC below) \n"
                                "NEX_XI                          = {NEX_XI} \n"
                                "NEX_ETA                         = {NEX_ETA} \n"
                                "\n"
                                "# number of MPI processors along the two sides of the first chunk \n"
                                "NPROC_XI                        = {NPROC_XI} \n"
                                "NPROC_ETA                       = {NPROC_ETA} \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "# \n"
                                "# Model \n"
                                "# \n"
                                "#-----------------------------------------------------------\n"
                                "\n"
                                "# 1D models with real structure: \n"
                                "# 1D_isotropic_prem, 1D_transversely_isotropic_prem, 1D_iasp91, 1D_1066a, 1D_ak135f_no_mud, 1D_ref, 1D_ref_iso, 1D_jp3d,1D_sea99 \n"
                                "#\n"
                                "# 1D models with only one fictitious averaged crustal layer: \n"
                                "# 1D_isotropic_prem_onecrust, 1D_transversely_isotropic_prem_onecrust, 1D_iasp91_onecrust, 1D_1066a_onecrust, 1D_ak135f_no_mud_onecrust \n"
                                "# \n"
                                "# fully 3D models: \n"
                                "# transversely_isotropic_prem_plus_3D_crust_2.0, 3D_anisotropic, 3D_attenuation, \n"
                                "# s20rts, s40rts, s362ani, s362iso, s362wmani, s362ani_prem, s362ani_3DQ, s362iso_3DQ, \n"
                                "# s29ea, s29ea,sea99_jp3d1994,sea99,jp3d1994,heterogen,full_sh \n"
                                "# \n"
                                "# 3D models with 1D crust: append \"_1Dcrust\" the the 3D model name \n"
                                "#                          to take the 1D crustal model from the \n"
                                "#                          associated reference model rather than the default 3D crustal model \n"
                                "# e.g. s20rts_1Dcrust, s362ani_1Dcrust, etc. \n"
                                "MODEL                           = {MODEL} \n"
                                "\n"
                                "# parameters describing the Earth model \n"
                                "OCEANS                          = .{OCEANS}. \n"
                                "ELLIPTICITY                     = .{ELLIPTICITY}. \n"
                                "TOPOGRAPHY                      = .{TOPOGRAPHY}. \n"
                                "GRAVITY                         = .{GRAVITY}. \n"
                                "ROTATION                        = .{ROTATION}. \n"
                                "ATTENUATION                     = .{ATTENUATION}. \n"
                                "\n"
                                "# absorbing boundary conditions for a regional simulation \n"
                                "ABSORBING_CONDITIONS            = .{ABSORBING_CONDITIONS}. \n"
                                "\n"
                                "# record length in minutes \n"
                                "RECORD_LENGTH_IN_MINUTES        = {RECORD_LENGTH_IN_MINUTES}d0 \n"
                                "\n"
                                "# to undo attenuation for sensitivity kernel calculations or forward runs with SAVE_FORWARD \n"
                                "# use one (and only one) of the two flags below. UNDO_ATTENUATION is much better (it is exact) \n"
                                "# but requires a significant amount of disk space for temporary storage. \n"
                                "PARTIAL_PHYS_DISPERSION_ONLY    = .{PARTIAL_PHYS_DISPERSION_ONLY}. \n"
                                "UNDO_ATTENUATION                = .{UNDO_ATTENUATION}. \n"
                                "# How much memory (in GB) is installed on your machine per CPU core (only used for UNDO_ATTENUATION, can be ignored otherwise) \n"
                                "#         (or per GPU card or per INTEL MIC Phi board) \n"
                                "#   Beware, this value MUST be given per core, i.e. per MPI thread, i.e. per MPI rank, NOT per node. \n"
                                "#   This value is for instance: \n"
                                "#   -  4 GB on Tiger at Princeton \n"
                                "#   -  4 GB on TGCC Curie in Paris \n"
                                "#   -  4 GB on Titan at ORNL when using CPUs only (no GPUs); start your run with \"aprun -n$NPROC -N8 -S4 -j1\" \n"
                                "#   -  2 GB on the machine used by Christina Morency \n"
                                "#   -  2 GB on the TACC machine used by Min Chen \n"
                                "#   -  1.5 GB on the GPU cluster in Marseille \n"
                                "# When running on GPU machines, it is simpler to set PERCENT_OF_MEM_TO_USE_PER_CORE = 100.d0 \n"
                                "# and then set MEMORY_INSTALLED_PER_CORE_IN_GB to the amount of memory that you estimate is free (rather than installed) \n"
                                "# on the host of the GPU card while running your GPU job. \n"
                                "# For GPU runs on Titan at ORNL, use PERCENT_OF_MEM_TO_USE_PER_CORE = 100.d0 and MEMORY_INSTALLED_PER_CORE_IN_GB = 25.d0 \n"
                                "# and run your job with \"aprun -n$NPROC -N1 -S1 -j1\" \n"
                                "# (each host has 32 GB on Titan, each GPU has 6 GB, thus even if all the GPU arrays are duplicated on the host \n"
                                "#  this leaves 32 - 6 = 26 GB free on the host; leaving 1 GB for the Linux system, we can safely use 100% of 25 GB) \n"
                                "MEMORY_INSTALLED_PER_CORE_IN_GB = {MEMORY_INSTALLED_PER_CORE_IN_GB}.d0 \n"
                                "# What percentage of this total do you allow us to use for arrays to undo attenuation, keeping in mind that you \n"
                                "# need to leave some memory available for the GNU/Linux system to run \n"
                                "#   (a typical value is 85%; any value below is fine but the code will then save a lot of data to disk; \n"
                                "#    values above, say 90% or 92%, can be OK on some systems but can make the adjoint code run out of memory \n"
                                "#    on other systems, depending on how much memory per node the GNU/Linux system needs for itself; thus you can try \n"
                                "#    a higher value and if the adjoint crashes then try again with a lower value) \n"
                                "PERCENT_OF_MEM_TO_USE_PER_CORE  = {PERCENT_OF_MEM_TO_USE_PER_CORE}.d0 \n"
                                "\n"
                                "# three mass matrices instead of one are needed to handle rotation very accurately; \n"
                                "# otherwise rotation is handled slightly less accurately (but still reasonably well); \n"
                                "# set to .true. if you are interested in precise effects related to rotation; \n"
                                "# set to .false. if you are solving very large inverse problems at high frequency and also undoing attenuation exactly \n"
                                "# using the UNDO_ATTENUATION flag above, in which case saving as much memory as possible can be a good idea. \n"
                                "# You can also safely set it to .false. if you are not in a period range in which rotation matters, e.g. if you are targetting very short-period body waves. \n"
                                "# if in doubt, set to .true. \n"
                                "# Set it to .true. if you have ABSORBING_CONDITIONS above, because in that case the code will use the three mass matrices anyway \n"
                                "# and thus there is no additional cost. \n"
                                "# this flag is of course unused if ROTATION above is set to .false. \n"
                                "EXACT_MASS_MATRIX_FOR_ROTATION  = .{EXACT_MASS_MATRIX_FOR_ROTATION}. \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "\n"
                                "# this for LDDRK high-order time scheme instead of Newmark \n"
                                "USE_LDDRK                       = .{USE_LDDRK}. \n"
                                "\n"
                                "# the maximum CFL of LDDRK is significantly higher than that of the Newmark scheme, \n"
                                "# in a ratio that is theoretically 1.327 / 0.697 = 1.15 / 0.604 = 1.903 for a solid with Poisson's ratio = 0.25 \n"
                                "# and for a fluid (see the manual of the 2D code, SPECFEM2D, Tables 4.1 and 4.2, and that ratio does not \n"
                                "# depend on whether we are in 2D or in 3D). However in practice a ratio of about 1.5 to 1.7 is often safer \n"
                                "# (for instance for models with a large range of Poisson's ratio values). \n"
                                "# Since the code computes the time step using the Newmark scheme, for LDDRK we will simply \n"
                                "# multiply that time step by this ratio when LDDRK is on and when flag INCREASE_CFL_FOR_LDDRK is true. \n"
                                "INCREASE_CFL_FOR_LDDRK          = .{INCREASE_CFL_FOR_LDDRK}. \n"
                                "RATIO_BY_WHICH_TO_INCREASE_IT   = {RATIO_BY_WHICH_TO_INCREASE_IT}d0 \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "#\n"
                                "# Visualization \n"
                                "# \n"
                                "#----------------------------------------------------------- \n"
                                "\n"
                                "# save AVS or OpenDX movies \n"
                                "#MOVIE_COARSE saves movie only at corners of elements (SURFACE OR VOLUME) \n"
                                "#MOVIE_COARSE does not work with create_movie_AVS_DX \n"
                                "MOVIE_SURFACE                   = .{MOVIE_SURFACE}. \n"
                                "MOVIE_VOLUME                    = .{MOVIE_VOLUME}. \n"
                                "MOVIE_COARSE                    = .{MOVIE_COARSE}. \n"
                                "NTSTEP_BETWEEN_FRAMES           = {NTSTEP_BETWEEN_FRAMES} \n"
                                "HDUR_MOVIE                      = {HDUR_MOVIE}.d0 \n"
                                "\n"
                                "# save movie in volume.  Will save element if center of element is in prescribed volume \n"
                                "# top/bottom: depth in KM, use MOVIE_TOP = -100 to make sure the surface is stored. \n"
                                "# west/east: longitude, degrees East [-180/180] top/bottom: latitute, degrees North [-90/90] \n"
                                "# start/stop: frames will be stored at MOVIE_START + i*NSTEP_BETWEEN_FRAMES, where i=(0,1,2..) and iNSTEP_BETWEEN_FRAMES <= MOVIE_STOP \n"
                                "# movie_volume_type: 1=strain, 2=time integral of strain, 3=\mu*time integral of strain \n"
                                "# type 4 saves the trace and deviatoric stress in the whole volume, 5=displacement, 6=velocity \n"
                                "MOVIE_VOLUME_TYPE               = {MOVIE_VOLUME_TYPE} \n"
                                "MOVIE_TOP_KM                    = {MOVIE_TOP_KM} \n"
                                "MOVIE_BOTTOM_KM                 = {MOVIE_BOTTOM_KM} \n"
                                "MOVIE_WEST_DEG                  = {MOVIE_WEST_DEG} \n"
                                "MOVIE_EAST_DEG                  = {MOVIE_EAST_DEG} \n"
                                "MOVIE_NORTH_DEG                 = {MOVIE_NORTH_DEG} \n"
                                "MOVIE_SOUTH_DEG                 = {MOVIE_SOUTH_DEG} \n"
                                "MOVIE_START                     = {MOVIE_START} \n"
                                "MOVIE_STOP                      = {MOVIE_STOP} \n"
                                "\n"
                                "# save mesh files to check the mesh \n"
                                "SAVE_MESH_FILES                 = .{SAVE_MESH_FILES}. \n"
                                "\n"
                                "# restart files (number of runs can be 1 or higher, choose 1 for no restart files) \n"
                                "NUMBER_OF_RUNS                  = {NUMBER_OF_RUNS} \n"
                                "NUMBER_OF_THIS_RUN              = {NUMBER_OF_THIS_RUN} \n"
                                "\n"
                                "# path to store the local database files on each node \n"
                                "LOCAL_PATH                      = ./DATABASES_MPI \n"
                                "# temporary wavefield/kernel/movie files \n"
                                "LOCAL_TMP_PATH                  = ./DATABASES_MPI \n"
                                "\n"
                                "# interval at which we output time step info and max of norm of displacement \n"
                                "NTSTEP_BETWEEN_OUTPUT_INFO      = 500 \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "# \n"
                                "# Sources & seismograms \n"
                                "# \n"
                                "#----------------------------------------------------------- \n"
                                "\n"
                                "# interval in time steps for temporary writing of seismograms \n"
                                "NTSTEP_BETWEEN_OUTPUT_SEISMOS   = {NTSTEP_BETWEEN_OUTPUT_SEISMOS} \n"
                                "NTSTEP_BETWEEN_READ_ADJSRC      = {NTSTEP_BETWEEN_READ_ADJSRC} \n"
                                "\n"
                                "# output format for the seismograms (one can use either or all of the three formats) \n"
                                "OUTPUT_SEISMOS_ASCII_TEXT       = .{OUTPUT_SEISMOS_ASCII_TEXT}. \n"
                                "OUTPUT_SEISMOS_SAC_ALPHANUM     = .{OUTPUT_SEISMOS_SAC_ALPHANUM}. \n"
                                "OUTPUT_SEISMOS_SAC_BINARY       = .{OUTPUT_SEISMOS_SAC_BINARY}. \n"
                                "OUTPUT_SEISMOS_ASDF             = .{OUTPUT_SEISMOS_ASDF}. \n"
                                "\n"
                                "# rotate seismograms to Radial-Transverse-Z or use default North-East-Z reference frame \n"
                                "ROTATE_SEISMOGRAMS_RT           = .{ROTATE_SEISMOGRAMS_RT}. \n"
                                "\n"
                                "# decide if master process writes all the seismograms or if all processes do it in parallel \n"
                                "WRITE_SEISMOGRAMS_BY_MASTER     = .{WRITE_SEISMOGRAMS_BY_MASTER}. \n"
                                "\n"
                                "# save all seismograms in one large combined file instead of one file per seismogram \n"
                                "# to avoid overloading shared non-local file systems such as LUSTRE or GPFS for instance \n"
                                "SAVE_ALL_SEISMOS_IN_ONE_FILE    = .{SAVE_ALL_SEISMOS_IN_ONE_FILE}. \n"
                                "USE_BINARY_FOR_LARGE_FILE       = .{USE_BINARY_FOR_LARGE_FILE}. \n"
                                "\n"
                                "# flag to impose receivers at the surface or allow them to be buried \n"
                                "RECEIVERS_CAN_BE_BURIED         = .{RECEIVERS_CAN_BE_BURIED}. \n"
                                "\n"
                                "# print source time function \n"
                                "PRINT_SOURCE_TIME_FUNCTION      = .{PRINT_SOURCE_TIME_FUNCTION}. \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "# \n"
                                "#  Adjoint kernel outputs \n"
                                "# \n"
                                "#-----------------------------------------------------------\n"
                                "\n"
                                "# use ASDF format for reading the adjoint sources \n"
                                "READ_ADJSRC_ASDF                = .{READ_ADJSRC_ASDF}. \n"
                                "\n"
                                "# this parameter must be set to .true. to compute anisotropic kernels \n"
                                "# in crust and mantle (related to the 21 Cij in geographical coordinates) \n"
                                "# default is .false. to compute isotropic kernels (related to alpha and beta) \n"
                                "ANISOTROPIC_KL                  = .{ANISOTROPIC_KL}. \n"
                                "\n"
                                "# output only transverse isotropic kernels (alpha_v,alpha_h,beta_v,beta_h,eta,rho) \n"
                                "# rather than fully anisotropic kernels when ANISOTROPIC_KL above is set to .true. \n"
                                "# means to save radial anisotropic kernels, i.e., sensitivity kernels for beta_v, beta_h, etc. \n"
                                "SAVE_TRANSVERSE_KL_ONLY         = .{SAVE_TRANSVERSE_KL_ONLY}. \n"
                                "\n"
                                "# output approximate Hessian in crust mantle region. \n"
                                "# means to save the preconditioning for gradients, they are cross correlations between forward and adjoint accelerations. \n"
                                "APPROXIMATE_HESS_KL             = .{APPROXIMATE_HESS_KL}. \n"
                                "\n"
                                "# forces transverse isotropy for all mantle elements \n"
                                "# (default is to use transverse isotropy only between MOHO and 220) \n"
                                "# means we allow radial anisotropy between the bottom of the crust to the bottom of the transition zone, i.e., 660~km depth. \n"
                                "USE_FULL_TISO_MANTLE            = .{USE_FULL_TISO_MANTLE}. \n"
                                "\n"
                                "# output kernel mask to zero out source region \n"
                                "# to remove large values near the sources in the sensitivity kernels \n"
                                "SAVE_SOURCE_MASK                = .{SAVE_SOURCE_MASK}. \n"
                                "\n"
                                "# output kernels on a regular grid instead of on the GLL mesh points (a bit expensive) \n"
                                "SAVE_REGULAR_KL                 = .{SAVE_REGULAR_KL}. \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "\n"
                                "# Dimitri Komatitsch, July 2014, CNRS Marseille, France: \n"
                                "# added the ability to run several calculations (several earthquakes) \n"
                                "# in an embarrassingly-parallel fashion from within the same run; \n"
                                "# this can be useful when using a very large supercomputer to compute \n"
                                "# many earthquakes in a catalog, in which case it can be better from \n"
                                "# a batch job submission point of view to start fewer and much larger jobs, \n"
                                "# each of them computing several earthquakes in parallel. \n"
                                "# To turn that option on, set parameter NUMBER_OF_SIMULTANEOUS_RUNS to a value greater than 1. \n"
                                "# To implement that, we create NUMBER_OF_SIMULTANEOUS_RUNS MPI sub-communicators, \n"
                                "# each of them being labeled \"my_local_mpi_comm_world\", and we use them \n"
                                "# in all the routines in \"src/shared/parallel.f90\", except in MPI_ABORT() because in that case \n"
                                "# we need to kill the entire run. \n"
                                "# When that option is on, of course the number of processor cores used to start \n"
                                "# the code in the batch system must be a multiple of NUMBER_OF_SIMULTANEOUS_RUNS, \n"
                                "# all the individual runs must use the same number of processor cores, \n"
                                "# which as usual is NPROC in the Par_file, \n"
                                "# and thus the total number of processor cores to request from the batch system \n"
                                "# should be NUMBER_OF_SIMULTANEOUS_RUNS * NPROC. \n"
                                "# All the runs to perform must be placed in directories called run0001, run0002, run0003 and so on \n"
                                "# (with exactly four digits). \n"
                                "# \n"
                                "# Imagine you have 10 independent calculations to do, each of them on 100 cores; you have three options: \n"
                                "# \n"
                                "# 1/ submit 10 jobs to the batch system \n"
                                "# \n"
                                "# 2/ submit a single job on 1000 cores to the batch, and in that script create a sub-array of jobs to start 10 jobs, \n"
                                "# each running on 100 cores (see e.g. http://www.schedmd.com/slurmdocs/job_array.html)  \n"
                                "# \n"
                                "# 3/ submit a single job on 1000 cores to the batch, start SPECFEM3D on 1000 cores, create 10 sub-communicators, \n"
                                "# cd into one of 10 subdirectories (called e.g. run0001, run0002,... run0010) depending on the sub-communicator \n"
                                "# your MPI rank belongs to, and run normally on 100 cores using that sub-communicator. \n"
                                "# \n"
                                "# The option below implements 3/. \n"
                                "# \n"
                                "NUMBER_OF_SIMULTANEOUS_RUNS     = {NUMBER_OF_SIMULTANEOUS_RUNS} \n"
                                "\n"
                                "# if we perform simultaneous runs in parallel, if only the source and receivers vary between these runs \n"
                                "# but not the mesh nor the model (velocity and density) then we can also read the mesh and model files \n"
                                "# from a single run in the beginning and broadcast them to all the others; for a large number of simultaneous \n"
                                "# runs for instance when solving inverse problems iteratively this can DRASTICALLY reduce I/Os to disk in the solver \n"
                                "# (by a factor equal to NUMBER_OF_SIMULTANEOUS_RUNS), and reducing I/Os is crucial in the case of huge runs. \n"
                                "# Thus, always set this option to .true. if the mesh and the model are the same for all simultaneous runs. \n"
                                "# In that case there is no need to duplicate the mesh and model file database (the content of the DATABASES_MPI \n"
                                "# directories) in each of the run0001, run0002,... directories, it is sufficient to have one in run0001 \n"
                                "# and the code will broadcast it to the others) \n"
                                "BROADCAST_SAME_MESH_AND_MODEL   = .{BROADCAST_SAME_MESH_AND_MODEL}. \n"
                                "\n"
                                "# if one or a few of these simultaneous runs fail, kill all the runs or let the others finish using a fail-safe mechanism \n"
                                "# (in most cases, should be set to false) \n"
                                "USE_FAILSAFE_MECHANISM          = .{USE_FAILSAFE_MECHANISM}. \n"
                                "\n"
                                "#----------------------------------------------------------- \n"
                                "\n"
                                "# set to true to use GPUs \n"
                                "GPU_MODE                        = .{GPU_MODE}. \n"
                                "# Only used if GPU_MODE = .true. : \n"
                                "GPU_RUNTIME                     = {GPU_RUNTIME} \n"
                                "# 2 (OpenCL), 1 (Cuda) ou 0 (Compile-time -- does not work if configured with --with-cuda *AND* --with-opencl) \n"
                                "GPU_PLATFORM                    = {GPU_PLATFORM} \n"
                                "GPU_DEVICE                      = {GPU_DEVICE} \n"
                                "\n"
                                "# set to true to use the ADIOS library for I/Os \n"
                                "ADIOS_ENABLED                   = .{ADIOS_ENABLED}. \n"
                                "ADIOS_FOR_FORWARD_ARRAYS        = .{ADIOS_FOR_FORWARD_ARRAYS}. \n"
                                "ADIOS_FOR_MPI_ARRAYS            = .{ADIOS_FOR_MPI_ARRAYS}.\n"
                                "ADIOS_FOR_ARRAYS_SOLVER         = .{ADIOS_FOR_ARRAYS_SOLVER}. \n"
                                "ADIOS_FOR_SOLVER_MESHFILES      = .{ADIOS_FOR_SOLVER_MESHFILES}.\n"
                                "ADIOS_FOR_AVS_DX                = .{ADIOS_FOR_AVS_DX}. \n"
                                "ADIOS_FOR_KERNELS               = .{ADIOS_FOR_KERNELS}.\n"
                                "ADIOS_FOR_MODELS                = .{ADIOS_FOR_MODELS}.\n"
                                "ADIOS_FOR_UNDO_ATTENUATION      = .{ADIOS_FOR_UNDO_ATTENUATION}.  \n" )

    #        self.conection = MongoClient(host=url)
    #        self.db = self.conection["verce-prov"]
    #        self.collection = self.db['lineage']
    # namefile='specfem.json'



    def form2vd(self, fields):

        l = []
        ld = {}
        for r in fields:
            name = r[u'name']
            try:
                ld[name] = r[u'value']
                value = r[u'value']
            except:
                ld[name] = None
                value = None  # if the value is not defined.....
            l.append('{KEY} = s.{KEY}'.format(KEY=name, VALUE=value))
        return l, ld

    def produceFileSpecfem_202_DEV(self, json):

        vs, ds = self.form2vd(json["fields"])
        s = Struct(**ds)

        # label="("+',\n'.join(v for v in vs)+")"
        # print label
        self.parfile = self.specfem3d_cartesian_202_dev_template.format(NPROC=s.NPROC,
                                                    NSTEP=s.NSTEP,
                                                    DT=s.DT,
                                                    SIMULATION_TYPE=s.SIMULATION_TYPE,
                                                    NOISE_TOMOGRAPHY=s.NOISE_TOMOGRAPHY,
                                                    SAVE_FORWARD=s.SAVE_FORWARD,
                                                    UTM_PROJECTION_ZONE=s.UTM_PROJECTION_ZONE,
                                                    SUPPRESS_UTM_PROJECTION=s.SUPPRESS_UTM_PROJECTION,
                                                    NGNOD=s.NGNOD,
                                                    MODEL=s.MODEL,
                                                    APPROXIMATE_OCEAN_LOAD=s.APPROXIMATE_OCEAN_LOAD,
                                                    TOPOGRAPHY=s.TOPOGRAPHY,
                                                    ATTENUATION=s.ATTENUATION,
                                                    ANISOTROPY=s.ANISOTROPY,
                                                    GRAVITY=s.GRAVITY,
                                                    TOMOGRAPHY_PATH=s.TOMOGRAPHY_PATH,
                                                    USE_OLSEN_ATTENUATION=s.USE_OLSEN_ATTENUATION,
                                                    PML_CONDITIONS=s.PML_CONDITIONS,
                                                    OLSEN_ATTENUATION_RATIO=s.OLSEN_ATTENUATION_RATIO,
                                                    PML_INSTEAD_OF_FREE_SURFACE=s.PML_INSTEAD_OF_FREE_SURFACE,
                                                    f0_FOR_PML=s.f0_FOR_PML,
                                                    STACEY_ABSORBING_CONDITIONS=s.STACEY_ABSORBING_CONDITIONS,
                                                    STACEY_INSTEAD_OF_FREE_SURFACE=s.STACEY_INSTEAD_OF_FREE_SURFACE,
                                                    CREATE_SHAKEMAP=s.CREATE_SHAKEMAP,
                                                    MOVIE_SURFACE=s.MOVIE_SURFACE,
                                                    MOVIE_TYPE=s.MOVIE_TYPE,
                                                    MOVIE_VOLUME=s.MOVIE_VOLUME,
                                                    SAVE_DISPLACEMENT=s.SAVE_DISPLACEMENT,
                                                    USE_HIGHRES_FOR_MOVIES=s.USE_HIGHRES_FOR_MOVIES,
                                                    NTSTEP_BETWEEN_FRAMES=s.NTSTEP_BETWEEN_FRAMES,
                                                    HDUR_MOVIE=s.HDUR_MOVIE,
                                                    SAVE_MESH_FILES=s.SAVE_MESH_FILES,
                                                    LOCAL_PATH=s.LOCAL_PATH,
                                                    NTSTEP_BETWEEN_OUTPUT_INFO=s.NTSTEP_BETWEEN_OUTPUT_INFO,
                                                    NTSTEP_BETWEEN_OUTPUT_SEISMOS=s.NTSTEP_BETWEEN_OUTPUT_SEISMOS,
                                                    NTSTEP_BETWEEN_READ_ADJSRC=s.NTSTEP_BETWEEN_READ_ADJSRC,
                                                    USE_FORCE_POINT_SOURCE=s.USE_FORCE_POINT_SOURCE,
                                                    USE_RICKER_TIME_FUNCTION=s.USE_RICKER_TIME_FUNCTION,
                                                    PML_WIDTH_MIN=s.PML_WIDTH_MIN,
                                                    PML_WIDTH_MAX=s.PML_WIDTH_MAX,
                                                    GPU_MODE=s.GPU_MODE,
                                                    ROTATE_PML_ACTIVATE=s.ROTATE_PML_ACTIVATE,
                                                    ROTATE_PML_ANGLE=s.ROTATE_PML_ANGLE,
                                                    PRINT_SOURCE_TIME_FUNCTION=s.PRINT_SOURCE_TIME_FUNCTION,
                                                    FULL_ATTENUATION_SOLID=s.FULL_ATTENUATION_SOLID,
                                                    COUPLE_WITH_EXTERNAL_CODE=s.COUPLE_WITH_EXTERNAL_CODE,
                                                    EXTERNAL_CODE_TYPE=s.EXTERNAL_CODE_TYPE,
                                                    TRACTION_PATH=s.TRACTION_PATH,
                                                    MESH_A_CHUNK_OF_THE_EARTH=s.MESH_A_CHUNK_OF_THE_EARTH,
                                                    ADIOS_ENABLED=s.ADIOS_ENABLED,
                                                    ADIOS_FOR_DATABASES=s.ADIOS_FOR_DATABASES,
                                                    ADIOS_FOR_MESH=s.ADIOS_FOR_MESH,
                                                    ADIOS_FOR_FORWARD_ARRAYS=s.ADIOS_FOR_FORWARD_ARRAYS,
                                                    ADIOS_FOR_KERNELS=s.ADIOS_FOR_KERNELS)

        filename = "specfem-" + str(uuid.uuid1()) + ".txt"
        outfile = self.__filespath__ + filename;

        return self.parfile

    def produceFileSpecfem_globe(self, json):

        vs, ds = self.form2vd(json["fields"])

        self.mapOutputSeismosFormat(ds)

        s = Struct(**ds)

        self.parfile = self.specfem3d_globe_template.format(NPROC_XI=s.NPROC_XI,
                                                    NPROC_ETA=s.NPROC_ETA,
                                                    RECORD_LENGTH_IN_MINUTES=s.RECORD_LENGTH_IN_MINUTES,
                                                    MODEL=s.MODEL,
                                                    GPU_MODE=s.GPU_MODE,
                                                    SIMULATION_TYPE=s.SIMULATION_TYPE,
                                                    NOISE_TOMOGRAPHY=s.NOISE_TOMOGRAPHY,
                                                    SAVE_FORWARD=s.SAVE_FORWARD,
                                                    ANGULAR_WIDTH_XI_IN_DEGREES=s.ANGULAR_WIDTH_XI_IN_DEGREES,
                                                    ANGULAR_WIDTH_ETA_IN_DEGREES=s.ANGULAR_WIDTH_ETA_IN_DEGREES,
                                                    CENTER_LATITUDE_IN_DEGREES=s.CENTER_LATITUDE_IN_DEGREES,
                                                    CENTER_LONGITUDE_IN_DEGREES=s.CENTER_LONGITUDE_IN_DEGREES,
                                                    GAMMA_ROTATION_AZIMUTH=s.GAMMA_ROTATION_AZIMUTH,
                                                    OCEANS=s.OCEANS,
                                                    ELLIPTICITY=s.ELLIPTICITY,
                                                    TOPOGRAPHY=s.TOPOGRAPHY,
                                                    GRAVITY=s.GRAVITY,
                                                    ROTATION=s.ROTATION,
                                                    ATTENUATION=s.ATTENUATION,
                                                    ABSORBING_CONDITIONS=s.ABSORBING_CONDITIONS,
                                                    NCHUNKS=s.NCHUNKS,
                                                    NEX_XI=s.NEX_XI,
                                                    NEX_ETA=s.NEX_ETA,
                                                    READ_ADJSRC_ASDF=s.READ_ADJSRC_ASDF,
                                                    ANISOTROPIC_KL=s.ANISOTROPIC_KL,
                                                    SAVE_TRANSVERSE_KL_ONLY=s.SAVE_TRANSVERSE_KL_ONLY,
                                                    APPROXIMATE_HESS_KL=s.APPROXIMATE_HESS_KL,
                                                    USE_FULL_TISO_MANTLE=s.USE_FULL_TISO_MANTLE,
                                                    SAVE_SOURCE_MASK=s.SAVE_SOURCE_MASK,
                                                    SAVE_REGULAR_KL=s.SAVE_REGULAR_KL,
                                                    MOVIE_SURFACE=s.MOVIE_SURFACE,
                                                    MOVIE_VOLUME=s.MOVIE_VOLUME,
                                                    MOVIE_COARSE=s.MOVIE_COARSE,
                                                    NTSTEP_BETWEEN_FRAMES=s.NTSTEP_BETWEEN_FRAMES,
                                                    HDUR_MOVIE=s.HDUR_MOVIE,
                                                    MOVIE_VOLUME_TYPE=s.MOVIE_VOLUME_TYPE,
                                                    MOVIE_TOP_KM=s.MOVIE_TOP_KM,
                                                    MOVIE_BOTTOM_KM=s.MOVIE_BOTTOM_KM,
                                                    MOVIE_WEST_DEG=s.MOVIE_WEST_DEG,
                                                    MOVIE_EAST_DEG=s.MOVIE_EAST_DEG,
                                                    MOVIE_NORTH_DEG=s.MOVIE_NORTH_DEG,
                                                    MOVIE_SOUTH_DEG=s.MOVIE_SOUTH_DEG,
                                                    MOVIE_START=s.MOVIE_START,
                                                    MOVIE_STOP=s.MOVIE_STOP,
                                                    NTSTEP_BETWEEN_OUTPUT_SEISMOS=s.NTSTEP_BETWEEN_OUTPUT_SEISMOS,
                                                    NTSTEP_BETWEEN_READ_ADJSRC=s.NTSTEP_BETWEEN_READ_ADJSRC,
                                                    PRINT_SOURCE_TIME_FUNCTION =s.PRINT_SOURCE_TIME_FUNCTION ,
                                                    OUTPUT_SEISMOS_ASCII_TEXT=s.OUTPUT_SEISMOS_ASCII_TEXT,
                                                    OUTPUT_SEISMOS_SAC_ALPHANUM = s.OUTPUT_SEISMOS_SAC_ALPHANUM,
                                                    OUTPUT_SEISMOS_SAC_BINARY = s.OUTPUT_SEISMOS_SAC_BINARY,
                                                    OUTPUT_SEISMOS_ASDF = s.OUTPUT_SEISMOS_ASDF,
                                                    ROTATE_SEISMOGRAMS_RT=s.ROTATE_SEISMOGRAMS_RT,
                                                    WRITE_SEISMOGRAMS_BY_MASTER=s.WRITE_SEISMOGRAMS_BY_MASTER,
                                                    SAVE_ALL_SEISMOS_IN_ONE_FILE=s.SAVE_ALL_SEISMOS_IN_ONE_FILE,
                                                    USE_BINARY_FOR_LARGE_FILE=s.USE_BINARY_FOR_LARGE_FILE,
                                                    RECEIVERS_CAN_BE_BURIED=s.RECEIVERS_CAN_BE_BURIED,
                                                    PARTIAL_PHYS_DISPERSION_ONLY =s.PARTIAL_PHYS_DISPERSION_ONLY ,
                                                    UNDO_ATTENUATION=s.UNDO_ATTENUATION,
                                                    MEMORY_INSTALLED_PER_CORE_IN_GB=s.MEMORY_INSTALLED_PER_CORE_IN_GB,
                                                    PERCENT_OF_MEM_TO_USE_PER_CORE=s.PERCENT_OF_MEM_TO_USE_PER_CORE,
                                                    EXACT_MASS_MATRIX_FOR_ROTATION=s.EXACT_MASS_MATRIX_FOR_ROTATION,
                                                    USE_LDDRK=s.USE_LDDRK,
                                                    INCREASE_CFL_FOR_LDDRK=s.INCREASE_CFL_FOR_LDDRK,
                                                    RATIO_BY_WHICH_TO_INCREASE_IT=s.RATIO_BY_WHICH_TO_INCREASE_IT,
                                                    SAVE_MESH_FILES=s.SAVE_MESH_FILES,
                                                    NUMBER_OF_RUNS=s.NUMBER_OF_RUNS,
                                                    NUMBER_OF_THIS_RUN=s.NUMBER_OF_THIS_RUN,
                                                    NUMBER_OF_SIMULTANEOUS_RUNS=s.NUMBER_OF_SIMULTANEOUS_RUNS,
                                                    BROADCAST_SAME_MESH_AND_MODEL=s.BROADCAST_SAME_MESH_AND_MODEL,
                                                    USE_FAILSAFE_MECHANISM=s.USE_FAILSAFE_MECHANISM,
                                                    GPU_RUNTIME=s.GPU_RUNTIME,
                                                    GPU_PLATFORM=s.GPU_PLATFORM,
                                                    GPU_DEVICE=s.GPU_DEVICE,
                                                    ADIOS_ENABLED=s.ADIOS_ENABLED,
                                                    ADIOS_FOR_FORWARD_ARRAYS=s.ADIOS_FOR_FORWARD_ARRAYS,
                                                    ADIOS_FOR_MPI_ARRAYS=s.ADIOS_FOR_MPI_ARRAYS,
                                                    ADIOS_FOR_ARRAYS_SOLVER=s.ADIOS_FOR_ARRAYS_SOLVER,
                                                    ADIOS_FOR_SOLVER_MESHFILES=s.ADIOS_FOR_SOLVER_MESHFILES,
                                                    ADIOS_FOR_AVS_DX=s.ADIOS_FOR_AVS_DX,
                                                    ADIOS_FOR_KERNELS=s.ADIOS_FOR_KERNELS,
                                                    ADIOS_FOR_MODELS=s.ADIOS_FOR_MODELS,
                                                    ADIOS_FOR_UNDO_ATTENUATION=s.ADIOS_FOR_UNDO_ATTENUATION)

        filename = "specfem-" + str(uuid.uuid1()) + ".txt"
        outfile = self.__filespath__ + filename;

        return self.parfile

    def mapOutputSeismosFormat(self, inputParams):

        inputParams[u'OUTPUT_SEISMOS_ASCII_TEXT'] = u'false'
        inputParams[u'OUTPUT_SEISMOS_SAC_ALPHANUM'] = u'false'
        inputParams[u'OUTPUT_SEISMOS_SAC_BINARY'] = u'false'
        inputParams[u'OUTPUT_SEISMOS_ASDF'] = u'false'

        if inputParams[u'OUTPUT_SEISMOS_FORMAT'] == u'SAC_ALPHANUM':
            inputParams[u'OUTPUT_SEISMOS_SAC_ALPHANUM'] = u'true'
        elif inputParams[u'OUTPUT_SEISMOS_FORMAT'] == u'SAC_BINARY':
            inputParams[u'OUTPUT_SEISMOS_SAC_BINARY'] = u'true'
        elif inputParams[u'OUTPUT_SEISMOS_FORMAT'] == u'ASDF':
            inputParams[u'OUTPUT_SEISMOS_ASDF'] = u'true'
        else:
            inputParams[u'OUTPUT_SEISMOS_ASCII_TEXT'] = u'true'

        return inputParams