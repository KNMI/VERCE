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

                            <li>Appendix 3 – Using ObsPy</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="appendix-3-using-obspy">
                                <h1>Appendix 3 – Using ObsPy<a class="headerlink" href="#appendix-3-using-obspy" title="Permalink to this headline"></a></h1>
                                <p>ObsPy is a python based seismology toolbox, which can be used to deal with seismic waveform data and earthquake catalogue information. The toolbox can read a large range of seismic data formats and perform a large range of processing applications such as filtering the data, and misfit calculation.</p>
                                <p>Many of the pre- and post-processing applications within the portal use python and ObsPy. The toolbox can also be used to format input data, for instance producing an earthquake catalogue in quakeML format.</p>
                                 
                                <a href='<%=request.getContextPath()%>/images/image13.png' target="_blank">
                                    <img alt="image0" src='<%=request.getContextPath()%>/images/image13.png' />
                                </a>
                                <p><strong>Figure A3.1:</strong> The ObsPy logo</p>
                                <p><strong>A3.1 Installing Python and ObsPy</strong></p>
                                <ol class="arabic">
                                    <li>
                                        <p class="first"><strong>Installing Python:</strong> Depending on your operating system this can be installed through the software manager. Alternatively the latest version of python can be installed here,</p>
                                        <blockquote>
                                            <div>
                                                <p><a class="reference external" href="https://www.python.org/downloads">https://www.python.org/downloads</a></p>
                                                <p>You will also require to specific python libraries that can be installed from GitHub as described below.</p>
                                            </div>
                                        </blockquote>
                                    </li>
                                </ol>
                                <ol class="arabic">
                                    <li>
                                        <p class="first"><strong>Installing anaconda:</strong> if you do not have super user privalages on your machine then both ObsPy and dispel4py (see appendix two) can be installed using Anaconda, a package to manage and deploy Python packages. Anaconda can be installed on mac and Linux operating systems as described here,</p>
                                        <blockquote>
                                            <div>
                                                <p><a class="reference external" href="http://docs.continuum.io/anaconda/install.html">http://docs.continuum.io/anaconda/install.html</a></p>
                                                <p><strong>Installing ObsPy</strong>: Make sure you have a C and fortran compile installer. You can then install ObsPy with the command,</p>
                                                <p>conda install -c obspy obspy</p>
                                                <p>or, if you have not installed anaconda,</p>
                                                <p>sudo pip install obspy</p>
                                                <p>Full instructions can be found at</p>
                                                <p><a class="reference external" href="https://github.com/obspy/obspy/wiki#installation">https://github.com/obspy/obspy/wiki#installation</a></p>
                                            </div>
                                        </blockquote>
                                    </li>
                                </ol>
                                <p><strong>A3.2 Other dependencies you need to run ObsPy are listed below;</strong></p>
                                <p><strong>numPy</strong> – a toolbox for doing numerical applications in python.</p>
                                <p>sudo apt-get install python-numpy</p>
                                <p><strong>SciPy</strong> – a generic scientific programming toolbox for applications in python.
                                </p>
                                <p>sudo apt-get install python-scipy</p>
                                <p>Additionally, in order to do the plotting parts of the tutorial below you will need to install the following;</p>
                                <p><strong>Matplotlib</strong> – a toolbox for creating plots and figures for python applications. Figures are customised very easily and intuitively, and can be exported in a number of different. Files can also be exported easily to a .mat file for Matlab users.</p>
                                <p>sudo apt-get install python-matplotlib</p>
                                <p><strong>A3.3 Using ObsPy</strong></p>
                                <p>A full online python tutorial, that covers everything from a basic introduction to ObsPy, up to more advanced applications such as developing an automated processing workflow, can be found at the link below;
                                </p>
                                <p><a class="reference external" href="http://docs.obspy.org/tutorial/">http://docs.obspy.org/tutorial/</a></p>
                                 
                                <a href='<%=request.getContextPath()%>/images/image2.jpg' target="_blank">
                                    <img alt="image1" src='<%=request.getContextPath()%>/images/image2.jpg' />
                                </a>
                                <p><strong>Figure A3.2:</strong> Z-component data plotted using ObsPy. Image re-produced from</p>
                                <p><a class="reference external" href="http://docs.obspy.org/tutorial/code_snippets/reading_seismograms.html">http://docs.obspy.org/tutorial/code_snippets/reading_seismograms.html</a></p>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/appendix4.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/appendix2.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>