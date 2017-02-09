#!/bin/bash -l
. /etc/profile
. /etc/profile.d/modules.sh

module load python/2.7.6 
module load globus

unzip vercepes >/dev/null
export RUN_PATH=`pwd`
export INPUT_FILE=$RUN_PATH/conf
echo $INPUT_FILE

export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)
RND=$RUN_ID
export STAGED_DATA=$HOME/$RUN_ID
mkdir -p $HOME/"provfold"$RND


export RUN_PATH=$(pwd)
export PROV_PATH=$HOME/"provfold"$RND
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export IRODS_URL=dir-irods.epcc.ed.ac.uk

echo ---------------- data stage-in ------------------------
cd verce-hpc-pe/src/
python -m dispel4py.new.processor multi test.misfit_processing.stagein_graph -n 18 -f $INPUT_FILE

cd $RUN_PATH

echo $RND > control



echo $RND > control
cat control