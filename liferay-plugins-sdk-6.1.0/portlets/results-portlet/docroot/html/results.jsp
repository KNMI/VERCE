<html>

<head>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/extjs/6.2.0/classic/theme-neptune/resources/theme-neptune-all-debug.css" />
    <!-- <link rel="stylesheet" type="text/css" href="https://extjs.cachefly.net/ext/gpl/5.0.0/build/packages/ext-theme-classic/build/resources/ext-theme-classic-all.css" /> -->
    <script language="javascript" type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.debug.js"></script>
    <script language="javascript" type="text/javascript" src="<%=request.getContextPath()%>/js/lib/arbor.js"></script>
    <script language="javascript" type="text/javascript" src="<%=request.getContextPath()%>/js/_/graphics.js"></script>
    <script language="javascript" type="text/javascript" src="<%=request.getContextPath()%>/js/_/renderer.js"></script>

    <!-- comment these lines when using compiled scripts -->

    <script type="text/javascript" charset="utf-8" src="https://cdnjs.cloudflare.com/ajax/libs/extjs/6.2.0/ext-all-debug.js"></script>
    <!-- <script type="text/javascript" charset="utf-8" src="https://extjs.cachefly.net/ext/gpl/5.0.0/build/ext-all-debug.js"></script> -->
    <script type="text/javascript" charset="utf-8" src="<%=request.getContextPath()%>/js/app-results.js"></script>
    <style>
        .my-legend .legend-title {
            text-align: left;
            margin-bottom: 8px;
            font-weight: bold;
            font-size: 120%;

        }

        .my-legend .legend-scale ul {
            margin: 0;
            padding: 0;
            float: left;
            list-style: none;
        }

        .my-legend .legend-scale ul li {
            display: block;
            float: left;
            width: 50px;
            margin-bottom: 6px;
            text-align: center;
            font-size: 80%;
            list-style: none;
        }

        .my-legend ul.legend-labels li span {
            display: block;
            float: left;
            height: 15px;
            width: 50px;
        }

        .my-legend .legend-source {
            font-size: 120%;
            clear: both;
        }

        .my-legend a {
            color: #777;
        }

        #search-results a {
            color: #385F95;
            font: bold 11px tahoma, arial, helvetica, sans-serif;
            text-decoration: none;
        }

        #search-results a:hover {
            text-decoration: underline;
        }

        #search-results p {
            margin: 3px !important;
        }

        .search-item {
            font: normal 11px tahoma, arial, helvetica, sans-serif;
            padding: 3px 10px 3px 10px;
            border: 1px solid #fff;
            border-bottom: 1px solid #eeeeee;
            white-space: normal;
            color: #555;
        }

        .search-item h3 {
            display: block;
            font: inherit;
            font-weight: bold;
            color: #222;
        }

        .search-item h3 span {
            float: right;
            font-weight: normal;
            margin: 0 0 5px 5px;
            width: 100px;
            display: block;
            clear: none;
        }

        .x-form-clear-trigger {
            background-image: url(../../resources/themes/images/default/form/clear-trigger.gif);
        }

        .x-form-search-trigger {
            background-image: url(../../resources/themes/images/default/form/search-trigger.gif);
        }

        .cf-header {
            background-color: #252F49;
            border-bottom: 1px solid #16191D;
            color: white;
            font-size: 16px;
            font-weight: bold;
            padding: 10px;
            text-align: center;
            text-shadow: 0 1px 0 #16191D;
        }

        .cf-helpwindow {
            background-color: #FFFFFF;
            padding: 5px;
        }

        .cf-helpwindow div.cascade {
            padding: 0 0 0 5px;
        }

        .cf-helpwindow h2 {
            margin: 2px 0 0 0;
        }
    </style>
</head>

<body>
    <%@ include file="/html/init.jsp" %>
</body>

</html>