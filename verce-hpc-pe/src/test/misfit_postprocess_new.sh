cd ..
export TEST=../test-resources/testfiles/

export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
#python -m dispel4py.new.processor simple  test.postprocess_new.misfit_postprocess -f test/postprocess_new/pyflex_and_time_frequency.json
mpirun-openmpi-mp -n 10 python -m dispel4py.new.processor mpi test.postprocess_new.misfit_postprocess -f test/postprocess_new/pyflex_and_time_frequency.json
#python -m dispel4py.new.processor -t simple test.postprocess_new.misfit_postprocess_prov -f ../test/postprocess_new/pyflex_and_time_frequency.json