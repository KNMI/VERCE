cd ..
export JSON_OUT=../test-resources/testfiles/
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
python -m dispel4py.new.processor simple test.hpc.forwardsim.postproc_graph_kml