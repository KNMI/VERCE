cd ..
export RUN_ID='testt_misfit'
export STAGED_DATA=./
export TEST=../../test-resources/testfiles/
export USER_NAME=aspinuso
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=../../test-resources/prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
python -m dispel4py.new.processor simple  test.misfit_processing.misfit_processing_prov -f test/misfit_processing/misfit_time_frequency.json
#mpirun-openmpi-mp -n 20 python -m dispel4py.new.processor mpi test.misfit_postprocessing.misfit_postprocess_prov -f test/misfit_postprocessing/misfit_time_frequency.json
#python -m dispel4py.new.processor -t simple test.misfit_postprocessing.misfit_postprocess_prov -f  test/misfit_postprocessing/misfit_time_frequency.json