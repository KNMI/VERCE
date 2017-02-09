#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load python/2.7.6 
module load obspy/0.10.1
module load  mpi4py/1.3.1


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
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
NPROC=$(python verce-hpc-pe/src/PEDataExtractor.py conf root nproc)
export STAGED_DATA=$HOME/$RUN_ID
mkdir -p $STAGED_DATA/output
MSEED=$(python verce-hpc-pe/src/PEDataExtractor.py conf root mseed_path)
XML=$(python verce-hpc-pe/src/PEDataExtractor.py conf root stationxml_path)
SOURCE_BASE=""


XML=$HOME/$XML
MSEED=$HOME/$MSEED
export MISFIT_PREP_CONFIG=$RUN_PATH/pipelines.json

echo $RUN_ID
echo $XML
echo $MSEED

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)

cd verce-hpc-pe/src
python -m dispel4py.new.processor simple test.misfit_processing.misfit_processing_prov -f $RUN_PATH/conf
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output/
#python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/stationxml/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $HOME/$PROV_PATH
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $STAGED_DATA/
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
