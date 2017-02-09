#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load tools/python/2.7.9 tools/obspy/0.10.2 intel/studio/2015.1.133 


unzip vercepes >/dev/null
unzip data >/dev/null
RND=$(cat control)
mkdir -p $HOME/"provfold"$RND
export PROV_PATH=$HOME/"provfold"$RND
export DISPLAY=localhost:38.0
echo  -------------------------------------------------------
export RUN_PATH=$(pwd)
export RUN_BASE=$(basename "$PWD")
export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)
export NPROC=$(python verce-hpc-pe/src/PEDataExtractor.py conf root nproc)
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export STAGED_DATA=$HOME/$RUN_ID
mkdir -p $STAGED_DATA/output
MSEED=$(python verce-hpc-pe/src/PEDataExtractor.py conf root mseed_path)
XML=$(python verce-hpc-pe/src/PEDataExtractor.py conf root stationxml_path)
HOSTN=dir-vm6.epcc.ed.ac.uk
SOURCE_BASE=gsiftp://$HOSTN


XML=$HOME/$XML
MSEED=$HOME/$MSEED
export MISFIT_PREP_CONFIG=$RUN_PATH/pipelines.json

echo $RUN_ID
echo $XML
echo $MSEED

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)

cd verce-hpc-pe/src
#python -m dispel4py.new.processor multi test.misfit_preprocessing.create_misfit_prep -n $NPROC -f $RUN_PATH/conf
mpiexec.hydra python -m dispel4py.new.processor mpi test.misfit_preprocessing.create_misfit_prep -f $RUN_PATH/conf
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output-images/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output-intermediate/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/stationxml/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $HOME/$PROV_PATH
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $STAGED_DATA/
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
