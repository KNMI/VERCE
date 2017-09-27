cd ..
export RUN_ID='testt_misfit012222323gsfeded'
export STAGED_DATA=./
export TEST=../test-resources/testfiles/
export USER_NAME=aspinuso
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
python -m dispel4py.new.processor simple  test.misfit_processing.misfit_processing_prov -f test/misfit_processing/pyflex_misfit_inputs.json
#python -m dispel4py.new.processor multi  test.misfit_processing.misfit_processing_prov -f test/misfit_processing/pyflex_misfit_inputs.json -n 40
