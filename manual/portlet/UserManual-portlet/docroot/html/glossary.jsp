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

                            <li>VERCE glossary</li>

                            <li class="wy-breadcrumbs-aside">

                            </li>

                        </ul>

                        <hr/>
                    </div>
                    <div role="main" class="document" itemscope="itemscope" itemtype="http://schema.org/Article">
                        <div itemprop="articleBody">

                            <div class="section" id="verce-glossary">
                                <h1>VERCE glossary<a class="headerlink" href="#verce-glossary" title="Permalink to this headline"></a></h1>
                                <p><strong>Workflow</strong> – refers to a sequence of jobs that can be submitted. In the VERCE project we have a number of workflows prepared that can run you job on a specific high performance computer.</p>
                                <p><strong>HPC</strong> – high performance computing. This usually refers to parallel computers, where a given computational task is spread over many separate processing cores.</p>
                                <p><strong>iRODS</strong> – a suite of data managements software that is embedded within the VERCE platform, and allows you to easily access your data regardless of where you submitted your simulation.</p>
                                <p><strong>superMUC</strong> – a super computer hosted by the LRZ in Munich, Germany.</p>
                                <p><strong>SCAI</strong> – a super computer hosted by CINECA in Italy.</p>
                                <p><strong>DT</strong> – the time step of the waveform model.</p>
                                <p><strong>Solver</strong> – shorthand for the code that does the forward calculation. The solver currently hosted in the VERCE platform is SPECFEM.</p>
                                <p><strong>Mesh</strong> – the grid over which the wavefield is calculated. The modelled space is broken up into a grid of points, each with specific seismic properties (e.g. p-wave velocity, s-wave velocity, seismic attenuation). The spacing of this grid is able to change especially with depth (due to the increasing seismic velocity). The structure of these grid points is referred to as the mesh.</p>
                                <p><strong>Velocity model</strong> – this is the seismic velocity model that is input for an area, and includes the p-wave and s-wave velocities. Most models in the VERCE portal are 3D, though there are some 2D models (for subduction zones) and 1D models (global 1D velocity models) available.</p>
                                <p><strong>CPML</strong> – ‘convolutional perfectly matched layers’ are a type of absorbing boundary condition</p>
                                <p><strong>Absorbing Boundary Conditions</strong> – are at the edges of the model that shouldn’t reflect the seismic energy. These boundary conditions are designed to absorb an incoming wave simulating an infinite medium.</p>
                                <p><strong>CUBIT</strong> – an external program used for making meshes for a variety of scientific and engineering modelling disciplines.</p>
                                <p><strong>TRELIS</strong> – the commercial name for the CUBIT package.</p>
                                <p><strong>GeoCubit</strong> – a python based program that uses CUBIT command to create meshes for geographical bodies. Particularly, GeoCubit can produce meshes that include topography and/or bathymetry.</p>
                            </div>

                        </div>

                    </div> 
                    <div class="rst-footer-buttons" role="navigation" aria-label="footer navigation">
                        <a href='<%=request.getContextPath()%>/html/appendix1.jsp' class="btn btn-neutral float-right" title="1. Introduction to the VERCE platform" accesskey="n" rel="next">Next 
                                          <span class="fa fa-arrow-circle-right"></span> </a>

                        <a href='<%=request.getContextPath()%>/html/section8.jsp' class="btn btn-neutral" title="Table of Contents" accesskey="p" rel="prev"><span class="fa fa-arrow-circle-left"></span> Previous</a>
                    </div>
                    <%@ include file="footer.jsp" %>
                </div>
            </div>

        </section>

    </div>

</div>