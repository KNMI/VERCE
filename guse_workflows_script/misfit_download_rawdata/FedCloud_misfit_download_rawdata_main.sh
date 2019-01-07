########################## SYNC ######################################## 
#!/bin/bash -l

echo "---------downloading epos-conda---------" 
wget -q -O /tmp/epos-conda.tar.bz2 https://portal.verce.eu/download/epos-conda-obspy-1-0-2.tar.bz2 

echo "---------tar -xf epos-conda.tar.bz2 -C /tmp ---------" 
tar -xf /tmp/epos-conda.tar.bz2 -C /tmp/ 

echo "---------source /tmp/conda/bin/activate ---------" 
source /tmp/conda/bin/activate

echo "---------conda activate obspy---------"  
conda activate obspy

unzip -q vercepes4cloud
cat conf

export USER=$(whoami) 
export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)
export RUN_PATH=$(pwd)

mkdir -p $RUN_PATH/"provfold"$RUN_ID

export STAGED_DATA=$RUN_PATH/$RUN_ID
mkdir -p $STAGED_DATA

export MODEL_PATH=$RUN_PATH/"modelfold"$RUN_ID
mkdir -p $MODEL_PATH


export PROV_PATH=$RUN_PATH/"provfold"$RUN_ID
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export IRODS_URL=verce-irods.scai.fraunhofer.de

echo $RUN_ID > control
cat control

########################### PROCESSING ################################# 

#export DISPLAY=localhost:38.0
echo  -------------------------------------------------------
 
export RUN_BASE=$(basename "$PWD") 
SOURCE_BASE=""
PROV_TARGET_BASE_URL=gsiftp://verce-irods.scai.fraunhofer.de/verce/home/public/verce/
SOURCE_BASE_URL=gsiftp://lxlogin1.lrz.de
DATA_TARGET_BASE=gsiftp://verce-irods.scai.fraunhofer.de/~/verce/ 

echo $RUN_ID 

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)

cd verce-hpc-pe/src 

echo "--- intiating Prov -- "
######################## PROV ##################################

python dirmonitor-dataprov.py $PROV_PATH $SOURCE_BASE_URL $PROV_TARGET_BASE_URL $DATA_TARGET_BASE &

################################################################

python -m dispel4py.new.processor multi test.dispel4PyDownloadPE.test_downloading_dispel4py -n 20 -f $RUN_PATH/conf
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $PROV_PATH/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $STAGED_DATA/ 

#terminates metadata listener
echo "--- terminates metadata listener -- "
touch $PROV_PATH/exitf 

cd $RUN_PATH

###################### STAGEOUT ########################################

echo "--- STAGEOUT -- "
TRANSFER_PATHS=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root dataloc)
PROVENANCE_PATHS=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root provloc)
CLEANING_PATHS=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root cleanloc)
USER_ID=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root user_id)
HOST_NAME=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root hostname)

echo $USER_ID
echo $SOURCE_BASE_URL
arr_transfer=(`echo $TRANSFER_PATHS`);
arr_cleaning=(`echo $CLEANING_PATHS`);
arr_provenance=(`echo $PROVENANCE_PATHS`); 
 

echo ------ Transferring data to IRODS -------
for i in "${arr_transfer[@]}"
do
echo $USER_ID
echo $i

#echo globus-url-copy -cd -r -c -fast -cc 4 -stall-timeout 30 $i gsiftp://verce-irods.scai.fraunhofer.de/~/verce/$i
#globus-url-copy -cd -r -c -fast -cc 4 -stall-timeout 30 $i gsiftp://verce-irods.scai.fraunhofer.de/~/verce/home/$i

echo globus-url-copy -cd -r -c -fast -cc 4 -stall-timeout 30 $i gsiftp://verce-irods.scai.fraunhofer.de/~/verce/home/$USER_NAME/$RUN_ID
globus-url-copy -cd -r -c -fast -cc 4 -stall-timeout 30 $i gsiftp://verce-irods.scai.fraunhofer.de/~/verce/home/$USER_NAME/$RUN_ID

done


echo ------ Cleaning cluster -------
rm -rf /tmp/conda
rm /tmp/epos-conda.tar.bz2

for i in "${arr_cleaning[@]}"
do
echo rm -rf $i
rm -rf $i
done
