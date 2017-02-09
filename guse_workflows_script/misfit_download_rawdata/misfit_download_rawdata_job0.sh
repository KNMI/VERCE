#!/bin/bash -l
. /etc/profile
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
#MSEED=$(python verce-hpc-pe/src/PEDataExtractor.py conf root mseed_path)
#XML=$(python verce-hpc-pe/src/PEDataExtractor.py conf root stationxml_path)
HOSTN=dir-vm6.epcc.ed.ac.uk
SOURCE_BASE=gsiftp://$HOSTN

export STAGED_DATA=$HOME/$RUN_ID
#XML=$STAGED_DATA/$XML
#MSEED=$STAGED_DATA/$MSEED

echo $RUN_ID
#echo $XML
#echo $MSEED

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)

cd verce-hpc-pe/src
python -m dispel4py.new.processor multi test.dispel4PyDownloadPE.test_downloading_dispel4py -n 20 -f $RUN_PATH/conf
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $PROV_PATH/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $STAGED_DATA/
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
