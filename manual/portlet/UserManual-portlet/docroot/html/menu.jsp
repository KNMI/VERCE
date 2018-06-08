<%@page contentType="text/html" pageEncoding="UTF-8"%>
<meta http-equiv="Content-Type" content="text/html;" charset="utf-8">
<div class="wy-body-for-nav">

    <div class="wy-grid-for-nav">
        <nav data-toggle="wy-nav-shift" class="wy-nav-side">
            <div class="wy-side-scroll">
                <div class="wy-side-nav-search">
                    <a href='<%=request.getContextPath()%>/html/index.jsp' class="icon icon-home"> VERCE Portal Manual

        </a>
                    <div role="search">
                        <form id="rtd-search-form" class="wy-form" action='<%=request.getContextPath()%>/html/search.jsp' method="get">
                            <input type="text" name="q" placeholder="Search docs" />
                            <input type="hidden" name="check_keywords" value="yes" />
                            <input type="hidden" name="area" value="default" />
                        </form>
                    </div>
                </div>
                <div class="wy-menu wy-menu-vertical" data-spy="affix" role="navigation" aria-label="main navigation">
                    <ul>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section1.jsp'>1. Introduction to the VERCE platform</a>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section2.jsp'>2. Introduction to full waveform modeling</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section2.jsp#why-full-waveform'>2.1 Why full waveform?</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section2.jsp#calculating-the-wave-field'>2.2 Calculating the wave field</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section2.jsp#high-performance-computing-in-seismic-waveform-modeling'>2.3 High performance computing in seismic waveform modeling</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section2.jsp#what-do-i-need-to-run-a-simulation'>2.4 What do I need to run a simulation?</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp'>3. Registering for the platform and certification</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#registering-for-the-platform'>3.1 Registering for the platform</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#getting-a-certificate'>3.2 Getting a certificate</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#installing-your-certificate-in-your-browser'>3.3 Installing your certificate in your browser</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#registering-for-super-computing-and-data-resources'>3.4 Registering for super computing and data resources</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#creating-and-uploading-proxy-certificates'>3.5 Creating and uploading proxy certificates</a>
                                    <ul>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#myproxy-tools'>3.5.1 MYPROXY Tools</a>
                                        </li>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#gsissh-term-tool'>3.5.1.1 GSISSH_Term Tool</a>
                                        </li>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#myproxy-command-line-tool'>3.5.1.2 MYPROXY command line tool</a>
                                        </li>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#uploading-a-proxy-certificate-to-the-verce-platform'>3.5.2 Uploading a proxy certificate to the VERCE platform</a>
                                        </li>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section3.jsp#certificate-association'>3.5.3 Certificate Association</a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp'>4. A tour of the VERCE platform</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#welcome-news-tabs'>4.1 Welcome &amp; News tabs</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#security-tab'>4.2 Security tab</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#forward-modelling-tab'>4.3 Forward Modelling tab</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#provenance-tab'>4.4 Provenance tab</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#file-manager-tab'>4.5 File Manager tab</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#irods-tab'>4.6 IRODS tab</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section4.jsp#the-meshes-and-models-already-uploaded'>4.7 The Meshes and models already uploaded</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp'>5. A SPECFEM3D_Cartesian simulation example</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#preparing-the-portal'>5.1 Preparing the portal</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#selecting-a-solver-mesh-and-velocity-model'>5.2 Selecting a solver, mesh and velocity model</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#specifying-the-input-parameters-for-specfem3d-cartesian'>5.3 Specifying the input parameters for SPECFEM3D_Cartesian</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#selecting-earthquakes'>5.4. Selecting earthquakes</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#selecting-stations'>5.5. Selecting stations</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#submitting-the-job'>5.6. Submitting the job</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section5.jsp#monitoring-the-job'>5.7. Monitoring the job</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp'>6. A SPECFEM3D_GLOBE simulation example</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#introduction'>6.1 Introduction</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#setting-the-simulation-area'>6.2 Setting the simulation area</a>
                                    <ul>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#global-simulation'>6.2.1 Global Simulation</a>
                                        </li>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#regional-simulation'>6.2.2 Regional Simulation</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#selecting-a-velocity-model'>6.3 Selecting a velocity model</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#defining-the-resolution-mesh-parameters'>6.4 Defining the resolution &amp; mesh parameters</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#selecting-an-earthquake'>6.5 Selecting an Earthquake</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#selecting-stations'>6.6 Selecting stations</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#submitting-and-monitoring-the-simulation'>6.7 Submitting and monitoring the simulation</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section6.jsp#outputs-from-regional-global-simulations'>6.8 Outputs from regional &amp; global simulations</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp'>7. Processing and Accessing the Results</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#outputs-of-the-forward-simulations'>7.1 Outputs of the forward simulations</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#waveform-outputs'>7.1.1 Waveform outputs</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#animation-outputs'>7.1.2 Animation outputs</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#other-outputs'>7.1.3 Other outputs</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#downloading-observed-data'>7.2 Downloading observed data</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#waveform-processing'>7.3 Waveform processing</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#misfit-calculation'>7.4 Misfit calculation</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section7.jsp#accessing-the-results-through-irods'>7.4 Accessing the results through iRODS</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp'>8. Running SPECFEM3D_Cartesian simulations using your own data</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#creating-your-own-velocity-model'>8.1 Creating your own velocity model</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#creating-a-bespoke-mesh-for-your-area'>8.2 Creating a bespoke mesh for your area</a>
                                    <ul>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#meshing-parameters'>8.2.1 Meshing parameters</a>
                                        </li>
                                        <li class="toctree-l3">
                                            <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#meshing-software'>8.2.2 Meshing software</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#submitting-a-mesh-and-a-velocity-model'>8.3 Submitting a mesh and a velocity model</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#submitting-a-new-earthquake-catalogue'>8.4 Submitting a new earthquake catalogue</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/section8.jsp#submitting-a-new-station-catalogue'>8.5 Submitting a new station catalogue</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/glossary.jsp'>VERCE glossary</a>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp'>Appendix 1 – SPECFEM3D_Cartesian’s Flags</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-1-group-0-basic'>A1.1 Group 0 - Basic</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-2-group-1-inverse-problem'>A1.2 Group 1 – Inverse problem</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-3-group-2-utm-projection'>A1.3 Group 2 – UTM projection</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-4-group-3-attenuation'>A1.4 Group 3 – Attenuation</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-5-group-4-absorbing-boundary-conditions'>A1.5 Group 4 – Absorbing Boundary Conditions</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-6-group-5-seismograms'>A1.6 Group 5 – Seismograms</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-7-group-6-sources'>A1.7 Group 6 – Sources</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-8-group-7-visualisation'>A1.8 Group 7 – Visualisation</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-9-group-8-adjoint-kernel-options'>A1.9 Group 8 – Adjoint Kernel Options</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix1.jsp#a1-10-group-9-advanced'>A1.10 Group 9 – Advanced</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp'>Appendix 2 – SPECFEM3D_GLOBE’s Flags</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-1-group-0-basic'>A2.1 Group 0 - Basic</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-2-group-1-inverse-problem'>A2.2 Group 1 – Inverse Problem</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-3-group-2-simulation-area'>A2.3 Group 2 – Simulation Area</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-4-group-3-mesh-parameters'>A2.4 Group 3 – Mesh Parameters</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-5-group-4-adjoint-kernel-options'>A2.5 Group 4 – Adjoint Kernel Options</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-6-group-5-movie'>A2.6 Group 5 - Movie</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-7-group-6-sources'>A2.7 Group 6 - Sources</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-8-group-7-seismograms'>A2.8 Group 7 - Seismograms</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix2.jsp#a2-9-group-8-advanced'>A2.9 Group 8 - Advanced</a>
                                </li>
                            </ul>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix3.jsp'>Appendix 3 – Using ObsPy</a>
                        </li>
                        <li class="toctree-l1">
                            <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix4.jsp'>Appendix 4 – using dispel4py</a>
                            <ul>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix4.jsp#a4-1-installing-dispel4py'>A4.1 Installing Dispel4Py</a>
                                </li>
                                <li class="toctree-l2">
                                    <a class="reference internal" href='<%=request.getContextPath()%>/html/appendix4.jsp#a4-2-using-disple4py'>A4.2 Using Disple4Py</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
</div>