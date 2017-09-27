cd ..
export JSON_OUT=../test-resources/testfiles/
export USER_NAME=aspinuso
export RUN_PATH=$JSON_OUT
export PROV_PATH=prov_files/
export IRODS_URL=dir-irods.epcc.ed.ac.uk
export INPUT_FILE=test/misfit_preprocessing/preprocessing_stagein.jsn
#python -m dispel4py.new.processor -t multi -n 18 test.misfit.misfit_pes_prov 
#mpirun-openmpi-mp -n 18 python -m dispel4py.new.processor -t mpi test.misfit.misfit_preprocess
#python -m dispel4py.new.processor -t simple test.misfit.misfit_pes_prov
python -m dispel4py.new.processor multi test.misfit_preprocessing.stagein_graph  -n 18 -f test/misfit_preprocessing/preprocessing_stagein.jsn
