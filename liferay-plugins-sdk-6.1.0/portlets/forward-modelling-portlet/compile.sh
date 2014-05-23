#!/bin/bash

# requires Sencha Cmd installed and in the path
# don't compile arbor and related libraries, because of webworkers
sencha -sdk ./ext-4.2.1.883/ compile -classpath=./docroot/js/app.js,./docroot/js/app,./docroot/js/src/GeoExt concatenate -st -co ./docroot/js/app-all.js

# To actually use the compiled file, see mapgui.jsp
