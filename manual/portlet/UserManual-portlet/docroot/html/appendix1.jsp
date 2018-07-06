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

                            <li>Appendix 1 – SPECFEM3D_Cartesian’s Flags</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="appendix-1-specfem3d-cartesians-flags">
                                <h1>Appendix 1 – SPECFEM3D_Cartesian’s Flags<a class="headerlink" href="#appendix-1-specfem3d-cartesians-flags" title="Permalink to this headline"></a></h1>
                                <p>The input parameters for the code SPECFEM3D_Cartesian are briefly described below. Please see the manual of the code for a detailed description.
                                </p>
                                <div class="section" id="a1-1-group-0-basic">
                                    <h2>A1.1 Group 0 - Basic<a class="headerlink" href="#a1-1-group-0-basic" title="Permalink to this headline"></a></h2>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image1.png' target="_blank">
                                        <img alt="image0" src='<%=request.getContextPath()%>/images/image1.png' style="width: 622.4px; height: 307.2px;" />
                                    </a>
                                    
                                    <p><strong>Figure A1.1:</strong> Parameter form for ‘Group 0 - Basic’.</p>
                                    <p><strong>NPROC</strong> is the number of processors that the simulation is run on. This is essentially dependent upon the high performance computer and workflow you intend to submit your job to.</p>
                                    <p><strong>NSTEP</strong> is the number of time steps that you want to run your simulation for. This should be set so that (NSTEP * DT) is equal to the time in seconds you want to simulate. So the model setup shown above will run a simulation of 60 seconds, and provide synthetic seismograms for 60 seconds after the origin time of the simulated earthquake.</p>
                                    <p><strong>DT</strong> is the time step in seconds used in the solver. This must be small enough to ensure that the simulated waveform is properly sampled and that the calculations are stable. The equations this is based on are given in section 8 of this guide. For the meshes and models that are already available in the portal though, the recommended DT is given in Figure 4.4 and is the default in the portal.</p>
                                    <p><strong>MODEL</strong> allows you to select the velocity model that is used in the simulation. Leaving this to ‘<em>default’</em> will select the 3D velocity model that is specified in the drop down menu next to ‘<em>Velocity
