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

export RUN_ID=$(date | md5sum | awk '{print $1}')

RND=$RUN_ID

export RUN_PATH=$(pwd)

export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export IRODS_URL=verce-irods.scai.fraunhofer.de
export INPUT_FILE=$RUN_PATH/conf



mkdir -p $HOME/"provfold"$RND

echo $RND > control
cat control