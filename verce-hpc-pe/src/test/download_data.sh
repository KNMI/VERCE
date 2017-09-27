cd ..
export JSON_OUT=../../test-resources/testfiles/
export RUN_ID="data_download_fff"
export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=../../test-resources/prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
export USER_NAME=aspinuso
export STAGED_DATA=../../test-resources/misfit-data/output
#python -m dispel4py.new.processor simple test.dispel4PyDownloadPE.test_downloading_dispel4py -f $JSON_OUT/input_download.json
#mpirun-openmpi-mp -n 17 python -m dispel4py.new.processor -t mpi -n 16 test.dispel4PyDownloadPE.test_downloading_dispel4py -f $JSON_OUT/input_download_prod.json
python -m dispel4py.new.processor multi test.dispel4PyDownloadPE.test_downloading_dispel4py -n 20 -f test/dispel4PyDownloadPE/download_conf.json