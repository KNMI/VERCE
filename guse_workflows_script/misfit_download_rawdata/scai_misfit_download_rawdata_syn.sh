#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load tools/python/2.7.9

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