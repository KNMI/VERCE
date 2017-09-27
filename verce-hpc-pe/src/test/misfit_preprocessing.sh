cd ..
export STAGED_DATA=./
export RUN_ID='concrete_misfit_preproc01014eedd45'
export USER_NAME='aspinuso'
export JSON_OUT=../test-resources/testfiles/
export STAGED_DATA=./
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
export MISFIT_PREP_CONFIG=test/misfit_preprocessing/processing.json
#python -m dispel4py.new.processor multi test.misfit_preprocessing.create_misfit_prep -n 15 -f test/misfit_preprocessing/misfit_input.jsn
python -m dispel4py.new.processor multi test.misfit_preprocessing.create_misfit_prep -n 64 -f test/misfit_preprocessing/misfit_input.jsn
