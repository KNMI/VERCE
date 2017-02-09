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
RUN_PATH=$(pwd)
TRANSFER_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py conf root dataloc)
PROVENANCE_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py conf root provloc)
CLEANING_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py conf root cleanloc)
USER_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_id)
USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
SOURCE_BASE_URL=$(python verce-hpc-pe/src/PEDataExtractor.py conf root target_base_url)
HOST_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root hostname)
RUN_ID=$(cat control)
echo $USER_ID
echo $SOURCE_BASE_URL
arr_transfer=(`echo $TRANSFER_PATHS`);
arr_cleaning=(`echo $CLEANING_PATHS`);
arr_provenance=(`echo $PROVENANCE_PATHS`);
PROV_PATH=$HOME/provfold$RUN_ID/

#terminates metadata listener
touch $PROV_PATH/exitf

echo ------ Transferring data to IRODS -------
for i in "${arr_transfer[@]}"
do
echo $USER_ID
echo $i

echo globus-url-copy -cd -r -c -fast -cc 4 -stall-timeout 30 $i gsiftp://verce-irods.scai.fraunhofer.de/~/verce/$i
globus-url-copy -cd -r -c -fast -cc 4 -stall-timeout 30 $i gsiftp://verce-irods.scai.fraunhofer.de/~/verce/$i
done




echo ------ Cleaning cluster -------
for i in "${arr_cleaning[@]}"
do
echo rm -rf $i
rm -rf $i
done

