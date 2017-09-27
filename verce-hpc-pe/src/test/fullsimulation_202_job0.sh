cd ..
export STAGED_DATA=./
export RUN_ID='concrete_misfit_preproc010'
export USER_NAME='aspinuso'
export INPUT_FILE=../test-resources/testfiles/
export STAGED_DATA=./
export PROV_PATH=prov_files/
export JSON_OUT=$INPUT_FILE/jsonout_run_specfem
export MISFIT_PREP_CONFIG=test/misfit_preprocessing/processing.json
export EVENT_PATH=$INPUT_FILE
export RUN_PATH=$INPUT_FILE

#WORK_SHARED should be renamed to MODEL_PATH
export WORK_SHARED=$HOME/$MODEL

echo "producing input files..."
python bulk_inputgen.py $INPUT_FILE/DefaultName_8 $INPUT_FILE/DefaultName_6 $INPUT_FILE/SPECFEM3D_CARTESIAN_202_DEV_simulation_Muz_Plain_Reg0000_1456356945649.json


