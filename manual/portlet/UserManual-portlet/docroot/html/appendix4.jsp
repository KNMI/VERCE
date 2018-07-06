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

                            <li>Appendix 4 – using dispel4py</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="appendix-4-using-dispel4py">
                                <h1>Appendix 4 – using dispel4py<a class="headerlink" href="#appendix-4-using-dispel4py" title="Permalink to this headline"></a></h1>
                                <p>Dispel4Py is a python library that allows workflows to be written that can easily scale to different sizes of computational resource, ranging from your own laptop, to a large parallel supercomputer. This means that you can devolve and test your workflow locally on your own machine before transferring the workflow to a much larger computer to process a large amount of data.</p>
                                <p>In seismology this could be particularly useful for performance calculations with very large data sets, such as noise correlation. Dispel4Py is used widely in the VERCE portal in the pre- and post-processing workflows that are implemented there. This toolbox is especially useful for any seismologist who is looking to speed up a data application.
                                </p>
                                
                                <a href='<%=request.getContextPath()%>/images/image14.png' target="_blank">
                                    <img alt="image0" src='<%=request.getContextPath()%>/images/image14.png' />
                                </a>
                                <p><strong>Figure A4.1:</strong> The Dispel4Py logo.</p>
                                <div class="section" id="a4-1-installing-dispel4py">
                                    <h2>A4.1 Installing Dispel4Py<a class="headerlink" href="#a4-1-installing-dispel4py" title="Permalink to this headline"></a></h2>
                                    <p>Firstly please ensure that you have an up to data version of Python installed as described in appendix one. You can then install Dispel4Py and its dependencies (such as MPI) as described below.</p>
                                    <ol class="arabic">
                                        <li>
                                            <p class="first"><strong>Installing dispel4py:</strong> Dispel4py can be installed using the command,
                                            </p>
                                            <blockquote>
                                                <div>
                                                    <p>pip install dispel4py</p>
                                                    <p>Full instructions for installing dispel4py can be found at,</p>
                                                    <blockquote>
                                                        <div>
                                                            <p><a class="reference external" href="https://github.com/dispel4py/dispel4py">https://github.com/dispel4py/dispel4py</a></p>
                                                        </div>
                                                    </blockquote>
                                                </div>
                                            </blockquote>
                                        </li>
                                    </ol>
                                    <ol class="arabic">
                                        <li>
                                            <p class="first"><strong>Installing MPI and mpi4py (optional):</strong> If you wish to explore the parallel mapping of dispel4py to MPI you may want to install these on your machine. Different implementations of MPI are available, for example Open MPI or MPICH2. Depending on your operating system MPI can be installed through the software manager. You can then install mpi4py with the command:</p>
                                            <blockquote>
                                                <div>
                                                    <p>pip install mpi4py</p>
                                                </div>
                                            </blockquote>
                                        </li>
                                    </ol>
                                    <p>Full instructions can be found at:</p>
                                    <p><a class="reference external" href="http://mpi4py.scipy.org/docs/usrman/install.html">http://mpi4py.scipy.org/docs/usrman/install.html</a></p>
                                </div>
                                <div class="section" id="a4-2-using-disple4py">
                                    <h2>A4.2 Using Disple4Py<a class="headerlink" href="#a4-2-using-disple4py" title="Permalink to this headline"></a></h2>
                                    <p>A full tutorial describing how to create workflows and perform sequential and parallel processing using Dispel4Py can be found at the link below.</p>
                                    <p><a class="reference external" href="http://www2.epcc.ed.ac.uk/~amrey/VERCE/Dispel4Py/">http://www2.epcc.ed.ac.uk/~amrey/VERCE/Dispel4Py/</a></p>
                                    <p>For more information on the basic principles of Dispel4Py please see the following presentation.</p>
                                    <p><a class="reference external" href="http://www.verce.eu/Training/UseVERCE/2015-7-VERCE-dispel4py-basic.pdf">http://www.verce.eu/Training/UseVERCE/2015-7-VERCE-dispel4py-basic.pdf</a></p>
                                    <p>An advanced introduction for those who wish use Dispel4Py to create workflows for their own applications can be found at the link below.</p>
                                    <p><a class="reference external" href="http://www.verce.eu/Training/UseVERCE/2015-7-VERCE-dispel4py-advanced.pdf">http://www.verce.eu/Training/UseVERCE/2015-7-VERCE-dispel4py-advanced.pdf</a></p>
                                     
                                    <a href='<%=request.getContextPath()%>/images/image21.jpg' target="_blank">
                                        <img alt="image1" src='<%=request.getContextPath()%>/images/image21.jpg' />
                                    </a>
                                    <p><strong>Figure A4.2:</strong> An example of a workflow to perform a cross correlation of seismic noise data</p>
                                </div>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">

                        <a href='<%=request.getContextPath()%>/html/appendix3.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>