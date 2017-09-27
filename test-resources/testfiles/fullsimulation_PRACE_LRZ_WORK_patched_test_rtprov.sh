#!/bin/bash -l

unzip vercepes
PROV=$(cat control)
mkdir -p $HOME/$PROV
export DISPLAY=localhost:38.0
echo  -------------------------------------------------------
RUN_PATH=$(pwd)
export WORK_SHARED=$WORK/../di68gex/
echo "producing input files..."
python verce-hpc-pe/src/bulk_inputgen.py quakeml stations solverconf
echo "update provenance inputgen..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ provloc $RUN_PATH/provout_inputgen

echo  -------------------------------------------------------
echo "  decomposing mesh..."
python verce-hpc-pe/src/bulk_decompose.py jsonout_inputgen solverconf 
echo "update provenance decompose..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ provloc $RUN_PATH/provout_decompose
RUN_BASE=$(basename "$PWD")
SIMULATION_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen content path)
RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen metadata runId)
VELOCITY=$(python verce-hpc-pe/src/PEDataExtractor.py solverconf root velocity_model)
echo $RUN_ID
mkdir -p $HOME/$RUN_ID
echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $RUN_PATH/provout_inputgen $HOME/$PROV/provout_inputgen$RUN_ID$TIME
cp $RUN_PATH/provout_decompose $HOME/$PROV/provout_decompose$RUN_ID$TIME


arr=(`echo $SIMULATION_PATHS`);

COUNTER=0
for i in "${arr[@]}"
do
   :
pwd
mkdir -p $WORK/$i/../OUTPUT_FILES
mkdir -p $WORK/$i/../bin
mkdir -p $WORK/$i/../velocity

cp $WORK_SHARED/specfem/velocity_$VELOCITY/* $WORK/$i/../velocity
cp -r $RUN_PATH/$RUN_ID/OUTPUT_FILES/DATABASES_MPI $WORK/$i/../OUTPUT_FILES
cp -r $i/ $WORK/$i/../
echo $WORK/$i -------------------------------------------------------
cd $WORK/$i/../
# runs database generation and simulation
echo
echo "database generation and simulation..."
echo
EVENT_PATH=`pwd`
cd bin/
echo python $RUN_PATH/verce-hpc-pe/src/bulk_run_specfem_full.py $RUN_PATH/jsonout_inputgen $RUN_PATH/jsonout_decompose $RUN_PATH/solverconf poe $COUNTER
python $RUN_PATH/verce-hpc-pe/src/bulk_run_specfem_full.py $RUN_PATH/jsonout_inputgen $RUN_PATH/jsonout_decompose $RUN_PATH/solverconf poe $COUNTER 
echo "database generation and simulation... complete"
echo "see results in directory: OUTPUT_FILES/"
echo "update provenance simulation..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ provloc $EVENT_PATH/bin/provout_run_specfem
echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $EVENT_PATH/bin/provout_run_specfem $HOME/$PROV/provout_run_specfem$RUN_ID$TIME


echo "generation of seed and plot files..."
python $RUN_PATH/verce-hpc-pe/src/bulk_seed_vis.py jsonout_run_specfem $RUN_PATH/stations
echo "update provenance transform..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ provloc $EVENT_PATH/bin/provout_transformed
echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $EVENT_PATH/bin/provout_transformed $HOME/$PROV/provout_transformed$RUN_ID$TIME

let COUNTER=COUNTER+1

rm -rf $EVENT_PATH/OUTPUT_FILES/DATABASES_MPI

python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ dataloc $i/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ dataloc $EVENT_PATH/OUTPUT_FILES/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ dataloc $EVENT_PATH/DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ cleanloc $EVENT_PATH/

done
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ hostname supermuc.lrz.de
echo "--- terminates PROV job -- "
touch $HOME/$PROV/exitf
