#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Input file writer for SPECFEM3D_CARTESIAN.

:copyright:
    Emanuele Casarotti (emanuele.casarotti@ingv.it), 2013
    Lion Krischer (krischer@geophysik.uni-muenchen.de), 2013
:license:
    GNU General Public License, Version 3
    (http://www.gnu.org/copyleft/gpl.html)
"""
import inspect
import math
import os
# Define the required configuration items. The key is always the name of the
# configuration item and the value is a tuple. The first item in the tuple is
# the function or type that it will be converted to and the second is the
# documentation.
REQUIRED_CONFIGURATION = {
    "NPROC": (int, "number of MPI processors"),
    "NSTEP": (int, "The number of time steps"),
    "DT": (float, "The time increment in seconds"),
    "SIMULATION_TYPE": (
        int, "forward or adjoint simulation, 1 = forward, "
             "2 = adjoint, 3 = both simultaneously")
}

# The default configuration item. Contains everything that can sensibly be set
# to some default value. The syntax is very similar to the
# REQUIRED_CONFIGURATION except that the tuple now has three items, the first
# one being the actual default value.
DEFAULT_CONFIGURATION = {
    "NOISE_TOMOGRAPHY": (
        0, int, "noise tomography simulation, "
                "0 = earthquake simulation,  1/2/3 = three steps in noise simulation"),
    "SAVE_FORWARD": (False, bool, "save forward wavefield"),
    "UTM_PROJECTION_ZONE": (
        11, int,
        "set up the utm zone, if SUPPRESS_UTM_PROJECTION is false"),
    "SUPPRESS_UTM_PROJECTION": (True, bool, "suppress the utm projection"),
    "NGNOD": (
        8, int, "number of nodes for 2D and 3D shape functions for "
                "hexahedral,we use either 8-node mesh elements (bricks) or 27-node "
                "elements.If you use our internal mesher, the only option is 8-node "
                "bricks (27-node elements are not supported)"),
    "MODEL": (
        "default", str, "setup the geological models, options are: "
                        "default (model parameters described by mesh properties), 1d_prem,"
                        "1d_socal,1d_cascadia,aniso,external,gll,salton_trough,tomo"),
    "SEP_MODEL_DIRECTORY": (
        "./DATA/my_SEP_model/", str, "SEP model folder if you are using one"),
    "APPROXIMATE_OCEAN_LOAD": (
        False, bool, "see SPECFEM3D_CARTESIAN manual"),
    "TOPOGRAPHY": (False, bool, "see SPECFEM3D_CARTESIAN manual"),
    "ATTENUATION": (False, bool, "see SPECFEM3D_CARTESIAN manual"),
    "FULL_ATTENUATION_SOLID": (
        False, bool, "see SPECFEM3D_CARTESIAN manual"),
    "ANISOTROPY": (False, bool, "see SPECFEM3D_CARTESIAN manual"),
    "GRAVITY": (False, bool, "see SPECFEM3D_CARTESIAN manual"),
    "TOMOGRAPHY_PATH": ("../DATA/tomo_files/", str,
                        "path for external tomographic models files"),
    "USE_OLSEN_ATTENUATION": (
        False, bool,
        "use the Olsen attenuation, Q_mu = constant * v_s attenuation rule"),
    "OLSEN_ATTENUATION_RATIO": (
        0.05, float,
        "Olsen's constant for Q_mu = constant * v_s attenuation rule"),
    "PML_CONDITIONS": (
        False, bool,
        "C-PML boundary conditions for a regional simulation"),
    "PML_INSTEAD_OF_FREE_SURFACE": (
        False, bool,
        "C-PML boundary conditions instead of free surface on the top"),
    "f0_FOR_PML": (12.7, float, "C-PML dominant frequency,see manual"),
    "STACEY_ABSORBING_CONDITIONS": (
        False, bool,
        "Stacey absorbing boundary conditions for a regional simulation"),
    "STACEY_INSTEAD_OF_FREE_SURFACE": (
        False, bool, "Stacey absorbing top "
                     "surface (defined in mesh as 'free_surface_file')"),
    "CREATE_SHAKEMAP": (False, bool, "save shakemap files"),
    "MOVIE_SURFACE": (
        False, bool,
        "save velocity snapshot files only for surfaces"),
    "MOVIE_TYPE": (1, int, ""),
    "MOVIE_VOLUME": (
        False, bool,
        "save the entire volumetric velocity snapshot files "),
    "SAVE_DISPLACEMENT": (
        False, bool,
        "save displacement instead velocity in the snapshot files"),
    "USE_HIGHRES_FOR_MOVIES": (
        False, bool,
        "save high resolution snapshot files (all GLL points)"),
    "NTSTEP_BETWEEN_FRAMES": (
        200, int,
        "number of timesteps between 2 consecutive snapshots"),
    "HDUR_MOVIE": (0.0, float,
                   "half duration for snapshot files"),
    "SAVE_MESH_FILES": (
        False, bool,
        "save VTK mesh files to check the mesh"),
    "LOCAL_PATH": (
        "../OUTPUT_FILES/DATABASES_MPI", str,
        "path to store the local database file on each node"),
    "NTSTEP_BETWEEN_OUTPUT_INFO": (
        500, int, "interval at which we output "
                  "time step info and max of norm of displacement"),
    "NTSTEP_BETWEEN_OUTPUT_SEISMOS": (
        10000, int,
        "interval in time steps for writing of seismograms"),
    "NTSTEP_BETWEEN_READ_ADJSRC": (
        0, int, "interval in time steps for "
                "reading adjoint traces,0 = read the whole adjoint sources at the "
                "same time"),
    "USE_FORCE_POINT_SOURCE": (
        False, bool, "# use a (tilted) "
                     "FORCESOLUTION force point source (or several) instead of a "
                     "CMTSOLUTION moment-tensor source. If this flag is turned on, "
                     "the FORCESOLUTION file must be edited by precising:\n- the "
                     "corresponding time-shift parameter,\n - the half duration parameter "
                     "of the source,\n - the coordinates of the source,\n - the magnitude "
                     "of the force source,\n - the components of a (non-unitary) direction "
                     "vector for the force source in the E/N/Z_UP basis.\n The direction "
                     "vector is made unitary internally in the code and thus only its "
                     "direction matters here;\n its norm is ignored and the norm of the "
                     "force used is the factor force source times the source time "
                     "function."),
    "USE_RICKER_TIME_FUNCTION": (
        False, bool, "set to true to use a Ricker "
                     "source time function instead of the source time functions set by "
                     "default to represent a (tilted) FORCESOLUTION force point source or "
                     "a CMTSOLUTION moment-tensor source."),
    "GPU_MODE": (False, bool, "set .true. for GPU support"),
    "ROTATE_PML_ACTIVATE": (False, bool, ""),
    "ROTATE_PML_ANGLE": (0.0, float, ""),
    "PRINT_SOURCE_TIME_FUNCTION": (False, bool, ""),
    "COUPLE_WITH_EXTERNAL_CODE": (False, bool, ""),
    "EXTERNAL_CODE_TYPE": (1, int, "1 = DSM, 2 = AxiSEM, 3 = FK"),
    "TRACTION_PATH": ("./DATA/DSM_tractions_for_specfem3D/", str, ""),
    "MESH_A_CHUNK_OF_THE_EARTH": (True, bool, ""),
    "ADIOS_ENABLED": (False, bool, ""),
    "ADIOS_FOR_DATABASES": (False, bool, ""),
    "ADIOS_FOR_MESH": (False, bool, ""),
    "ADIOS_FOR_FORWARD_ARRAYS": (False, bool, ""),
    "ADIOS_FOR_KERNELS": (False, bool, ""),
}


def write(config):
    """
    Writes a Par_file for SPECFEM3D_CARTESIAN.
    """

    def fbool(value):
        """
        Convert a value to a FORTRAN boolean representation.
        """
        if value:
            return ".true."
        else:
            return ".false."

    for key, value in config.iteritems():
        if isinstance(value, bool):
            config[key] = fbool(value)

    template_file = os.path.join(os.path.dirname(os.path.abspath(
        inspect.getfile(inspect.currentframe()))),
        "specfem_cartesian_202_dev_par_file.template")
    with open(template_file, "rt") as fh:
        par_file_template = fh.read()

    par_file = par_file_template.format(**config).strip()

    return par_file