#!/bin/bash -l
. /etc/profile
. /etc/profile.d/modules.sh
module load python/2.7.6 specfem3d/2.0.2 ffmpeg
module load  mpi4py/1.3.1
unzip vercepes

PROV="provfold"$(cat control)
MODEL="modelfold"$(cat control)

mkdir -p $HOME/$PROV
export PROV_PATH=$HOME/$PROV
export DISPLAY=localhost:38.0

echo  -------------------------------------------------------
export RUN_PATH=$(pwd)


#WORK_SHARED should be renamed to MODEL_PATH
export WORK_SHARED=$HOME/$MODEL

echo "producing input files..."
python verce-hpc-pe/src/bulk_inputgen.py quakeml stations solverconf


echo "update provenance inputgen..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ provloc $RUN_PATH/provout_inputgen

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $RUN_PATH/provout_inputgen $PROV_PATH/provout_inputgen$RUN_ID$TIME


SIMULATION_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen content path)
RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen metadata runId)
echo $RUN_ID
mkdir -p $HOME/$RUN_ID
export WORK=$WORK/$RUN_ID

 

arr=(`echo $SIMULATION_PATHS`);

COUNTER=0
for i in "${arr[@]}"
do
   :
pwd
mkdir -p $WORK/$i/../OUTPUT_FILES
cp -r $i/ $WORK/$i/../
echo $WORK/$i -------------------------------------------------------
cd $WORK/$i/../
export EVENT_PATH=`pwd`

python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ dataloc $EVENT_PATH/DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ cleanloc $EVENT_PATH/

done


python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ hostname supermuc.lrz.de
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
