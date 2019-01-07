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
unzip data

export USER=$(whoami)
export RUN_PATH=$(pwd)
export INPUT_FILE=$RUN_PATH/conf
echo $INPUT_FILE

export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)

export STAGED_DATA=$RUN_PATH/$RUN_ID
mkdir -p $STAGED_DATA/output
mkdir -p $STAGED_DATA/output-images
mkdir -p $STAGED_DATA/output-intermediate
mkdir -p $STAGED_DATA/stationxml


export PROV_PATH=$RUN_PATH/"provfold"$RUN_ID
mkdir -p $PROV_PATH
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export IRODS_URL=verce-irods.scai.fraunhofer.de

echo ---------------- data stage-in ------------------------
cd verce-hpc-pe/src/
python -m dispel4py.new.processor multi test.misfit_preprocessing.stagein_graph -n 18 -f $INPUT_FILE

cd $RUN_PATH

echo $RUN_ID > control

cat control

########################### PROCESSING ################################# 

export DISPLAY=localhost:38.0
echo  -------------------------------------------------------
 
export RUN_BASE=$(basename "$PWD") 
SOURCE_BASE=""
export NPROC=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root nproc)
MSEED=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root mseed_path)
XML=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/conf root stationxml_path)
HOSTN=draco-ext.scai.fraunhofer.de
SOURCE_BASE=""

XML=$RUN_PATH/$XML
MSEED=$RUN_PATH/$MSEED
export MISFIT_PREP_CONFIG=$RUN_PATH/pipelines.json

echo $RUN_ID
echo $XML
echo $MSEED

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)

cd verce-hpc-pe/src 

######################## PROV ##################################
PROV_TARGET_BASE_URL=gsiftp://verce-irods.scai.fraunhofer.de/verce/home/public/verce/
SOURCE_BASE_URL=gsiftp://lxlogin1.lrz.de
DATA_TARGET_BASE=gsiftp://verce-irods.scai.fraunhofer.de/~/verce/

python dirmonitor-dataprov.py $PROV_PATH $SOURCE_BASE_URL $PROV_TARGET_BASE_URL $DATA_TARGET_BASE &

################################################################

python -m dispel4py.new.processor multi test.misfit_preprocessing.create_misfit_prep -n $NPROC -f $RUN_PATH/conf

python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output-images/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/output-intermediate/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ dataloc $STAGED_DATA/stationxml/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $PROV_PATH
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/conf $SOURCE_BASE/ cleanloc $STAGED_DATA/

echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf

###################### STAGEOUT ########################################

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
