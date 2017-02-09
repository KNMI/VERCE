#!/bin/bash -l
. /etc/profile
. /etc/profile.d/modules.sh

module load python/2.7.6

unzip vercepes
cat conf

export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)
RND=$RUN_ID

mkdir -p $HOME/"provfold"$RND
export STAGED_DATA=$HOME/$RUN_ID
mkdir -p $STAGED_DATA


export RUN_PATH=$(pwd)
export PROV_PATH=$HOME/"provfold"$RND
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export IRODS_URL=dir-irods.epcc.ed.ac.uk

echo "11:34 new"
echo $RND > control
cat control