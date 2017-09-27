cd ..
export RUN_ID='testt3'
export USER_NAME=aspinuso
export TEST=../test-resources/testfiles/
export STAGED_DATA=./
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
python -m dispel4py.new.processor simple  test.misfit_processing.misfit_processing_prov -f test/misfit_processing/pyflex_and_time_frequency.json
#mpirun-openmpi-mp -n 14 python -m dispel4py.new.processor mpi test.misfit_postprocessing.misfit_postprocess_prov -f test/misfit_postprocessing/pyflex_and_time_frequency.json
#python -m dispel4py.new.processor multi  test.misfit_processing.misfit_process_prov -n 32 -f test/misfit_postprocessing/pyflex_and_time_frequency.json
