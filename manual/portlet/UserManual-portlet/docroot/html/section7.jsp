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

                            <li>7. Processing and Accessing the Results</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="processing-and-accessing-the-results">
                                <h1>7. Processing and Accessing the Results<a class="headerlink" href="#processing-and-accessing-the-results" title="Permalink to this headline"></a></h1>
                                <div class="section" id="outputs-of-the-forward-simulations">
                                    <h2>7.1 Outputs of the forward simulations<a class="headerlink" href="#outputs-of-the-forward-simulations" title="Permalink to this headline"></a></h2>
                                    <p>Once your job has run, you will be able to access the output of the simulation in three ways:</p>
                                    <ol class="arabic">
                                        <li>
                                            <p class="first">Clicking on the ‘<em>Control’</em> tab in the ‘<em>Simulation’</em> section of the ‘<em>Forward</em> <em>Modelling’</em> panel (see section 5.7):</p>
                                            <p>It shows a list of the simulation jobs that have been launched with, among others, the corresponding ‘<em>Name</em>’, ‘<em>Description’</em>, ‘
                                                <em>Status’</em> and ‘<em>Date’</em> of the run; if you do not see the event you have just run then click ‘<em>Refresh list</em>’ to load this in. By clicking on the blue-eye icon next to each run you will be redirected to the ‘<em>Results’</em> section showing the selected run and all its outputs (in the far left of the opened panel) as described in the next point.</p>
                                        </li>
                                        <li>
                                            <p class="first">Directly checking under the ‘<em>Results’</em> section:</p>
                                            <p>The simulation results can be searched using the ‘<em>Open Run’</em> button which is on the top left. This enables you to search for runs that for instance involve earthquakes in a range of magnitudes (as shown in Figure 7.1), or a range of depths, latitudes, longitudes, etc. For a full list of the parameters for which it is possible to search for, please see the ‘<em>Terms’</em> drop down menu. You can then select the simulation of interest from the list of previous runs satisfying the searching criteria that appears on the screen after clicking the ‘
                                                <em>Search’</em> button. As in case 1), the far left of the panel will then show the outputs of this simulation.</p>
                                        </li>
                                        <li>
                                            <p class="first">Using the ‘<em>iRODS</em>’ panel: see section 7.4.</p>
                                            
                                            <a href='<%=request.getContextPath()%>/images/image17.png' target="_blank">
                                                <img alt="image0" src='<%=request.getContextPath()%>/images/image17.png' />
                                            </a> 
                                            <p><strong>Figure 7.1:</strong> Example of searching simulations involving events in a selected magnitude range.</p>
                                        </li>
                                    </ol>
                                    <p>Focusing now on points 1) and 2), selecting an output from the left hand part of the ‘<em>Results</em>’ panel will bring up a provenance diagram in the top right window of the ‘<em>Results’</em> section marked as ‘<em>Data