Model</em>’, at the top of the input parameters panel. It is however also possible to select from a range of 1D models that are pre-loaded into the solver SPECFEM3D_Cartesian. (See the code’s manual for all the available options).</p>
                                    <p><strong>GPU_MODE</strong> allows SPECFEM to be run on high performance computers that use graphical processing units (GPUs) rather than the more conventional CPU (central processing unit). All the workflows currently available on the VERCE platform use CPUs, so you should always leave this box unchecked.</p>
                                </div>
                                <div class="section" id="a1-2-group-1-inverse-problem">
                                    <h2>A1.2 Group 1 – Inverse problem<a class="headerlink" href="#a1-2-group-1-inverse-problem" title="Permalink to this headline"></a></h2>
                                    <p>In addition to calculating the wavefield from an earthquake source (referred to as a ‘forward simulation’), SPECFEM can also be used to calculate the adjoint wavefield, as well as being able to simulate noise sources for ambient noise tomography applications. These options are controlled by this group of parameters.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image2.png' target="_blank">
                                           <img alt="image1" src='<%=request.getContextPath()%>/images/image2.png' />
                                    </a>
                                    <p><strong>Figure A1.2:</strong> Parameter form for ‘Group 1 – Inverse problem’.</p>
                                    <p><strong>SIMULATION_TYPE</strong> is set to ‘<em>forward</em>’ by default to model the wave-field from an earthquake.</p>
                                    <p><strong>NOISE_TOMOGRAPHY</strong> is set to ‘<em>earthquake simulation</em>’ by default as the noise tomography applications of SPECFEM are not currently supported within the VERCE platform.</p>
                                    <p><strong>SAVE_FORWARD</strong> is selected if the last step of the wave-field is to be saved. This enables to back reconstruct the seismic wave-field, but requires a large amount of storage space and it is not yet supported by the VERCE platform.</p>
                                </div>
                                <div class="section" id="a1-3-group-2-utm-projection">
                                    <h2>A1.3 Group 2 – UTM projection<a class="headerlink" href="#a1-3-group-2-utm-projection" title="Permalink to this headline"></a></h2>
                                    <p>As SPECFEM3D_Cartesian uses, unsurprisingly, Cartesian coordinates, you must specify the UTM zone that your model falls in. This is described in more detail in section 8 when we consider uploading new meshes and models. For the pre-loaded meshes and models though the correct UTM zone is given by the tables shown in Figures 4.4 and 4.5, and is set correctly by default when the mesh is selected.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image3.png' target="_blank">
                                           <img alt="image2" src='<%=request.getContextPath()%>/images/image3.png' />
                                    </a>
                                    
                                    <p><strong>Figure A1.3:</strong> Parameter form for ‘Group 2 – UTM projection’.</p>
                                    <p><strong>UTM_PROJECTION_ZONE</strong> is where the UTM zone is specified. Only valid when SUPPRESS_UTM_PROJECTION is unchecked (as in our case).</p>
                                    <p><strong>SUPPRESS_UTM_PROJECTION</strong> is not enabled in the VERCE platform, meaning the model range must always be specified in geographical coordinates (not Cartesian coordinates) and the conversion will be done inside the code.</p>
                                </div>
                                <div class="section" id="a1-4-group-3-attenuation">
                                    <h2>A1.4 Group 3 – Attenuation<a class="headerlink" href="#a1-4-group-3-attenuation" title="Permalink to this headline"></a></h2>
                                    <p>In the Earth seismic waves are attenuated by the visco-elastic deformation as the wave propagates. If we are to gain simulated seismic waves with a similar amplitude to the recorded waves, we must include this attenuation in our waveform simulation.</p>

                                    <a href='<%=request.getContextPath()%>/images/image4.png' target="_blank">
                                        <img alt="image3" src='<%=request.getContextPath()%>/images/image4.png' style="width: 376.0px; height: 320.8px;" />
                                    </a>

                                    <p><strong>Figure A1.4:</strong> Parameter form for ‘Group 3 – Attenuation’.</p>
                                    <p><strong>ATTENUATION</strong> controls whether attenuation is incorporated or not. Turning attenuation on means that extra variables are generated, and therefore will increase the time taken for the simulation to run and also the memory requirements.</p>
                                    <p><strong>USE_OLSEN_ATTENUATION</strong> can be used to define the attenuation model from the S-wave velocity using the empirical relationship proposed by Olsen et al. (2003).</p>
                                    <p><strong>OLSEN_ATTENUATION_RATIO</strong> determines the Olsen’s constant in Olsen’s empirical relation and should be in the range of 0.02-0.1.</p>
                                    <p><strong>MIN_ATTENUATION_PERIOD</strong> is the minimum of the attenuation period range over which we try to mimic a constant Q factor.</p>
                                    <p><strong>MAX_ATTENUATION_PERIOD</strong> is the maximum of the attenuation period range over which we try to mimic a constant Q factor.</p>
                                    <p><strong>COMPUTE_FREQ_BAND_AUTOMATIC</strong> is used to ignore the above range and ask the code to compute it automatically based on the estimated resolution of the mesh.</p>
                                    <p><strong>ATTENUATION_f0_REFERENCE</strong> is the reference frequency for target velocity values in the velocity model.</p>
                                </div>
                                <div class="section" id="a1-5-group-4-absorbing-boundary-conditions">
                                    <h2>A1.5 Group 4 – Absorbing Boundary Conditions<a class="headerlink" href="#a1-5-group-4-absorbing-boundary-conditions" title="Permalink to this headline"></a></h2>
                                    <p>Parameters of this group allow to choose between Stacey absorbing conditions or ‘convolutional perfectly matched layers’ (CPMLs) The last ones are the most effective and therefore computationally efficient absorbing boundary conditions and should be considered for all new meshes that are uploaded. It is especially important that they are used in models where you are particularly worried about side reflections (e.g. models where receivers or particularly sources are very close to the model edge). For a full discussion of the relative merits of the two methods, please see the SPECFEM3D_Cartesian manual.</p>
                                   
                                    <a class="reference internal" href='<%=request.getContextPath()%>/images/image5.png' target="_blank">
                                        <img alt="image4" src='<%=request.getContextPath()%>/images/image5.png' style="width: 578.4px; height: 340.0px;" />
                                    </a>
                                    
                                    <p><strong>Figure A1.5:</strong> Parameter form for ‘Group 4 – Absorbing Boundary Conditions’.
                                    </p>
                                    <p><strong>PML_CONDITIONS</strong> select whether CPMLs are implemented. Please ensure that Stacey absorbing conditions are unchecked if you do this. If PML_CONDITIONS and STACEY_ABSORBING_CONDITIONS are both unchecked, you get a free surface instead.</p>
                                    <p><strong>PML_INSTEAD_OF_FREE_SURFACE</strong> replaces the free surface at the top of the model with a PML absorbing layer. This can be useful if you are simulating a deep model, rather than a model that includes the Earth’s surface.
                                    </p>
                                    <p><strong>f0_FOR_PML</strong> is the dominant frequency of CPML, or the frequency at which the PML will be the most effective. It should therefore be set to the dominant frequency of the waveforms being simulated.</p>
                                    <p><strong>STACEY_ABSORBING_CONDITIONS</strong> is selected to activate Clayton-Enquist absorbing boundary conditions on the sides and bottom of the simulated areas. This is designed to prevent artificial reflections from the model edges from affecting the simulated waveforms.</p>
                                    <p><strong>ROTATE_PML_ACTIVATE</strong> parameter used to rotate C-PML boundary conditions by a given angle (not implemented yet)</p>
                                    <p><strong>ROTATE_PML_ANGLE</strong> parameter used to set the angle by which we want the C-PML boundary conditions to be rotated (not implemented yet).</p>
                                    <p><strong>BOTTOM_FREE_SURFACE</strong> is checked to make the bottom surface of the mesh a free surface instead of absorbing.</p>
                                    <p><strong>STACEY_INSTEAD_OF_FREE_SURFACE</strong> is largely the same as the ‘PML_INSTEAD_OF_FREE_SURFACE’ option, but the free surface is replaced with the less effective Clayton-Enquist style absorbing boundary conditions.</p>
                                </div>
                                <div class="section" id="a1-6-group-5-seismograms">
                                    <h2>A1.6 Group 5 – Seismograms<a class="headerlink" href="#a1-6-group-5-seismograms" title="Permalink to this headline"></a></h2>
                                    <p>These parameters control the output of seismograms produced by SPECFEM3D_Cartesian.
                                    </p>
                                    <a href='<%=request.getContextPath()%>/images/image6.png' target="_blank">
                                        <img alt="image5" src='<%=request.getContextPath()%>/images/image6.png' style="width: 609.7px; height: 403.9px;" />
                                    </a>
                                    <p><strong>Figure A1.6:</strong> Parameter form for ‘Group 5 – Seismograms’.</p>
                                    <p><strong>NTSTEP_BETWEEN_OUTPUT_SEISMOS</strong> controls the frequency (in number of time steps) that the seismograms are written to disk. Fewer disk writes will allow the simulation to run quicker, but will also increase the amount of data that is lost if the code does crash.</p>
                                    <p><strong>SAVE_SEISMOGRAMS_DISPLACEMENT</strong> is checked if we want to save displacement in the forward runs (can be checked simultaneously to the following three flags).</p>
                                    <p><strong>SAVE_SEISMOGRAMS_VELOCITY</strong> is checked if we want to save velocity in the forward runs (can be checked simultaneously to the previous and following two flags).</p>
                                    <p><strong>SAVE_SEISMOGRAMS_ACCELERATION</strong> is checked if we want to save acceleration in the forward runs (can be checked simultaneously to the previous two and following two flags).</p>
                                    <p><strong>SAVE_SEISMOGRAMS_PRESSURE</strong> is checked if we want to save pressure in the forward runs (can be checked simultaneously to the previous three flags). Currently it is implemented in acoustic elements only.</p>
                                    <p><strong>USE_BINARY_FOR_SEISMOGRAMS</strong> saves seismograms in binary instead of ASCII format (binary is smaller but may not be portable between machines).
                                    </p>
                                    <p><strong>SU_FORMAT</strong> outputs seismograms in Seismic Unix format (binary with 240-byte-headers).
                                    </p>
                                    <p><strong>WRITE_SEISMOGRAMS_BY_MASTER</strong> decides if master process writes all the seismograms or if all processes do it in parallel.</p>
                                    <p><strong>SAVE_ALL_SEISMOS_IN_ONE_FILE</strong> saves all seismograms in one large combined file instead of one file per seismogram to avoid overloading shared non-local file systems such as LUSTRE or GPFS for instance.</p>
                                    <p><strong>USE_TRICK_FOR_BETTER_PRESSURE</strong> allows to use a trick to increase accuracy of pressure seismograms in fluid (acoustic) elements (see SPECFEM manual for details).</p>
                                </div>
                                <div class="section" id="a1-7-group-6-sources">
                                    <h2>A1.7 Group 6 – Sources<a class="headerlink" href="#a1-7-group-6-sources" title="Permalink to this headline"></a></h2>
                                    <p>The VERCE platform is very much configured to simulate earthquake sources. However there are other types of seismic sources such as active sources, explosions or impacts that you may want to simulate. This can be done using the options described below.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image7.png' target="_blank">
                                        <img alt="image6" src='<%=request.getContextPath()%>/images/image7.png' style="width: 465.6px; height: 248.8px;" />
                                    </a>
                                    <p><strong>Figure A1.7:</strong> Parameter form for ‘Group 6 – Sources’.</p>
                                    <p><strong>USE_FORCE_POINT_SOURCE</strong> simulates a force point source (e.g. impact source) rather than an earthquake source. If you are using this option the source must be defined in a FORCESOLUTUION file, rather than in the CMT solution convention used for earthquake sources. See the SPECFEM manual for full details. This option is not yet implemented in the VERCE portal.</p>
                                    <p><strong>USER_RICKER_TIME_FUNCTION</strong> this inputs the source as a Ricker wavelet, rather than the default delta/gaussian function that is designed to represent the slip on a fault during an earthquake. Again this option is useful for simulating non-earthquake seismic sources.</p>
                                    <p><strong>USE_EXTERNAL_SOURCE_FILE</strong> is checked to use an external source time function defined by an input file. This option is not yet implemented in the VERCE portal.</p>
                                    <p><strong>USE_SOURCE_ENCODING</strong> determines source encoding factor +/-1 depending on the sign of moment tensor (for acoustic simulations only).</p>
                                    <p><strong>PRINT_SOURCE_TIME_FUNCTION</strong> outputs the source time function input to the simulation as a text file.</p>
                                </div>
                                <div class="section" id="a1-8-group-7-visualisation">
                                    <h2>A1.8 Group 7 – Visualisation<a class="headerlink" href="#a1-8-group-7-visualisation" title="Permalink to this headline"></a></h2>
                                    <p>One of the outputs of SPECFEM which can be requested through the VERCE platform is a movie of the waveform simulation. This is usually output on the surface topography of the model, but can be built for the whole 3D volume. This last option is extremely demanding on memory though, and not recommended for normal simulations.</p>
                                    <a href='<%=request.getContextPath()%>/images/image8.png' target="_blank">
                                        <img alt="image7" src='<%=request.getContextPath()%>/images/image8.png' style="width: 648.0px; height: 320.8px;" />
                                    </a>
                                    <p><strong>Figure A1.8:</strong> Parameter form for ‘Group 7 – Visualisation’.</p>
                                    <p><strong>CREATE_SHAKEMAP</strong> creates a map of peak ground velocity for the area modelled.
                                    </p>
                                    <p><strong>MOVIE_SURFACE</strong> sets the output movie for just the surfaces you define in MOVIE_TYPE.</p>
                                    <p><strong>MOVIE_TYPE</strong> selects whether the surface movies and shake-maps are generated for the top surface of the model (topography + oceans) only, or for all external faces of the mesh (i.e. topography + vertical edges + bottom).</p>
                                    <p><strong>MOVIE_VOLUME</strong> allows 3D snapshots of the entire model volume to be output. This would allow the entire wave-field to be imaged, which could be useful. But this would also be hugely demanding on memory and so should be left unchecked by default.</p>
                                    <p><strong>SAVE_DISPLACMENT</strong> saves displacement in the movie snapshots, rather than the default, which is to save velocity for the movie.</p>
                                    <p><strong>USE_HIGHRES_FOR_MOVIES</strong> saves the wave-field values for movies at all the grid points so that the resolution of the movie is the same as the resolution of the model. Selecting this option requires a large amount of memory, so should not be selected by default.</p>
                                    <p><strong>NTSTEPS_BETWEEN_FRAMES</strong> sets the number of time steps between snapshots of the wave-field. The spacing of the frames in seconds is given by (NTSTEPS_BETWEEN_FRAMES*DT).</p>
                                    <p><strong>HDUR_MOVIE</strong> is the half duration of the source time function for the movie simulation.</p>
                                </div>
                                <div class="section" id="a1-9-group-8-adjoint-kernel-options">
                                    <h2>A1.9 Group 8 – Adjoint Kernel Options<a class="headerlink" href="#a1-9-group-8-adjoint-kernel-options" title="Permalink to this headline"></a></h2>
                                    <p>Beyond forward simulations, SPECFEM3D_Cartesian allows for the simulation of adjoint wave-fields useful for adjoint travel time tomography procedures (Tromp et al., 2005). These simulations are controlled by the options described below.</p>
                                    <a href='<%=request.getContextPath()%>/images/image9.png' target="_blank">
                                        <img alt="image8" src='<%=request.getContextPath()%>/images/image9.png' style="width: 607.2px; height: 238.4px;" />
                                    </a>
                                    <p><strong>Figure A1.9:</strong> Parameter form for ‘Group 8 – Adjoint Kernel Options’.
                                    </p>
                                    <p><strong>NTSTEP_BETWEEN_READ_ADJSRC</strong> interval in time steps for reading adjoint traces.</p>
                                    <p><strong>ANISOTROPIC_KL</strong> allows to compute anisotropic kernels in crust and mantle instead of the default, which is to compute isotropic kernels.</p>
                                    <p><strong>SAVE_TRANSVERSE_KL</strong> allows to compute transverse isotropic kernels rather than fully anisotropic kernels.</p>
                                    <p><strong>APPROXIMATE_HESS_KL</strong> outputs approximate Hessian for preconditioning.
                                    </p>
                                    <p><strong>SAVE_MOHO_MESH</strong> saves Moho mesh and computes Moho boundary kernels.</p>
                                </div>
                                <div class="section" id="a1-10-group-9-advanced">
                                    <h2>A1.10 Group 9 – Advanced<a class="headerlink" href="#a1-10-group-9-advanced" title="Permalink to this headline"></a></h2>
                                    <p>There are a large amount of other functions within SPECFEM3D_Cartesian that can be altered using the VERCE platform. A brief description of these functions is given below, but in most cases if you intend to use these advanced options you should also refer to the SPECFEM m</p>
                                    <table border="1" class="docutils">
                                        <colgroup>
                                            <col width="50%" />
                                            <col width="50%" />
                                        </colgroup>
                                        <tbody valign="top">
                                            <tr class="row-odd">
                                                <td style="background:  white;padding:  0;">
                                                    <a href='<%=request.getContextPath()%>/images/image10.png' target="_blank">
                                                        <img alt="image9" src='<%=request.getContextPath()%>/images/image10.png' />
                                                    </a>
                                                </td >
                                                <td style="background:  white;padding:  0;">
                                                    <a href='<%=request.getContextPath()%>/images/image11.png' target="_blank">
                                                        <img alt="image10" src='<%=request.getContextPath()%>/images/image11.png' />
                                                    </a>

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p class="centered">
                                        <strong><strong>Figure A1.10:</strong> Parameter form for ‘Group 9 – Advanced’.</strong>
                                    </p>
                                    <p><strong>NSTEPS_BETWEEN_OUTPUT_INFO</strong> controls the frequency that information about a running simulation is output to a log file.</p>
                                    <p><strong>NGNOD</strong> controls the number of nodes for each element of the hexahedral mesh. For all meshes loaded into the VERCE platform and all meshes created using CUBIT this should be left at the default value of 8.
                                    </p>
                                    <p><strong>APROXIMATE_OCEAN_LOAD</strong> is a relatively computationally cheap method of modelling the effect of oceans on the wave-field. It is however only effective at relatively low frequencies (periods of 20 seconds and longer). For higher frequencies if the effects of the water column are to be modelled, the ocean must be included in the mesh itself.</p>
                                    <p><strong>TOPOGRAPHY</strong> is only needed if the ‘APROXIMATE_OCEAN_LOAD’ option above is selected, and reads in the topography/bathymetry files needed to define that surface.</p>
                                    <p><strong>ANISOTROPY</strong> is selected if you want to include seismic anisotropy. You will also need to provide an anisotropy model to include this, and this has not been done for any of the pre-loaded meshes and models, and so cannot be selected for these cases.</p>
                                    <p><strong>GRAVITY</strong> is selected if you want to include gravity in your simulation. It is effective only at very long periods.</p>
                                    <p><strong>TOMOGRAPHY_PATH</strong> is the directory in which the tomography files are stored for using external tomographic Earth models. For simulations with the VERCE portal it is not required to set this parameter.</p>
                                    <p><strong>SAVE_MESH_FILES</strong> saves mesh files in a ‘<em>Paraview’</em> format for later use.</p>
                                    <p><strong>LOCAL_PATH</strong> is the directory in which the files for the partitioned mesh will be written. For simulations with the VERCE portal it is not required to set this parameter.</p>
                                    <p><strong>SEP_MODEL_DIRECTORY</strong> should be set if you are using a SEP model (oil-industry format). This option is not yet implemented in the VERCE portal.
                                    </p>
                                    <p><strong>ADIOS_ENABLED</strong> is checked to enable ADIOS. If it is not checked, subsequent ADIOS parameters will not be considered. This option is not yet implemented in the VERCE portal.</p>
                                    <p><strong>ADIOS_FOR_DATABASES</strong> is checked to use ADIOS for xmeshfem3D output and xgenerate_database input.</p>
                                    <p><strong>ADIOS_FOR_MESH</strong> is checked to use ADIOS for generated databases.</p>
                                    <p><strong>ADIOS_FOR_FORWARD_ARRAYS</strong> is checked to read and write forward arrays using ADIOS.</p>
                                    <p><strong>ADIOS_FOR_KERNELS</strong> is checked to produce ADIOS kernels that can later be visualized with the ADIOS version of combine_vol_data.</p>
                                    <p><strong>USE_LDDRK, INCREASE_CFL_FOR_LDDRK,
RATIO_BY_WHICH_TO_INCREASE_IT</strong> are the parameters to set up the LDDRK time scheme. This option is not yet implemented into the VERCE portal. See the manual of SPECFEM for details.</p>
                                    <p><strong>OUTPUT_ENERGY</strong> allows to plot energy curves, for instance to monitor how CPML absorbing layers behave. This option is turned off by default since it is a bit expensive.</p>
                                    <p><strong>NTSTEP_BETWEEN_OUTPUT_ENERGY</strong> controls the interval of time steps between the energy computation.</p>
                                    <p><strong>NUMBER_OF_SIMULTANEOUS_RUNS</strong> allows to simultaneously run (in an embarrassingly-parallel fashion) multiple earthquake simulations each with the same number of cores. This option is not yet implemented in the VERCE portal.</p>
                                    <p><strong>BROADCAST_SAME_MESH_AND_MODEL</strong> allows to broadcast the same mesh and velocity model to multiple events in case of NUMBER_OF_SIMULTANEOUS_RUNS&gt;1. This option is not yet implemented in the VERCE portal.</p>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/appendix2.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/glossary.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>