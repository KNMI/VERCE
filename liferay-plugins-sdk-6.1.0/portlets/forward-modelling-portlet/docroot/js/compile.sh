#!/bin/bash

# requires Sencha Cmd installed and in the path
sencha -sdk ./ext-4.2.1.883/ compile -classpath=./_,./lib/arbor.js,./app.js,./app,./src/GeoExt concatenate -st -co app-all.js

# To actually use the compiled file, see mapgui.jsp