Dependency Graph’</em>. If this is done for instance for the .kml file that is output, all of the constituent inputs needed for this result are shown by a dark blue circle bounded in yellow, and the outputs are shown by a simple dark blue circle.</p>
                                    <p>The bottom right window, marked as <em>‘Data products’</em>, gives further details of the output file that is selected and lists possible errors occurred during the production of this output. To open the file concerned, click the blue link marked ‘<em>Open’</em> or the one marked ‘
                                        <em>Download’</em> appearing in the dialog window. Moreover, with the button
                                        <em>‘Produce Download Script’</em> you can get a piece of code to download the selected output via gsissh terminal.</p>
                                    <p>Using the ‘<em>Search’</em> button in the ‘<em>Data</em> <em>products’</em> section of the ‘<em>Results’</em> panel it is also possible to search for all the output files of a specific mime-type (e.g., png, kmz, etc.) for a specific simulation.
                                    </p>
                                    <p>Finally, you can also visualise the input files for the selected simulation, such as the quakeML file, which contains information about the source or sources that are input into the model. This is done using the ‘<em>View Inputs’</em> button on the top left of the ‘<em>Results’</em> panel.</p>
                                </div>
                                <div class="section" id="waveform-outputs">
                                    <h2>7.1.1 Waveform outputs<a class="headerlink" href="#waveform-outputs" title="Permalink to this headline"></a></h2>
                                    <p>The primary outputs of any seismic simulation are the recorded waveforms. These can be viewed most simply as a .png file as shown in figure 7.2. To access these figures, after selecting a given simulation (as explained above), use the ‘<em>Search’</em> button in the ‘<em>Data</em>
                                        <em>products’</em> window (of the ‘<em>Results’</em> panel) to search for ‘image/png’ type of files. Otherwise, waveforms can be downloaded as seed files searching and downloading ‘application/octet-stream’ mime-type files.</p>
                                    <blockquote>
                                        <div>
                                            
                                            <a href='<%=request.getContextPath()%>/images/image24.png' target="_blank">
                                                <img alt="image1" src='<%=request.getContextPath()%>/images/image24.png' />
                                            </a>
                                            <p><strong>Figure 7.2:</strong> Example of waveform output.</p>
                                        </div>
                                    </blockquote>
                                    <p>The simulation code produces one file for each of the three components of a seismic station and, depending on the Par_file set up (see Appendix 1), the seismograms can be in displacement, velocity or acceleration, or all of them.</p>
                                    <p>The three components of different seismometers that are output can also be viewed in a more interactive form, by downloading the *.kmz file that is automatically output from the simulation run and viewing it in Google Earth as shown in Figure 7.3. This kmz file can be downloaded by searching for a mime-type ‘<em>application/vnd.google-earth.kmz’</em> in the ‘
                                        <em>Search’</em> section of ‘<em>Data</em> <em>products’</em>.</p>
                                    <blockquote>
                                        <div>
                                            
                                            <a href='<%=request.getContextPath()%>/images/image34.png' target="_blank">
                                                <img alt="image2" src='<%=request.getContextPath()%>/images/image34.png' />
                                            </a>
                                            <p><strong>Figure 7.3:</strong> Three components of a synthetic seismogram produced for an earthquake in Central Italy, observed on the interactive Google Earth tool. The seismograms are shown in displacement, velocity and acceleration.</p>
                                        </div>
                                    </blockquote>
                                </div>
                                <div class="section" id="animation-outputs">
                                    <h2>7.1.2 Animation outputs<a class="headerlink" href="#animation-outputs" title="Permalink to this headline"></a></h2>
                                    <p>The VERCE platform can also be used to produce animations or movies of the waveforms propagating out from the simulated earthquake event. These animations can be projected onto the Earth’s surface as in the snapshot example of Figure 7.4, or can show the propagation over all the external faces of the mesh (i.e., topography+vertical edges+bottom) depending on the Par_file set up as described in Appendix 1.</p>
                                    <p>The movie file *.mp4 is automatically output from the portal and can be downloaded by searching for a mime-type ‘
                                        <em>application/vnd.google-earth.kmz</em>’ in the ‘<em>Search’</em> section of ‘
                                        <em>Data</em> <em>products’</em> (in the ‘<em>Results’</em> panel). The animations shown at the top of the movie file and the one on the bottom left (Figure 7.4) represent the three components of the waveform velocity propagation, while the animation at the bottom right is the instantaneous peak ground velocity, i.e. a map of the maximum ground velocity for each time step of the simulation.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image43.png' target="_blank">
                                        <img alt="image3" src='<%=request.getContextPath()%>/images/image43.png' />
                                    </a>
                                    <p><strong>Figure 7.4:</strong> Snapshot of the movie for an earthquake in Central Italy produced from the VERCE platform using a regional simulation in SPECFEM3D_Globe.
                                    </p>
                                </div>
                                <div class="section" id="other-outputs">
                                    <h2>7.1.3 Other outputs<a class="headerlink" href="#other-outputs" title="Permalink to this headline"></a></h2>
                                    <p>The portal outputs can also be processed externally with your own routines to produce, for example, ground motion maps as shown for an event in Northern Italy in Figure 7.5. In particular, this kind of maps can be obtained by processing a binary file called <em>shakingdata</em> produced in output by SPECFEM3D_Cartesian if in the Par_file the user sets the flag</p>
                                    <p>CREATE_SHAKEMAP = .true.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image53.png' target="_blank">
                                        <img alt="image4" src='<%=request.getContextPath()%>/images/image53.png' />
                                    </a>
                                    <p><strong>Figure 7.5:</strong> A ground shaking map produced with SPECFEM3D_Cartesian for an event occurring in Northern Italy.</p>
                                    <p>One of the main changes that will be introduced in the next release of the portal (autumn/winter 2017) is the automatic production, through a dedicated workflow in the portal, of such ground motion maps, i.e. PGD, PGV and PGA maps. A single *.png picture containing the three maps will be generated from the automatic processing of the <em>shakingdata</em> file.</p>
                                </div>
                                <div class="section" id="downloading-observed-data">
                                    <h2>7.2 Downloading observed data<a class="headerlink" href="#downloading-observed-data" title="Permalink to this headline"></a></h2>
                                    <p>One of the main goals of a seismological analysis is the comparison of simulated results with observed data. Thus, after running a waveform simulation, the portal allows users to download from European data archives the recorded seismograms corresponding to the simulated earthquake.
                                    </p>
                                    <p>The section marked as ‘<em>Download’</em> under the ‘<em>Forward Modelling’</em> panel is dedicated to this task and it is composed by the following sub-sections that guide the users to launch a data -download job.</p>
                                    <ul>
                                        <li>
                                            <p class="first"><em>’Setup’</em> tab:</p>
                                            <p>A list of all the simulations that have been run is shown in this window. By selecting one of them, the information on the corresponding earthquake (source location, origin time) and run (NSTEP, DT) are automatically passed to the portal thanks to the metadata stored along with each simulation job.</p>
                                        </li>
                                        <li>
                                            <p class="first"><em>‘Submit’</em> tab:</p>
                                            <p>In the upper window you see the input parameters for the download job based on the selection in the previous tab; in the lower window you can setup the submission parameters, in particular the specific workflow and the number of cores of the HPC resource to run the data-download job (see the example in Figure 7.6). Click on ‘<em>Submit’</em> on the lower right to launch the job.</p>
                                        </li>
                                        <li>
                                            <p class="first"><em>‘Control’</em> tab:</p>
                                            <p>As for the case of simulation jobs in section 7.1, this window shows a list of the download jobs that have been launched and their corresponding status, among other information. The <em>‘blue-eye’</em> icon next to each run links you again to the main ‘<em>Results’</em> page where this time you visualize the outputs of the selected data-download job and the provenance graphs.</p>
                                            <p>Otherwise, the outputs can be accessed by searching for the specific download job directly from the ‘<em>Results’</em> panel (see section 7.1) or from the ‘<em>iRODS</em>’ panel (see section 7.4).</p>
                                        </li>
                                    </ul>
                                    <p>The output files of a data-download job are both seed and png files of the recorded traces downloaded from European archives. Use the ‘
                                        <em>Search’</em> button in the <em>‘Data products’</em> window of the ‘<em>Results’</em> tab to search for mime-type ‘<em>application/octet-stream’</em> or ‘
                                        <em>image/png’</em>, respectively.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image63.png' target="_blank">
                                        <img alt="image5" src='<%=request.getContextPath()%>/images/image63.png' />
                                    </a>
                                    <p><strong>Figure 7.6:</strong> Example of submission settings for a data-download job.
                                    </p>
                                </div>
                                <div class="section" id="waveform-processing">
                                    <h2>7.3 Waveform processing<a class="headerlink" href="#waveform-processing" title="Permalink to this headline"></a></h2>
                                    <p>Once both a simulation job and a download job have been run, users can exploit another feature of the portal to pre-process observed and synthetic waveforms in order to prepare them for comparison analyses.</p>
                                    <p>In the ‘<em>Forward Modelling’</em> panel, by clicking on the ‘
                                        <em>Processing’</em> tab you should go through the following sub-sections to set up and launch a processing job.</p>
                                    <ul>
                                        <li>
                                            <p class="first"><em>‘Data Setup’</em> tab:</p>
                                            <p>The window on the top left shows a list of the waveform simulations that have been run, while the window on the top right shows a list of the data-download jobs that have been run. By selecting a simulation and a download run, a list of the seismic stations involved in the two jobs appears in the window below and the portal automatically highlights the common stations, i.e. those for which both data and synthetics are stored in its database. Use the checkbox on the left of each station to select those for which you are interested in processing both simulated and recorded seismograms in order to then compare them.</p>
                                        </li>
                                        <li>
                                            <p class="first">‘<em>Processing Setup’</em> tab:</p>
                                            <p>Here you can built-up a customized pipeline of processing analyses to be applied to the recorded and simulated waveforms selected in the previous panel. A list of the most common seismological processing functions (here called <em>Processing Elements</em>, and abbreviated to <em>PEs</em>) is reported in the far left window. Drag the selected PEs into the top right window following the order of the operations you want to apply on the seismograms.</p>
                                            <p>For each PE of the pipeline you can choose to apply the operation on both data and synthetics or on just one of them using the checkboxes ‘
                                                <em>raw’</em> and ‘<em>synt’</em>. As an example, usually the operation of removing the instrument response (represented by the PE
                                                <em>remove_response</em>) is applied only on the raw data, while on the synthetics one applies a pre-filtering function (<em>pre_filter</em> PE) to replicate the bandpass filter done by <em>remove_response</em> function on the data but without any deconvolution (see Figure 7.7). Moreover, the checkbox ‘<em>visu’</em> allows you to produce a png file showing the result of the specific analysis, while the checkbox ‘<em>store’</em> allows to also store the processed seismogram as a seed file.</p>
                                            <p>For each PE you can also modify the corresponding parameters. Clicking on the row of a given PE in the ‘<em>PE Workflow’</em> window, the corresponding parameters appear in the window below and you can set up, for example, the type of de-trend, the type of taper and its percentage, the limit frequencies for the selected filter.</p>
                                            <p>Finally, on the top of the ‘<em>PE Workflow’</em> window a drop down menu allows to select if the output of the processing will be in displacement, velocity or acceleration, and with a checkbox you can decide to rotate the seismic traces from NS and EW to radial and vertical components.</p>
                                        </li>
                                        <li>
                                            <p class="first"><em>‘Submit’</em> tab:</p>
                                            <p>As in the case of section 7.2, this tab shows a summary of the set up for the processing job, in particular the list of stations to which the processing will be applied and a list of the processing operations that compose the custom pipeline. Then, you can setup the submission parameters in the lower window and launch the processing job by clicking on ‘Submit’ on the lower right.</p>
                                        </li>
                                        <li>
                                            <p class="first"><em>‘Control’</em> tab:</p>
                                            <p>As previously, the window shows a list of the processing jobs that have been launched and the blue-eye icon links to the main ‘<em>Results</em>’ page where the outputs of the selected job can be explored together with the provenance graphs. The outputs can be also accessed by searching for the specific processing job directly from the ‘<em>Results</em>’ panel (see section 7.1) or from the ‘<em>iRODS</em>’ panel (see section 7.4).</p>
                                        </li>
                                    </ul>
                                    <p>The output products of a processing job can be png files of the processed traces, if the option ‘<em>visu’</em> is checked, or/and seed files containing the processed seismograms, if the option ‘<em>store</em>’ is on (see above). Use the <em>‘Search’</em> button in the ‘<em>Data products’</em> window of the <em>‘Results’</em> tab to search for mime-type ‘<em>image/png’</em> or ‘
                                        <em>application/octet-stream’</em>, respectively.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image73.png' target="_blank">
                                        <img alt="image6" src='<%=request.getContextPath()%>/images/image73.png' />
                                    </a>
                                    <p><strong>Figure 7.7:</strong> Example of custom pipeline of processing functions to be applied on observed and synthetic seismograms.</p>
                                </div>
                                <div class="section" id="misfit-calculation">
                                    <h2>7.4 Misfit calculation<a class="headerlink" href="#misfit-calculation" title="Permalink to this headline"></a></h2>
                                    <p>After simulating the seismic wave field, downloading the raw seismic data and pre-processing both, the VERCE portal allows users to compare synthetic and recorded seismograms and to quantitatively assess the goodness of fit. Evaluating this fit is essential to approach the inverse problem in seismology and there are numerous algorithms and procedures to accomplish this task. In the portal we have so far implemented two different established techniques for misfit calculation and a third option that combines the two:</p>
                                    <ol class="arabic">
                                        <li>
                                            <p class="first"><strong>PYFLEX</strong></p>
                                            <p>This is a python port (L. Krisher; <a class="reference external" href="http://krischer.github.io/pyflex">http://krischer.github.io/pyflex</a>) of the fortran code FLEXWIN (Maggi et al., 2009;
                                                <a class="reference external" href="http://geodynamics.org/cig/software/flexwin">http://geodynamics.org/cig/software/flexwin</a>). Considering full observed and synthetic traces, the code selects a set of time-windows suitable for waveform comparison based on given input parameters and estimates cross-correlation, time-shift and amplitude ratio within each window. The code allows for an automated selection of the windows handling large data volumes and also complex 3D simulated waveforms, hence it is particularly useful for iterative tomographic inversions (Maggi et al., 2009). For a complete description of the method and the parameters see the manual of PYFLEX (or FLEXWIN).</p>
                                            <p>In the portal this option corresponds to ‘<em>misfit_type = pyflex’</em>.</p>
                                        </li>
                                        <li>
                                            <p class="first"><strong>Kristeková’s misfit method</strong></p>
                                            <p>This is a python code based on the method developed by Kristeková et al. (2006) and Kristeková et al. (2009). The method compares observed and synthetic full-waveforms and allows the following time-frequency (TF) misfit criteria to be estimated:</p>
                                            <ul class="simple">
                                                <li>time-frequency envelope misfit (TFEM)</li>
                                                <li>time-frequency phase misfit (TFPM)</li>
                                                <li>time envelope misfit (TEM)</li>
                                                <li>time phase misfit (TPM)</li>
                                                <li>frequency envelope misfit (FEM)</li>
                                                <li>frequency phase misfit (FPM)</li>
                                                <li>envelope misfit (EM)</li>
                                                <li>phase misfit (PM)</li>
                                            </ul>
                                            <p>This method allows for comparing arbitrary time signals in their entire TF complexity, thus providing a detailed TF anatomy of the disagreement between two full signals from the point of view of both envelope and phase (Kristeková et al., 2009). For a complete description of the method see Kristeková et al. (2006) and Kristeková et al. (2009).</p>
                                            <p>In the portal this option corresponds to ‘<em>misfit_type =
time_frequency’</em>.</p>
                                        </li>
                                        <li>
                                            <p class="first"><strong>PYFLEX + Kristeková’s misfit method</strong></p>
                                            <p>In this case the time windows are selected using the code PYFLEX and then the time-frequency misfit criteria are estimated on this windows using Kristekova’s method.</p>
                                            <p>In the portal this corresponds to ‘<em>misfit_type =
pyflex_and_time_frequency’</em>.</p>
                                        </li>
                                    </ol>
                                    <p>The section of the VERCE portal for misfit calculation is accessible through the ‘<em>Misfit</em>’ tab in the ‘<em>Forward Modelling</em>’ panel and it consists of the following sub-sections that allows for the set-up of a misfit job.</p>
                                    <ul class="simple">
                                        <li><em>‘Setup’</em> tab:</li>
                                    </ul>
                                    <blockquote>
                                        <div>Select one of the processing job that have been run and that are listed in the upper window of this panel. Then select the ‘<em>Misfit type</em>’ from the drop-down menu considering that</div>
                                    </blockquote>
                                    <ul class="simple">
                                        <li>‘<em>pyflex’</em> corresponds to option 1 above</li>
                                        <li>‘<em>time</em>_<em>frequency’</em> corresponds to option 2 above</li>
                                        <li>‘<em>pyflex_and_time_frequency’</em> corresponds to option 3 above</li>
                                    </ul>
                                    <blockquote>
                                        <div>For each misfit procedure the lower window of the panel shows the corresponding parameters that should be set up by the user. In particular, for option 1 – ‘PYFLEX’ the tuning parameters control the window selection and are fully described in the manual of the code; for option 2 – ‘Kristeková’s misfit method’ the main parameters are the minimum and maximum period at which the waveforms have been filtered; option 3 – ‘PYFLEX + Kristeková’s misfit method‘ contains all the parameters of the two previous options. (See Figure 7.8).</div>
                                    </blockquote>
                                    <ul>
                                        <li>
                                            <p class="first">‘<em>Submit’</em> tab:</p>
                                            <p>A summary of the chosen misfit method and set up parameters is shown in the upper window of this section. Then, you can setup the submission parameters in the lower window and launch the misfit job by clicking on ‘<em>Submit</em>’ on the lower right.</p>
                                        </li>
                                        <li>
                                            <p class="first">‘<em>Control</em>’ tab:</p>
                                            <p>As always, the window shows a list of the misfit jobs that have been launched and the blue-eye icon links to the main ‘<em>Results</em>’ page where the outputs of the selected job can be explored together with the provenance graphs. The outputs can be also accessed by searching for the specific misfit job directly from the ‘<em>Results</em>’ panel (see section 7.1) or from the ‘<em>iRODS</em>’ panel (see section 7.4).</p>
                                        </li>
                                    </ul>
                                    <p>The output products of a misfit job are png files showing the waveform comparison for each component of each selected seismic station. The figures are different depending on the misfit option chosen in the ‘
                                        <em>Setup</em>’ tab (see examples in Figures 7.9 and 7.10). To access these output files use the ‘<em>Search</em>’ button in the ‘<em>Data
products</em>’ window of the ‘<em>Results</em>’ tab searching for mime-type ‘
                                        <em>image/png</em>’.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image83.png' target="_blank">
                                        <img alt="image7" src='<%=request.getContextPath()%>/images/image83.png' />
                                    </a>

                                    <p><strong>Figure 7.8:</strong> Example of the set-up of a misfit job using in combination PYFLEX and Kristeková’s method.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image93.png' target="_blank">
                                        <img alt="image8" src='<%=request.getContextPath()%>/images/image93.png' />
                                    </a>

                                    <p><strong>Figure 7.9:</strong> Example of an output file produced by calculating the misfit using PYFLEX. For each component of each station the figure shows the observed data in black, the synthetic trace in red and the short-term average/long-term average ratio in blue; the windows selected by the code are highlighted.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image103.png' target="_blank">
                                        <img alt="image9" src='<%=request.getContextPath()%>/images/image103.png' />
                                    </a>

                                    <p><strong>Figure 7.10:</strong> Example of an output file produced by calculating the misfit using Kristeková’s method. For each component of each station the figure shows the observed data in black, the synthetic trace in red; moreover, it shows the Kristeková’s misfi criteria TFEM, TFPM, TEM, TPM, FEM, FPM, EM, PM (see the text for details).</p>
                                </div>
                                <div class="section" id="accessing-the-results-through-irods">
                                    <h2>7.4 Accessing the results through iRODS<a class="headerlink" href="#accessing-the-results-through-irods" title="Permalink to this headline"></a></h2>
                                    <p>After any of the jobs described above (simulation, download, processing and misfit) is finished, the output products are shipped from the HPC resource, that performed the calculation, to the store repository of the VERCE portal. This storage is managed through iRODS that provides a repository shared among the federated nodes of the VERCE organisation. How to create an account in iRODS is described in section 3 of this manual, and after that you can log in selecting the ‘<em>IRODS</em>’ panel in the portal main menu (see Figure 7.11).</p>

                                    <a href='<%=request.getContextPath()%>/images/image113.png' target="_blank">
                                        <img alt="image10" src='<%=request.getContextPath()%>/images/image113.png' />
                                    </a>
                                    <p><strong>Figure 7.11:</strong> Screenshot of the ‘IRODS’ panel in the VERCE portal</p>
                                    <p>Entering iRODS gives you access to your personal folder where you can navigate the results of all your completed jobs (of any type) as anticipated above. The run results are organised in trees of subfolders with the main directory called using the ‘<em>Name</em>’ you have chosen for your job (see section 5.6), as shown for example in Figure 7.12.</p>
                                    
                                    <a href='<%=request.getContextPath()%>/images/image122.png' target="_blank">
                                        <img alt="image11" src='<%=request.getContextPath()%>/images/image122.png' />
                                    </a>
                                    <p><strong>Figure 7.12:</strong> Example of the iRODS subfolder structure containing the results of the jobs.</p>
                                    <p>A given job can be selected by double-clicking on the relative folder and, navigating the subdirectories, you can access all the same input and output files of each job that have been described in the above sections.
                                    </p>
                                    <p>It is very important that in order to visualise or download any output or input data from the portal, both via the ‘<em>Results</em>’ tab or the ‘
                                        <em>iRODS</em>’ tab, you always need to firstly log in into the ‘
                                        <em>iRODS</em>’ panel (Figure 7.11) because the storage database is accessible only to authenticated users.</p>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/section8.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/section6.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>