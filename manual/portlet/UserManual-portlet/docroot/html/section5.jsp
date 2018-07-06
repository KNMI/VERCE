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

                            <li>5. A SPECFEM3D_Cartesian simulation example</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="a-specfem3d-cartesian-simulation-example">
                                <h1>5. A SPECFEM3D_Cartesian simulation example<a class="headerlink" href="#a-specfem3d-cartesian-simulation-example" title="Permalink to this headline"></a></h1>
                                <p>SPECFEM3D_Cartesian is one of the principle solvers used in the VERCE portal. It is designed to run waveform simulations on local to regional scales, where local variations in bathymetry or topography may be significant but large-scale features, such as the Earth’s curvature, may be reasonably ignored. The Cartesian version of SPECFEM requires a pre-made mesh that includes features of the area or region such as the topography. These meshes can be produced by third party programs such as GEOCUBIT (Casarotti et al., 2008), and are often refined for a particular velocity model from a local or regional scale tomography for instance. These meshes can be relatively complex to produce. However, in the VERCE platform, a range of pre-loaded meshes is available. Users can also upload their own mesh and velocity model for a region of interest. This more advance use is described in chapter 8.</p>
                                <p>In the following section we will describe a step-by-step example of the set up of a forward simulation with SPECFEM3D_Cartesian.</p>
                                <div class="section" id="preparing-the-portal">
                                    <h2>5.1 Preparing the portal<a class="headerlink" href="#preparing-the-portal" title="Permalink to this headline"></a></h2>
                                    <p>Before you are able to run a simulation you must log in to the VERCE portal, and upload a proxy certificate as described in section 3 of this guide. Once you have done this, you should be able to use all parts of the portal for the next 24 hours (or the lifetime of your proxy certificate).
                                    </p>
                                </div>
                                <div class="section" id="selecting-a-solver-mesh-and-velocity-model">
                                    <h2>5.2 Selecting a solver, mesh and velocity model<a class="headerlink" href="#selecting-a-solver-mesh-and-velocity-model" title="Permalink to this headline"></a></h2>
                                    <p>The waveform simulations are run from the ‘Forward Modelling’ tab of the VERCE portal, shown in figure 5.1. First you must select the ‘Solver’ tab from the top of the forward modelling panel. In the first drop down menu you must select the solver. This is the code that will perform the full waveform simulation. Currently the VERCE platform supports SPECFEM3D_Cartesian, which is designed to simulate waveforms on the local/regional scale, and SPECFEM3D_GLOBE, designed for 3D simulations in the whole Earth. Specify one of the two codes by selecting SPECFEM3D_Cartesian or SPECFEM3D_GLOBE in the drop down menu labelled ‘Solvers’. For this example we select SPECFEM3D_Cartesian. Once you have done this you will see that the right hand side of the panel is populated with the input parameters for the selected code, which are categorised into ten groups.</p>
                                    <p>You can now select the area that you wish to run a simulation for from the drop down menu labelled ‘Meshes’. Once you have selected the relevant mesh, the map on the left of the ‘Forward Modelling’ panel will zoom to the area concerned, and the area the mesh covers will be outlined with a black box as shown below, in Figure 5.1.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image13.jpg' target="_blank">
                                        <img alt="image0" src='<%=request.getContextPath()%>/images/image13.jpg' />
                                    </a>
                                    <p><strong>Figure 5.1:</strong> Selecting a solver and mesh for Northern Italy. On the left panel the colours show the local geology, and known faults are plotted in black. On the right panel the drop down menu showing the meshes that are currently loaded in is shown. The input parameters for the solver can also be seen at the bottom of the right panel.</p>
                                    <p>Once you have selected a solver and a mesh you can then select a velocity model for the given area. Most of the meshes currently only have one velocity model associated with them. But in theory it is possible to have more than one velocity model for each mesh, as long as the area of the velocity model covers at least the mesh dimensions. This could for instance allow different tomographic models to be compared.</p>
                                </div>
                                <div class="section" id="specifying-the-input-parameters-for-specfem3d-cartesian">
                                    <h2>5.3 Specifying the input parameters for SPECFEM3D_Cartesian<a class="headerlink" href="#specifying-the-input-parameters-for-specfem3d-cartesian" title="Permalink to this headline"></a></h2>
                                    <p>The input parameters for SPECFEM3D_Cartesian are broken up into 10 categories, which are briefly described in Appendix 1. For a basic simulation, many of the parameters can be left at the default setting within the portal, but it is important to understand the meaning of these input flags for more advanced uses. For explanation of the use of the flags you can simply hold your curser above the question mark to the right of the flag or variable for a brief description. For a fuller description of these parameters please refer to Appendix 1, or for full details refer to the manual of SPECFEM3D_Cartesian.</p>
                                    <p>It is very important that you check the parameters in Group 0, especially insuring that the number of processors (NPROC), the time step (DT) used in the simulation, and length of the simulation are all set correctly. In particular, for each mesh/velocity model pair there is a maximum value of DT above which the simulation becomes unstable (see section 8.2.1 for details); thus for all your simulations we suggest to use the best values of DT for each mesh/model pair reported in Figure 4.4.
                                    </p>
                                    <p>Other parameters in Group 1-9 can be left as default for this exercise, but also allow you to specify details of the simulation. While the platform gives you as much flexibility as possible to vary these parameters, the user must ensure that reasonable values are used, otherwise the simulation may not run, or may not produce reasonable results. The aspects of the simulation controlled by each group are described briefly below.</p>
                                    <table border="1" class="colwidths-given docutils align-center">
                                        <colgroup>
                                            <col width="15%" />
                                            <col width="85%" />
                                        </colgroup>
                                        <thead valign="bottom">
                                            <tr class="row-odd">
                                                <th class="head"><strong>Group</strong></th>
                                                <th class="head"><strong>Description</strong></th>
                                            </tr>
                                        </thead>
                                        <tbody valign="top">
                                            <tr class="row-even">
                                                <td><strong>Group 0</strong></td>
                                                <td>Contains the main flags of the code that controls the number of cores used on the HPC resources, the simulation duration and the time step value. GPU mode will be supported in the near future.</td>
                                            </tr>
                                            <tr class="row-odd">
                                                <td><strong>Group 1</strong></td>
                                                <td>Controls the type of simulation that is run, and is currently limited to a forward simulation of an earthquake source. In the near future the platform will support the adjoint simulations allowed by the code.</td>
                                            </tr>
                                            <tr class="row-even">
                                                <td><strong>Group 2</strong></td>
                                                <td>Contains the details of the projection, which are set by default when you select the appropriate mesh.</td>
                                            </tr>
                                            <tr class="row-odd">
                                                <td><strong>Group 3</strong></td>
                                                <td>Contains details of how attenuation is accounted for in the simulation. If the attenuation flags are left unchecked (as is the default), an elastic simulation will be run. If the flags are checked, attenuation is estimated from Olsen attenuation (Olsen et al., 2003). For this example we run an elastic case, and so leave the attenuation flags unchecked.</td>
                                            </tr>
                                            <tr class="row-even">
                                                <td><strong>Group 4</strong></td>
                                                <td>Allows the type of boundary conditions at the edge of the model area to be set.</td>
                                            </tr>
                                            <tr class="row-odd">
                                                <td><strong>Group 5</strong></td>
                                                <td>Contains details of how the waveforms of the simulation are output.</td>
                                            </tr>
                                            <tr class="row-even">
                                                <td><strong>Group 6</strong></td>
                                                <td>Contains details of the seismic source that is implemented.</td>
                                            </tr>
                                            <tr class="row-odd">
                                                <td><strong>Group 7</strong></td>
                                                <td>Contains details of how the movies of the simulation are output.</td>
                                            </tr>
                                            <tr class="row-even">
                                                <td><strong>Group 8 &amp; 9</strong></td>
                                                <td>Contain more advance parameters that are not used in the examples presented here. Advance users who wish to use these parameters should refer to the SPECFEM3D_Cartesian manual.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p class="centered">
                                        <strong>Table 5.1: Summary of the groups for SPECFEM3D_Cartesian</strong></p>
                                    <p>The final set up of the workflow is shown in Figure 5.2.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image23.jpg' target="_blank">
                                        <img alt="image1" src='<%=request.getContextPath()%>/images/image23.jpg' />
                                    </a>
                                    <p><strong>Figure 5.2:</strong> Final setup of the workflow for the simple example. The area of Northern Italy which is to be simulated is outlined by the black box.
                                    </p>
                                </div>
                                <div class="section" id="selecting-earthquakes">
                                    <h2>5.4. Selecting earthquakes<a class="headerlink" href="#selecting-earthquakes" title="Permalink to this headline"></a></h2>
                                    <p>Next the earthquakes to be simulated are defined in the ‘Earthquakes’ tab at the top right of the ‘Forward Modelling’ page. There are a number of earthquake catalogues pre-loaded into the VERCE platform, including the global CMT catalogue, which provides a starting data set for any area that we have a model and mesh for. It is also possible to load in your own bespoke catalogue of earthquake moment tensors, as described in greater detail in section 8.4. Given that the model and mesh selected in our example is in Northern Italy, we can however use the INGV focal mechanism data set, which is likely to have a larger range of events down to smaller magnitudes.</p>
                                    <p>The earthquake catalogue you wish to search is selected using the drop down menu at the top of the ‘Earthquakes’ tab. You can then search for earthquakes in a range of magnitudes, depths and time. In this example we have searched for all earthquakes from magnitude Mw 4.0 – 9.0, at up to 100000 m depth that occurred within the model and mesh area in the year 2012. The earthquake of interest can then be selected either by ticking the box next to the earthquake in the list in the bottom right of the panel, or by selecting the location of the earthquake on the map in the left of the panel. It is also possible to select multiple events from this page. This will then submit the same number of jobs as events that you have selected, and produce waveforms for each of them. This would then allow multiple events to be used in an inversion for instance.
                                    </p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image31.jpg' target="_blank">
                                        <img alt="image2" src='<%=request.getContextPath()%>/images/image31.jpg' />
                                    </a>
                                    <p><strong>Figure 5.3:</strong> The earthquake selection page of the forward modelling tool. Events are shown from the INGV catalogue. The locations of the events are shown in the summary map on the left, and details of the events are shown in the bottom right hand part of the panel. The event or events to be modelled can be selected from either of these panels.</p>
                                    <p>For now though, just submit one event. In Figure 5.3 an earthquake in the centre of the mesh has been selected so that we see a nice clear waveform on all stations. You can select any event you are interested in, but be aware that events close to the limits of the mesh may be more greatly affected by the absorbing boundary conditions at the edges of the model.</p>
                                </div>
                                <div class="section" id="selecting-stations">
                                    <h2>5.5. Selecting stations<a class="headerlink" href="#selecting-stations" title="Permalink to this headline"></a></h2>
                                    <p>The seismometers where you want to simulate the synthetic seismogram can then be selected under the ‘Stations’ tab on the right hand side of the ‘
                                        <em>Forward Modelling’</em> panel. The portal is configured to output the synthetic waveforms at points where real seismometers exist so that the synthetic waveforms can be directly compared to the observed waveforms recorded at these stations.</p>
                                    <p>There are many seismic networks loaded into the VERCE portal that can be used. To see all of the stations that are available within the mesh and model area you can simply select one ‘Provider’ and ‘*’ (i.e., any network) in the drop down box at the top of the ‘Stations’ panel. Alternatively you can select a given network you are interested in (or have the data for), for instance the INGV network (network code IV). You can then manually select the stations you are interested in by clicking on the stations in the map view, or selecting the tick box next to the station information in the right hand panel. All of the stations in this list can be selected by selecting the tick box at the top of the list. See Figure 5.4.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image42.jpg' target="_blank">
                                        <img alt="image3" src='<%=request.getContextPath()%>/images/image42.jpg' />
                                    </a>
                                    <p><strong>Figure 5.4:</strong> The station selection panel. Stations are shown inside the area of the model and mesh (shown by the black box) for the INGV network. The stations (shown in blue) can be selected individually from the map or from the station list. All the available stations can be selected by ticking the tick box in the title bar (labelled 0/0 when no stations are selected).</p>
                                    <p>While selecting a large number of stations will not affect the overall time taken or computational cost of the simulation, the more stations you select the longer it will take to move the simulation output to memory where you can then access it. For large simulations it is most efficient therefore to output seismograms for all the stations that you may be interested in.</p>
                                </div>
                                <div class="section" id="submitting-the-job">
                                    <h2>5.6. Submitting the job<a class="headerlink" href="#submitting-the-job" title="Permalink to this headline"></a></h2>
                                    <p>You can then select the workflow you wish to use and submit your job. Currently one workflow is available, for the super computer at SCAI Fraunhofer (
                                        <a class="reference external" href="http://www.hpc.cineca.it/)">https://www.scai.fraunhofer.de)</a>. Other workflows will be introduced, allowing users to run the simulation on a variety of HPC resources across Europe. Each workflow is configured to a different machine, and some machines have more than one workflow available on them. You can then select the relevant workflow (here we have selected ‘SCAI_mpi_SPECFEM_PRODUCTION’) for the HPC resource you wish to submit to, and enter a name and description of the run. Please note that the name of the model must be 20 characters or less, and can only consists of letters, numbers and decimals. Other characters are not accepted.
                                    </p>
                                    <p>If you have selected more than one event to simulate, you may select the ‘Process the events in parallel’ box. This submits each of the events to the queue of the resources you have selected as separate jobs, rather than running the jobs in serial (one after another). This can speed up the process of simulating several earthquake events for the same velocity model.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image52.png' target="_blank">
                                        <img alt="image4" src='<%=request.getContextPath()%>/images/image52.png' style="width: 370.5px; height: 130.0px;" />
                                    </a>
                                    
                                    <p><strong>Figure 5.5:</strong> Available workflow from the top drop down menu of the ‘submit’ tab of the forward modelling page.</p>
                                </div>
                                <div class="section" id="monitoring-the-job">
                                    <h2>5.7. Monitoring the job<a class="headerlink" href="#monitoring-the-job" title="Permalink to this headline"></a></h2>
                                    <p>Once the job has been submitted, the status and progress of the job can be monitored from the ‘Control’ tab. This brings up a list of all of the jobs that have recently been submitted as shown below.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image61.jpg' target="_blank">
                                        <img alt="image5" src='<%=request.getContextPath()%>/images/image61.jpg' />
                                    </a>

                                    <p><strong>Figure 5.6:</strong> Jobs listed in the ‘Control’ tab.</p>
                                    <p>Clicking the following symbols at the end of the row allows information on the simulation to be accessed among other things. The symbols are described below:</p>
                                    <table border="1" class="colwidths-given docutils align-center">
                                        <colgroup>
                                            <col width="15%" />
                                            <col width="85%" />
                                        </colgroup>
                                        <thead valign="bottom">
                                            <tr class="row-odd">
                                                <th class="head">Icon</th>
                                                <th class="head">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody valign="top">
                                            <tr class="row-even">
                                                <td>
                                                    <a class="reference internal" src='<%=request.getContextPath()%>/images/image72.jpg'><img alt="image6" src='<%=request.getContextPath()%>/images/image72.jpg' style="width: 12.5px; height: 15.5px;" /></a>
                                                </td>
                                                <td>Gives access to the log files from a given job.</td>
                                            </tr>
                                            <tr class="row-odd">
                                                <td>
                                                    <a class="reference internal" src='<%=request.getContextPath()%>/images/image82.jpg'><img alt="image7" src='<%=request.getContextPath()%>/images/image82.jpg' style="width: 16.5px; height: 17.0px;" /></a>
                                                </td>
                                                <td>Takes you to the ‘Results’ tab to view the results from this model run.</td>
                                            </tr>
                                            <tr class="row-even">
                                                <td>
                                                    <a class="reference internal" src='<%=request.getContextPath()%>/images/image91.jpg'><img alt="image8" src='<%=request.getContextPath()%>/images/image91.jpg' style="width: 15.5px; height: 15.5px;" /></a>
                                                </td>
                                                <td>Reloads the setup of the model so that it can be reused or modified and resubmitted.</td>
                                            </tr>
                                            <tr class="row-odd">
                                                <td>
                                                    <a class="reference internal" src='<%=request.getContextPath()%>/images/image101.jpg'><img alt="image9" src='<%=request.getContextPath()%>/images/image101.jpg' style="width: 15.5px; height: 15.5px;" /></a>
                                                </td>
                                                <td>Deletes the record of this model run.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/section6.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/section4.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>