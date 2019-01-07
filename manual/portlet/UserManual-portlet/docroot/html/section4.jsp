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

                            <li>4. A tour of the VERCE platform</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="a-tour-of-the-verce-platform">
                                <h1>4. A tour of the VERCE platform<a class="headerlink" href="#a-tour-of-the-verce-platform" title="Permalink to this headline"></a></h1>
                                <p>In this section we will introduce the different parts of the VERCE platform, and show the models and meshes that are already loaded into the VERCE portal.</p>
                                <div class="section" id="welcome-news-tabs">
                                    <h2>4.1 Welcome &amp; News tabs<a class="headerlink" href="#welcome-news-tabs" title="Permalink to this headline"></a></h2>
                                    <p><img alt="image0" src='<%=request.getContextPath()%>/images/image12.jpg' /></p>
                                    <p>The welcome tab of the portal gives a very brief overview of the portals uses, while the news tab gives details of recent significant earthquakes. Other news such as upcoming training events, and publications related to the VERCE platform may also be shown here.</p>
                                </div>
                                <div class="section" id="security-tab">
                                    <h2>4.2 Security tab<a class="headerlink" href="#security-tab" title="Permalink to this headline"></a></h2>
                                    <p><img alt="image1" src='<%=request.getContextPath()%>/images/image22.jpg' /></p>
                                    <p>We have already used many of the features available in this tab in order to upload our proxy certificate. The main security page though gives an overview of how to register for and get certificated for the platform, as covered in section 3 of this guide. The main tools you need to be aware of are the <strong>‘MyProxy tool’</strong> (section 3.4.1) and the
                                        <strong>‘Certificate’</strong> upload tab (section 3.4.3).</p>
                                </div>
                                <div class="section" id="forward-modelling-tab">
                                    <h2>4.3 Forward Modelling tab<a class="headerlink" href="#forward-modelling-tab" title="Permalink to this headline"></a></h2>
                                    <p><img alt="image2" src='<%=request.getContextPath()%>/images/image3.jpg' /></p>
                                    <p>The ‘Forward Modelling’ tab is the main feature of the portal, and it is from here that you can setup and run full waveform simulations, and analyse the obtained output products. This section is divided in five sub-tabs that allow the user to access the different steps of the simulation and analysis procedure.</p>
                                    <p>Jobs can be run from the <em>‘Simulation’</em> tab shown in figure 4.1 below. On the right hand side of this panel, the code used for the simulations can be selected from the drop down menu ‘Solvers’: so far both a code for local/regional 3D simulations - SPECFEM3D_Cartesian (Peter et al., 2011; see Section 5) – or a code for regional/global 3D simulations – SPECFEM3D_GLOBE (Tromp, Komatitsch, and Liu 2008; see section 6) – can be selected. Then, existing pre-loaded mesh and associated velocity model for different areas in the world can be selected from the drop down menus ‘Meshes’ and ‘Velocity Model’ respectively. Earthquake sources and seismic stations can be selected from the catalogues that are pre-installed into the portal under the ‘Earthquakes’ and ‘Stations’ tabs respectively. This process is described in more detail later in section 5 and 6 of this guide.</p>
                                    <p>Alternatively, you can add your own mesh and velocity model using the blue link below the drop down boxes in figure 4.1. You can then add your own earthquake focal mechanisms and station locations. Details on how to create and submit a more advanced bespoke job like this are given in section 8 of this guide.</p>
                                    <p>The left hand side panel shows a summary map of the area you are running your model for, currently the map view is defaulted to 3D globe. The map view can be changed by selecting a new projection from the <em>Projections</em> dropdown menu list. The map also shows details of existing geological maps, hazard maps, fault traces and other map layers which can be enabled/disabled through the <em>Layers</em> menu option. The relative weight of these can be adjusted by controlling their corresponding opacity control which can be found on the <em>Controls</em> dropdown menu and the associated legends can be accessed and viewed from the <em>Legends</em> menu.
                                    </p>

                                    <a href='<%=request.getContextPath()%>/images/image41.jpg' target="_blank">
                                        <img alt="image3" src='<%=request.getContextPath()%>/images/image41.jpg' />
                                    </a>    
                                    <p><strong>Figure 4.1:</strong> The forward modeling interface ‘Simulation’ page.</p>
                                    <p>From the <em>‘Download’</em> tab users can download observed seismograms from the EIDA data archive corresponding to a specific earthquake selected for simulations. These data cab be used in the subsequent procedure to calculate misfit with respect to synthetic seismograms. Details in section 7.</p>
                                    <p>Moreover, both observed and synthetic seismograms can be processed before comparison using the features under the <em>‘Processing’</em> tab and quantitative misfit calculation can be performed in the section
                                        <em>‘Misfit’</em>. All the results of simulations and analyses can be accessed from the ‘Results’ tabs. Details are reported in section 7 of this guide.
                                    </p>
                                </div>
                                <div class="section" id="provenance-tab">
                                    <h2>4.4 Provenance tab<a class="headerlink" href="#provenance-tab" title="Permalink to this headline"></a></h2>
                                    <p><img alt="image4" src='<%=request.getContextPath()%>/images/image51.jpg' /></p>
                                    <p>This tab gives access to the provenance explorer GUI, which allows the methods assumptions and inputs that have lead to a given synthetic output to be easily summarized. An example of the provenance GUI is shown below (figure 4.2)</p>

                                    <a href='<%=request.getContextPath()%>/images/image62.png' target="_blank">
                                        <img alt="image5" src='<%=request.getContextPath()%>/images/image62.png' />
                                    </a> 
                                    <p><strong>Figure 4.2:</strong> An example displayed from the Provenance Explorer GUI (taken for Atkinson et al 2016).</p>
                                </div>
                                <div class="section" id="file-manager-tab">
                                    <h2>4.5 File Manager tab<a class="headerlink" href="#file-manager-tab" title="Permalink to this headline"></a></h2>
                                    <p><img alt="image6" src='<%=request.getContextPath()%>/images/image71.jpg' /></p>
                                    <p>The file manager tab gives a access to the files that are available to the user. The files are sorted by model run. Examples of using the functionality of this tab are given in section 7.</p>
                                </div>
                                <div class="section" id="irods-tab">
                                    <h2>4.6 IRODS tab<a class="headerlink" href="#irods-tab" title="Permalink to this headline"></a></h2>
                                    <p><img alt="image7" src='<%=request.getContextPath()%>/images/image81.jpg' /></p>
                                    <p>The iRODS tab gives direct access to the iRODS data structure, and allows the data to be managed and potentially downloaded. Examples of using the functionality of this tab are given in section 7.</p>
                                </div>
                                <div class="section" id="the-meshes-and-models-already-uploaded">
                                    <h2>4.7 The Meshes and models already uploaded<a class="headerlink" href="#the-meshes-and-models-already-uploaded" title="Permalink to this headline"></a></h2>
                                    <p>Currently there are several meshes and velocity models pre-loaded for Italy, and a mesh pre-loaded for the Maule area of Central Chile. They can be used for running 3D simulations at local/regional scale with the code SPECFEM3D_Cartesion, as explained in section 5 of this guide.</p>
                                    <p>The frequency to which the seismic wave-field can be simulated is controlled by the time step of the model, the spacing of grid points within the mesh and ultimately by the values of wave velocities in the corresponding model. For this reason, there is a maximum frequency (or minimum period) of waveform that a given pair of mesh and velocity model can support. This minimum period (maximum frequency) resolvable is shown below (figure 4.3) for each of the combinations mesh-wavespeed model currently available in the VERCE portal.</p>
                                    <p>Other details of these meshes such as the suggested time step (suggest DT) to make each model stable, the number of points in the mesh (Num. of HEX), and the approximate time that a 1 minute simulation would take if it was run on 100 cores (CPU time) are shown in figure 4.4. The UTM zone for each of the meshes is also shown as this should be specified to run the simulation and can be useful when using the output data.</p>
                                    <p>Finally figure 4.5 gives details of the velocity models that are uploaded, along with the meshes, to the VERCE portal. The minimum and maximum P-wave and S-wave velocities are given as these are required to calculate the grid spacing and time step needed to resolve a given frequency of seismic wave.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image9.jpg' target="_blank">
                                        <img alt="image8" src='<%=request.getContextPath()%>/images/image9.jpg' style="width: 544.0px; height: 370.5px;" />
                                    </a> 
                                    <p><strong>Figure 4.3:</strong> The mesh and velocity model combinations currently available through the VERCE portal, and the period to which the wave-field can be resolved in each of these mesh-model combinations.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image10.jpg' target="_blank">
                                        <img alt="image9" src='<%=request.getContextPath()%>/images/image10.jpg' style="width: 399.5px; height: 257.0px;" />
                                    </a> 
                                    <p><strong>Figure 4.4:</strong> Details of the meshes currently available through the VERCE platform.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image111.jpg' target="_blank">
                                        <img alt="image10" src='<%=request.getContextPath()%>/images/image111.jpg' style="width: 826.0px; height: 332.5px;" />
                                    </a>
                                    <p><strong>Figure 4.5:</strong> Details of the velocity models that are currently available through the VERCE platform.</p>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/section5.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/section3.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>
