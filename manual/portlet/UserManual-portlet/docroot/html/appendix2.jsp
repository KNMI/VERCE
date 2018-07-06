<%@page contentType="text/html" pageEncoding="UTF-8"%>
<meta http-equiv="Content-Type" content="text/html;" charset="utf-8">

<%@ include file="header.jsp" %>
<%@ include file="menu.jsp" %>
<div class="wy-body-for-nav">

    <div class="wy-grid-for-nav">

        <section data-toggle="wy-nav-shift" class="wy-nav-content-wrap">

            <nav class="wy-nav-top" aria-label="top navigation">

                <i data-toggle="wy-nav-top" class="fa fa-bars"></i>
                <a href="index.jsp">VERCE Portal Manual</a>

            </nav>

            <div class="wy-nav-content-custom">

                <div class="rst-content">

                    <div role="navigation" aria-label="breadcrumbs navigation">

                        <ul class="wy-breadcrumbs">

                            <li><a href="index.html">Docs</a> &raquo;</li>

                            <li>Appendix 2 – SPECFEM3D_GLOBE’s Flags</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="appendix-2-specfem3d-globes-flags">
                                <h1>Appendix 2 – SPECFEM3D_GLOBE’s Flags<a class="headerlink" href="#appendix-2-specfem3d-globes-flags" title="Permalink to this headline"></a></h1>
                                <p>The input parameters for the code of SPECFEM3D_GLOBE are briefly described below. For a detailed description please consult the SPECFEM3D_GLOBE manual.</p>
                                <div class="section" id="a2-1-group-0-basic">
                                    <h2>A2.1 Group 0 - Basic<a class="headerlink" href="#a2-1-group-0-basic" title="Permalink to this headline"></a></h2>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image12.png' target="_blank">
                                        <img alt="image0" src='<%=request.getContextPath()%>/images/image12.png' />
                                    </a>
                                    <p><strong>Figure A2.1:</strong> Parameter form for ‘Group 0 - Basic’.</p>
                                    <p><strong>NPROC</strong> is the number of processors that the simulation will run on. This is essentially dependent upon the high-performance computer and workflow you intend to submit your job to.</p>
                                    <p><strong>RECORD_LENGTH_IN_MINUTES</strong> is the time in minutes you want to run the simulation for.</p>
                                    <p><strong>MODEL</strong> is the velocity model to be used in the simulation. There is a range of models pre-loaded into the solver SPECFEM3D_GLOBE. (See the code’s manual for all the available options).</p>
                                    <p><strong>GPU_MODE</strong> allows SPECFEM to be run on high performance computers that use graphical processing units (GPUs) rather than the more conventional CPU (central processing unit). All the workflows currently available on the VERCE platform use CPUs, so you should always leave this box unchecked.</p>
                                </div>
                                <div class="section" id="a2-2-group-1-inverse-problem">
                                    <h2>A2.2 Group 1 – Inverse Problem<a class="headerlink" href="#a2-2-group-1-inverse-problem" title="Permalink to this headline"></a></h2>

                                    <a href='<%=request.getContextPath()%>/images/image21.png' target="_blank">
                                        <img alt="image1" src='<%=request.getContextPath()%>/images/image21.png' />
                                    </a>
                                    <p><strong>Figure A2.2:</strong> Parameter form for ‘Group 1 – Inverse Problem’.</p>
                                    <p><strong>SIMULATION_TYPE</strong> is set to ‘<em>forward</em>’ by default to model the wave-field from an earthquake.</p>
                                    <p><strong>NOISE_TOMOGRAPHY</strong> is set to ‘<em>earthquake simulation</em>’ by default as the noise tomography applications of SPECFEM are not currently supported within the VERCE platform.</p>
                                    <p><strong>SAVE_FORWARD</strong> is selected if the last step of the wave-field is to be saved. This enables to back reconstruct the seismic wave-field, but requires a large amount of storage space and it is not yet supported by the VERCE platform.</p>
                                </div>
                                <div class="section" id="a2-3-group-2-simulation-area">
                                    <h2>A2.3 Group 2 – Simulation Area<a class="headerlink" href="#a2-3-group-2-simulation-area" title="Permalink to this headline"></a></h2>
                                   
                                    <a href='<%=request.getContextPath()%>/images/image31.png' target="_blank">
                                        <img alt="image2" src='<%=request.getContextPath()%>/images/image31.png' />
                                    </a>
                                    <p><strong>Figure A2.3:</strong> Parameter form for ‘Group 2 – Simulation Area’.</p>
                                    <p><strong>ANGULAR_WIDTH_XI_IN_DEGREES</strong> is the width of one side of the chunk in degrees.</p>
                                    <p><strong>ANGULAR_WIDTH_ETA_IN_DEGREES</strong> is the width of the second side of the chunk in degrees.</p>
                                    <p><strong>CENTER_LATITUDE_IN_DEGREES</strong> is the latitude of centre of the chunk in degrees.</p>
                                    <p><strong>CENTER_LONGITUDE_IN_DEGREES</strong> is the longitude of centre of the chunk in degrees.</p>
                                    <p><strong>GAMMA_ROTATION_AZIMUTH</strong> defines the rotation angle of the chunk about its centre measured counter clockwise from due North in degrees.</p>
                                    <p><strong>OCEANS</strong> can be selected if the effect of the oceans on seismic wave propagation should be incorporated based upon the approximate treatment discussed in Komatitsch and Tromp (2002).</p>
                                    <p><strong>ELLIPTICITY</strong> can be selected if the mesh should make the Earth model elliptical in shape according to Clairaut’s equation.</p>
                                    <p><strong>TOPOGRAPHY</strong> can be selected if topography and bathymetry should be incorporated based upon model ETOPO4.</p>
                                    <p><strong>GRAVITY</strong> can be selected if self-gravitation should be incorporated in the Cowling approximation.</p>
                                    <p><strong>ROTATION</strong> can be selected if the Coriolis effect should be incorporated. Turning this feature on is relatively cheap numerically.</p>
                                    <p><strong>ATTENUATION</strong> can be selected if attenuation should be incorporated.</p>
                                    <p><strong>ABSORBING_CONDITIONS</strong> is selected only for regional simulations.</p>
                                </div>
                                <div class="section" id="a2-4-group-3-mesh-parameters">
                                    <h2>A2.4 Group 3 – Mesh Parameters<a class="headerlink" href="#a2-4-group-3-mesh-parameters" title="Permalink to this headline"></a></h2>

                                    <a href='<%=request.getContextPath()%>/images/image41.png' target="_blank">
                                        <img alt="image3" src='<%=request.getContextPath()%>/images/image41.png' />
                                    </a>
                                    <p><strong>Figure A2.4:</strong> Parameter form for ‘Group 3 – Mesh Parameters’.</p>
                                    <p><strong>NCHUNKS</strong> is the number of chunks.</p>
                                    <p><strong>NEX_XI</strong> is the number of elements at the surface along the xi side of a chunk.</p>
                                    <p><strong>NEX_ETA</strong> is the number of elements at the surface along the eta side of a chunk.</p>
                                    <p><strong>NPROC_XI</strong> is the number of MPI processors along the xi side of a chunk.
                                    </p>
                                    <p><strong>NPROC_ETA</strong> is the number of MPI processors along the eta side of a chunk.
                                    </p>
                                </div>
                                <div class="section" id="a2-5-group-4-adjoint-kernel-options">
                                    <h2>A2.5 Group 4 – Adjoint Kernel Options<a class="headerlink" href="#a2-5-group-4-adjoint-kernel-options" title="Permalink to this headline"></a></h2>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image51.png' target="_blank">
                                        <img alt="image4" src='<%=request.getContextPath()%>/images/image51.png' />
                                    </a>
                                    <p><strong>Figure A2.5:</strong> Parameter form for ‘Group 4 – Adjoint Kernel Options’.
                                    </p>
                                    <p><strong>READ_ADJSRC_ASDF</strong> can be selected to use ASDF format for reading the adjoint sources.</p>
                                    <p><strong>ANISOTROPIC_KL</strong> can be used to compute anisotropic kernels in crust and mantle.</p>
                                    <p><strong>SAVE_TRANSVERSE_KL_ONLY</strong> can be used to output only transverse isotropic kernels rather than fully anisotropic kernels when
                                        <strong>ANISOTROPIC_KL</strong> above is selected.</p>
                                    <p><strong>APPROXIMATE_HESS_KL</strong> can be used to output approximate Hessian in crust mantle region.</p>
                                    <p><strong>USE_FULL_TISO_MANTLE</strong> can be used to force transverse isotropy for all mantle elements.</p>
                                    <p><strong>SAVE_SOURCE_MASK</strong> can be used to output kernel mask to zero out source region to remove large values near the sources in the sensitivity kernels.
                                    </p>
                                    <p><strong>SAVE_REGULAR_KL</strong> can be used to output kernels on a regular grid instead of on the GLL mesh points.</p>
                                </div>
                                <div class="section" id="a2-6-group-5-movie">
                                    <h2>A2.6 Group 5 - Movie<a class="headerlink" href="#a2-6-group-5-movie" title="Permalink to this headline"></a></h2>
                                    <table border="1" class="docutils">
                                        <colgroup>
                                            <col width="50%" />
                                            <col width="50%" />
                                        </colgroup>
                                        <tbody valign="top">
                                            <tr class="row-odd">
                                                <td style="background-color: white; padding:0;">
                                                    <a href='<%=request.getContextPath()%>/images/image61.png' target="_blank">
                                                        <img alt="image5" src='<%=request.getContextPath()%>/images/image61.png' />
                                                    </a>
                                                </td>
                                                <td style="background-color: white; padding:0;">
                                                    <a href='<%=request.getContextPath()%>/images/image71.png' target="_blank">
                                                        <img alt="image6" src='<%=request.getContextPath()%>/images/image71.png' />
                                                    </a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p class="centered">
                                        <strong><strong>Figure A2.6:</strong> Parameter form for ‘Group 5 - Movie’.</strong>
                                    </p>
                                    <p><strong>MOVIE_SURFACE</strong> creates a movie of seismic wave propagation on the Earth’s surface.</p>
                                    <p><strong>MOVIE_VOLUME</strong> creates a movie of seismic wave propagation in the Earth’s interior.</p>
                                    <p><strong>MOVIE_COARSE</strong> saves movie only at corners of elements.</p>
                                    <p><strong>NTSTEP_BETWEEN_FRAMES</strong> determines the number of timesteps between two movie frames.</p>
                                    <p><strong>HDUR_MOVIE</strong> determines the half duration of the source time function for the movie simulations.</p>
                                    <p><strong>MOVIE_VOLUME_TYPE</strong> allows you to select movie volume type option where 1=strain, 2=time integral of strain, 3=µ*time integral of strain, 4= saves the trace and deviatoric stress in the whole volume, 5=displacement, 6=velocity.</p>
                                    <p><strong>MOVIE_TOP_KM/MOVIE_BOTTOM_KM</strong> defines depth below the surface in kilometres.
                                    </p>
                                    <p><strong>MOVIE_WEST_DEG</strong> refers to longitude, degrees West.</p>
                                    <p><strong>MOVIE_EAST_DEG</strong> refers to longitude, degrees East.</p>
                                    <p><strong>MOVIE_NORTH_DEG</strong> refers to latitude, degrees North.</p>
                                    <p><strong>MOVIE_SOUTH_DEG</strong> refers to latitude, degrees South.</p>
                                    <p><strong>MOVIE_START</strong> denotes movie start time.</p>
                                    <p><strong>MOVIE_STOP</strong> denotes movie end time.</p>
                                </div>
                                <div class="section" id="a2-7-group-6-sources">
                                    <h2>A2.7 Group 6 - Sources<a class="headerlink" href="#a2-7-group-6-sources" title="Permalink to this headline"></a></h2>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image81.png' target="_blank">
                                        <img alt="image7" src='<%=request.getContextPath()%>/images/image81.png' />
                                    </a>
                                    <p><strong>Figure A2.7:</strong> Parameter form for ‘Group 6 - Sources’.</p>
                                    <p><strong>NTSTEP_BETWEEN_READ_ADJSRC</strong> refers to the number of adjoint sources read in each time for an adjoint simulation.</p>
                                    <p><strong>PRINT_SOURCE_TIME_FUNCTION</strong> prints information about the source time function in the file OUTPUT_FILES/plot_source_time_function.txt.
                                    </p>
                                </div>
                                <div class="section" id="a2-8-group-7-seismograms">
                                    <h2>A2.8 Group 7 - Seismograms<a class="headerlink" href="#a2-8-group-7-seismograms" title="Permalink to this headline"></a></h2>
                                     
                                    <a href='<%=request.getContextPath()%>/images/image91.png' target="_blank">
                                        <img alt="image8" src='<%=request.getContextPath()%>/images/image91.png' />
                                    </a>
                                    <p><strong>Figure A2.8:</strong> Parameter form for ‘Group 7 - Seismograms’.</p>
                                    <p><strong>NTSTEP_BETWEEN_OUTPUT_SEISMOS</strong> specifies the interval at which synthetic seismograms are written in the LOCAL_PATH directory.</p>
                                    <p><strong>OUTPUT_SEISMOS_FORMAT</strong> allows you to select the output format for the seismograms such as ASCII, SAC_ALPHANUM, SAC_BINARY and ASDF.</p>
                                    <p><strong>ROTATE_SEISMOGRAMS_RT</strong> can be selected to have radial (R) and transverse (T) horizontal components of the synthetic seismograms.</p>
                                    <p><strong>WRITE_SEISMOGRAMS_BY_MASTER</strong> can be selected to have all the seismograms written by the master.</p>
                                    <p><strong>SAVE_ALL_SEISMOS_IN_ONE_FILE</strong> saves all seismograms in one large combined file instead of one file per seismogram.</p>
                                    <p><strong>USE_BINARY_FOR_LARGE_FILE</strong> can be selected to use binary instead of ASCII for that large file.</p>
                                    <p><strong>RECEIVERS_CAN_BE_BURIED</strong> can be used to accommodate stations with instruments that are buried, i.e., the solver will calculate seismograms at the burial depth specified in the STATIONS file.</p>
                                </div>
                                <div class="section" id="a2-9-group-8-advanced">
                                    <h2>A2.9 Group 8 - Advanced<a class="headerlink" href="#a2-9-group-8-advanced" title="Permalink to this headline"></a></h2>
                                    <table border="1" class="docutils">
                                        <colgroup>
                                            <col width="48%" />
                                            <col width="52%" />
                                        </colgroup>
                                        <tbody valign="top">
                                            <tr class="row-odd">
                                                <td style="background-color: white; padding:0;">
                                                    <a href='<%=request.getContextPath()%>/images/image101.png' target="_blank">
                                                        <img alt="image9" src='<%=request.getContextPath()%>/images/image101.png' />
                                                    </a>
                                                </td>
                                                <td style="background-color: white; padding:0;">
                                                    <a href='<%=request.getContextPath()%>/images/image111.png' target="_blank">
                                                        <img alt="image10" src='<%=request.getContextPath()%>/images/image111.png' />
                                                    </a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p class="centered">
                                        <strong><strong>Figure A2.8:</strong> Parameter form for ‘Group 8 - Advanced’.</strong>
                                    </p>
                                    <p><strong>PARTIAL_PHYS_DISPERSION_ONLY</strong> or <strong>UNDO_ATTENUATION</strong> can be used to undo attenuation for sensitivity kernel calculations or forward runs with SAVE_FORWARD</p>
                                    <p><strong>MEMORY_INSTALLED_PER_CORE_IN_GB</strong> is used to set the amount of memory installed per core in Gigabyte.</p>
                                    <p><strong>PERCENT_OF_MEM_TO_USE_PER_CORE</strong> can be used to set percentage of memory to use per core for arrays to undo attenuation, keeping in mind that you need to leave some memory available for the GNU/Linux system to run.</p>
                                    <p><strong>EXACT_MASS_MATRIX_FOR_ROTATION</strong> can be selected if you are interested in precise effects related to rotation.</p>
                                    <p><strong>USE_LDDRK</strong> can be used for LDDRK high-order time scheme instead of Newmark.
                                    </p>
                                    <p><strong>INCREASE_CFL_FOR_LDDRK</strong> can be used to increase CFL for LDDRK.</p>
                                    <p><strong>RATIO_BY_WHICH_TO_INCREASE_IT</strong> determines the ratio by which to increase CFL.</p>
                                    <p><strong>SAVE_MESH_FILES</strong> can be used to save AVS, OpenDX, or ParaView mesh files for subsequent viewing.</p>
                                    <p><strong>NUMBER_OF_RUNS</strong> refers to the number of stages in which the simulation will be completed, e.g. 1 corresponds to a run without restart files.</p>
                                    <p><strong>NUMBER_OF_THIS_RUN</strong> can be used if you choose to perform the run in stages in which you need to tell the solver what stage run to perform.
                                    </p>
                                    <p><strong>NUMBER_OF_SIMULTANEOUS_RUNS</strong> adds the ability to run several calculations (several earthquakes) in an embarrassingly-parallel fashion from within the same run.</p>
                                    <p><strong>BROADCAST_SAME_MESH_AND_MODEL</strong> allows to read the mesh and model files from a single run in the beginning and broadcast them to all the others (if the mesh and the model are the same for all simultaneous runs).
                                    </p>
                                    <p><strong>USE_FAILSAFE_MECHANISM</strong> can be used to terminate all the runs or let the others finish using a fail-safe mechanism if one or a few of simultaneous runs fail.</p>
                                    <p><strong>GPU_RUNTIME</strong> can only be used if GPU_MODE is selected.</p>
                                    <p><strong>GPU_PLATFORM</strong> filters on the platform in OpenCL.</p>
                                    <p><strong>GPU_DEVICE</strong> filters on the device name in OpenCL.</p>
                                    <p><strong>ADIOS_ENABLED</strong> and all the other ADIOS flags enable the use of ADIOS library for I/Os.</p>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/appendix3.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/appendix1.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>