cd ..

export FILE=../test-resources/testfiles/
export PROV_PATH=prov_files/
export USER_NAME=$(python PEDataExtractor.py $FILE/solverconf202 root user_name)
export RUN_ID=$(python PEDataExtractor.py $FILE/solverconf202 root runId)
export MODEL_PATH=$RUN_ID
export IRODS_URL=dir-irods.epcc.ed.ac.uk
export INPUT_FILE=$FILE/solverconf202
python -m dispel4py.new.processor simple test.hpc.forwardsim.stagein_graph
