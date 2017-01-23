cd ..
export JSON_OUT=../test-resources/testfiles/
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
#mpirun-openmpi-mp -n 15 python -m dispel4py.new.processor mpi test.hpc.forwardsim.postproc_graph
python -m dispel4py.new.processor  multi  test.hpc.forwardsim.postproc_graph -n 20