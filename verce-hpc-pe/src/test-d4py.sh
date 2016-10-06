export JSON_OUT=../test-resources/testfiles/

export EVENT_PATH=$JSON_OUT
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
python -m dispel4py.new.processor -t mpi -n 16 test.dispel4PyDownloadPE.test_downloading_dispel4py -f inputfile
#mpirun-openmpi-mp -n 17 python -m dispel4py.worker_mpi test.dispel4PyDownloadPE.test_downloading_dispel4py -f $JSON_OUT/input_download.json

