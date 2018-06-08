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

                            <li>6. A SPECFEM3D_GLOBE simulation example</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="a-specfem3d-globe-simulation-example">
                                <h1>6. A SPECFEM3D_GLOBE simulation example<a class="headerlink" href="#a-specfem3d-globe-simulation-example" title="Permalink to this headline"></a></h1>
                                <div class="section" id="introduction">
                                    <h2>6.1 Introduction<a class="headerlink" href="#introduction" title="Permalink to this headline"></a></h2>
                                    <p>SPECFEM3D_GLOBE is a spectral element code for simulating the seismic wave-field on regional and global scales. As the solver accounts for the curvature of the Earth is much better for large scale simulations. Unlike SPECFEM3D_Cartesian, SPECFEM3D_GLOBE does not require a pre-made mesh. Instead the mesh is produced for the simulation area by an inbuilt meshing tool.</p>
                                    <p>For global waveform simulations (i.e. simulations where the whole earth is simulated) the user only defines the grid spacing for the whole earth mesh. For regional simulations (where a segment of the globe is simulated) the user defines the area to be modelled and the grid spacing for that bespoke mesh. The mesh is then calculated before the simulation is run.</p>
                                </div>
                                <div class="section" id="setting-the-simulation-area">
                                    <h2>6.2 Setting the simulation area<a class="headerlink" href="#setting-the-simulation-area" title="Permalink to this headline"></a></h2>
                                    <p>Once the user has selected the SPECFEM3D_GLOBE solver from the drop down ‘<em>solvers’</em> menu in the ‘<em>Solver’</em> tab the user will have the option to select from two mesh types. The first of these is ‘<em>Globe’</em>, to run a global simulation. The second of these is ‘Bespoke’, which allows a user defined area to be modelled.</p>
                                    <div class="section" id="global-simulation">
                                        <h3>6.2.1 Global Simulation<a class="headerlink" href="#global-simulation" title="Permalink to this headline"></a></h3>
                                        <p>If you select global simulation, then you are modelling the whole globe. Therefore, all earthquakes and all seismic stations will be available for modelling. The user can define the length of the simulation (by varying the RECORD_LENGTH parameter) and the resolution of the simulation (by varying the mesh parameters) as described in section 6.4. The ‘velocity model’ must then be set to default.</p>
                                    </div>
                                    <div class="section" id="regional-simulation">
                                        <h3>6.2.2 Regional Simulation<a class="headerlink" href="#regional-simulation" title="Permalink to this headline"></a></h3>
                                        <p>If you select a <em>‘Bespoke’</em> mesh you are able to define the specific region you wish to simulate. This is defined by setting the centre of the area to be modelled with the parameters
                                            <em>‘CENTRE_LONGITUDE_IN_DEGREES’</em> and
                                            <em>‘CENTRE_LATITUDE_IN_DEGREES’</em>. The width and height of the area to be simulated are then defined by the <em>‘ANGULAR_WIDTH_XI_IN_DEGREES’</em> and <em>‘ANGULAR_WIDTH_ETA_IN_DEGREES’</em> which describe the width of the region at the closest point to the equator, and the height of the region in degrees of longitude and latitude respectively. The approximate area to be simulated is shown on the map to the left, allowing the area to be refined and appropriate earthquakes and seismic stations to be selected for simulation.</p>
                                        
                                        <a href='<%=request.getContextPath()%>/images/image16.png' target="_blank">
                                            <img alt="image0" src='<%=request.getContextPath()%>/images/image16.png' />
                                        </a>
                                        <p><strong>Figure 6.1:</strong> Example model setup for a global waveform simulation</p>

                                        <a href='<%=request.getContextPath()%>/images/image23.png' target="_blank">
                                            <img alt="image1" src='<%=request.getContextPath()%>/images/image23.png' />
                                        </a>    

                                        <p><strong>Figure 6.2:</strong> Example of regional simulation for Southern European and Mediterranean region.</p>
                                    </div>
                                </div>
                                <div class="section" id="selecting-a-velocity-model">
                                    <h2>6.3 Selecting a velocity model<a class="headerlink" href="#selecting-a-velocity-model" title="Permalink to this headline"></a></h2>
                                    <p>For both regional and global simulations a range of global 1D and 3D velocity models can be used. These velocity models are defined within SPECFEM3D_GLOBE, and so are not defined in the <em>‘Velocity Model’</em> tab. Instead the models are defined in the dropdown <em>‘MODEL’</em> menu in group 0 of the input parameters.</p>
                                    <p>The input parameters for SPECFEM3D_GLOBE are divided into 9 groups, which are briefly described in Appendix 2.</p>
                                </div>
                                <div class="section" id="defining-the-resolution-mesh-parameters">
                                    <h2>6.4 Defining the resolution &amp; mesh parameters<a class="headerlink" href="#defining-the-resolution-mesh-parameters" title="Permalink to this headline"></a></h2>
                                    <p>In SPECFEM the frequency of seismic wave that can be accurately simulated depends on both the grid spacing (<em>DH</em>) of the mesh of points the wave-field is calculated for, and the time step (<em>DT</em>). Unlike SPECFEM3D_Cartesian, (where <em>DT</em> is manually defined, and should be set to an appropriate value for the mesh and velocity model that are selected), SPECFEM3D_GLOBE calculates the <em>DT</em> that is needed, based on the grid spacing of the mesh. The user therefore defines the highest frequency (or shortest wavelength) that the setup can accurately simulate by setting the mesh parameters.</p>
                                    <p>For the Global case the user must first define how many ‘chunks’ the globe should be subdivided into, the default on the platform being 6. For regional simulations the simulation area must be defined as a single chunk. The resolution of the simulation is then prescribed by the values ‘NEX_XI’ and ‘NEX_ETA’, which correspond to the number of elements at the surface of the model space for the first chunk in the side of length XI and ETA respectively. SPECFEM3D_GLOBE requires that the value of NEX_XI must be a multiple of 16, and be 8 times a multiple of NPROC_XI. In turn the value of NEX_ETA must be a multiple of 16, and be 8 times a multiple of NPROC_ETA. To summarise;</p>
                                    <div class="math notranslate">
                                        \[\text{NE}X_{\text{XI}} = \ c \times 8\left( \text{NPRO}C_{\text{XI}} \right)\]</div>
                                    <div class="math notranslate">
                                        \[\text{NE}X_{\text{ETA}} = \ c \times 8\left( \text{NPRO}C_{\text{ETA}} \right)\]</div>
                                    <p>Where <span class="math notranslate">\((\text{NPO}C_{\text{ETA}}*c)\)</span> and
                                        <span class="math notranslate">\((NPOC_{\text{XI}}*c)\)</span> are even and greater than 2.</p>
                                    <p>The shortest period resolved by the simulation can then be approximated by the following equation;</p>
                                    <div class="math notranslate">
                                        \[\text{shortest period }\left( s \right) \simeq \left( \frac{256}{\text{NE}X_{\text{XI}}} \right) \times \left( \frac{\text{ANGULAR_WIDTH_XI_IN_DEGREES}}{90}\ \right) \times 17\]</div>
                                    <p>For regional simulations the areas you have defined at the Earth’s surface will be modelled. The depth of the simulation area is automatically defined, and the wave filed is simulated down to the inner core boundary in regional simulations. This means that certain seismic phases that travel through the core will not be seen. The VERCE platform automatically sets absorbing boundary conditions for simulation areas. However, as these boundary conditions are not perfect care should be taken if using receivers or in particular sources that are close to the limits of the region simulated.</p>
                                    <p>Once you have defined the area you wish to model the earthquake sources and receivers can be defined in the ‘<em>Earthquakes</em> ’ and ‘
                                        <em>Stations’</em> tabs.</p>
                                </div>
                                <div class="section" id="selecting-an-earthquake">
                                    <h2>6.5 Selecting an Earthquake<a class="headerlink" href="#selecting-an-earthquake" title="Permalink to this headline"></a></h2>
                                    <p>For global and regional simulations the only earthquake catalogue that is currently supported is the gCMT catalogue. Other earthquake mechanisms can be uploaded is gCMT format using the ‘<em>file</em>’ tab. The format needed is shown in figure 6.5.</p>
                                    <p>If you are using the gCMT catalogue supported in the portal, you can search for events of certain magnitudes and dates using the search parameter boxes, and the available earthquakes are seen inside the mesh area. This is shown for global simulation (figure 6.3) and a regional simulation (figure 6.4) below. The relevant earthquake can then be selected from either the map (by clicking on the red dot) or from the list to the right.</p>
                                                                        
                                    <a href='<%=request.getContextPath()%>/images/image33.png' target="_blank">
                                        <img alt="image2" src='<%=request.getContextPath()%>/images/image33.png' />
                                    </a> 

                                    <p><strong>Figure 6.3:</strong> earthquake search for a global simulation.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image42.png' target="_blank">
                                        <img alt="image3" src='<%=request.getContextPath()%>/images/image42.png' />
                                    </a> 

                                    <p><strong>Figure 6.3:</strong> earthquake search for a regional simulation for Europe.
                                    </p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image52.jpg' target="_blank">
                                        <img alt="image4" src='<%=request.getContextPath()%>/images/image52.jpg' />
                                    </a> 

                                    <p><strong>Figure 6.4:</strong> Format of a bespoke CMT solution for upload to the portal. (Image from the SPECFEM3D Globe manual).</p>
                                </div>
                                <div class="section" id="selecting-stations">
                                    <h2>6.6 Selecting stations<a class="headerlink" href="#selecting-stations" title="Permalink to this headline"></a></h2>
                                    <p>Stations can then be selected as for Cartesian simulations. For SPECFEM3D_GLOBE the only source of station locations that is built in is the IRIS catalogue. If you wish to add further stations, station locations can be manually uploaded in the format shown in figure 6.5.</p>
                                    <p>Example station searches for a regional simulation of Europe and for a global simulation are shown in figures 6.6 and 6.7 respectively. In the global simulations particularly, it can be useful to specify the specific networks needed by specifying the network code in the ‘
                                        <em>Networks’</em> drop-down box. Stations from multiple networks can be search by separating the network codes with a comma only (no space) e.g. (IU,II). If all stations are selected the station searching and data parsing will be very slow, and it is unlikely that this volume of data will be useful. So please take the time to search for useful stations carefully.
                                    </p>

                                    <a href='<%=request.getContextPath()%>/images/image62.jpg' target="_blank">
                                        <img alt="image5" src='<%=request.getContextPath()%>/images/image62.jpg' />
                                    </a> 

                                    <p><strong>Figure 6.5:</strong> Format for manual station location upload (Image from the SPECFEM3D_GLOBE manual)</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image72.png' target="_blank">
                                        <img alt="image6" src='<%=request.getContextPath()%>/images/image72.png' />
                                    </a> 

                                    <p><strong>Figure 6.6:</strong> Searching for stations in a regional mesh.</p>
                                   
                                    <a href='<%=request.getContextPath()%>/images/image82.png' target="_blank">
                                        <img alt="image7" src='<%=request.getContextPath()%>/images/image82.png' />
                                    </a> 

                                    <p><strong>Figure 6.7:</strong> Searching for stations in a global mesh.</p>
                                </div>
                                <div class="section" id="submitting-and-monitoring-the-simulation">
                                    <h2>6.7 Submitting and monitoring the simulation<a class="headerlink" href="#submitting-and-monitoring-the-simulation" title="Permalink to this headline"></a></h2>
                                    <p>Once the simulation has been setup, the relevant earthquake source(s) defined, and the required stations selected the simulation can be submitted to the supercomputer. The workflow is selected from the top drop-down box, with different workflows corresponding to different HPC resources. The name and description boxes allow you to document exactly what this simulation is for.</p>
                                    <p>Once the model has been submitted the progress of the simulation can be monitored on the ‘results’ tab. As the processing is done on a HPC machine, the simulation may not run immediately, as these large jobs are managed in a queue system.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image92.png' target="_blank">
                                        <img alt="image8" src='<%=request.getContextPath()%>/images/image92.png' />
                                    </a> 

                                    <p><strong>Figure 6.8:</strong> Submitting a job, for a regional simulation of Europe using SPECFEM3D_GLOBE.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image102.png' target="_blank">
                                        <img alt="image9" src='<%=request.getContextPath()%>/images/image102.png' />
                                    </a> 

                                    <p><strong>Figure 6.9:</strong> Monitoring the progress of submitted job through the ‘results’ tab.</p>
                                </div>
                                <div class="section" id="outputs-from-regional-global-simulations">
                                    <h2>6.8 Outputs from regional &amp; global simulations<a class="headerlink" href="#outputs-from-regional-global-simulations" title="Permalink to this headline"></a></h2>
                                    <p>The results of these simulations can then be accessed through the results tabs as described in the next chapter. Example outputs include waveforms (figure 6.10), a .kmz file that can be used to view the waveforms in geographical context (figure 6.11), as well as global and regional snapshots and movie animations (e.g. figure 6.12).</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image112.png' target="_blank">
                                        <img alt="image10" src='<%=request.getContextPath()%>/images/image112.png' />
                                    </a> 

                                    <p><strong>Figure 6.10:</strong> Waveform produced by regional simulation.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image121.png' target="_blank">
                                        <img alt="image11" src='<%=request.getContextPath()%>/images/image121.png' />
                                    </a> 

                                    <p><strong>Figure 6.11:</strong> Waveforms in geographical context using KMZ file viewed in Goole Earth.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image131.png' target="_blank">
                                        <img alt="image12" src='<%=request.getContextPath()%>/images/image131.png' />
                                    </a> 

                                    <p><strong>Figure 6.12:</strong> Snapshot from a regional simulation of Europe, using regional settings in SPECFEM3D Globe.</p>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/section7.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/section5.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>