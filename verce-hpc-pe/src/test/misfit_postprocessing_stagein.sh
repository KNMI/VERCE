cd ..
export JSON_OUT=../test-resources/testfiles/
export RUN_ID='concrete_misfit'
export USER_NAME=aspinuso
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export STAGED_DATA=./$RUN_ID
export IRODS_URL=dir-irods.epcc.ed.ac.uk
export INPUT_FILE=../test-resources/testfiles/misfit_time_frequency_conf.json
#python -m dispel4py.new.processor -t multi -n 18 test.misfit.misfit_pes_prov 
#mpirun-openmpi-mp -n 18 python -m dispel4py.new.processor -t mpi test.misfit.misfit_preprocess
#python -m dispel4py.new.processor -t simple test.misfit.misfit_pes_prov
python -m dispel4py.new.processor simple test.misfit_processing.stagein_graph -f ../test-resources/testfiles/misfit_time_frequency_conf.json