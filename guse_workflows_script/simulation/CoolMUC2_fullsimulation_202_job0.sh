#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load python/2.7.6 specfem3d/2.0.2 ffmpeg
module load  mpi4py/1.3.1 obspy
#module load mpi_diagnostics

module list

unzip vercepes

PROV="provfold"$(cat control)
MODEL="modelfold"$(cat control)

mkdir -p $HOME/$PROV
export PROV_PATH=$HOME/$PROV
export DISPLAY=localhost:38.0
HOSTN=lxlogin5.lrz.de
SOURCE_BASE=gsiftp://$HOSTN

echo  -------------------------------------------------------
export RUN_PATH=$(pwd)

export MYMPIEXEC_CMD="mpiexec"

#WORK_SHARED should be renamed to MODEL_PATH
export WORK_SHARED=$HOME/$MODEL

echo "producing input files..."
python verce-hpc-pe/src/bulk_inputgen.py quakeml stations solverconf


echo "update provenance inputgen..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ provloc $RUN_PATH/provout_inputgen

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $RUN_PATH/provout_inputgen $PROV_PATH/provout_inputgen$RUN_ID$TIME

echo  -------------------------------------------------------
echo "  decomposing mesh..."
python verce-hpc-pe/src/bulk_decompose.py jsonout_inputgen solverconf 
echo "update provenance decompose..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ provloc $RUN_PATH/provout_decompose


RUN_BASE=$(basename "$PWD")
SIMULATION_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen content path)
RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen metadata runId)
VELOCITY=$(python verce-hpc-pe/src/PEDataExtractor.py solverconf root velocity_model)
echo $RUN_ID
mkdir -p $HOME/$RUN_ID
export WORK=$WORK/$RUN_ID

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $RUN_PATH/provout_decompose $PROV_PATH/provout_decompose$RUN_ID$TIME


arr=(`echo $SIMULATION_PATHS`);

COUNTER=0
for i in "${arr[@]}"
do
   :
pwd
mkdir -p $WORK/$i/../OUTPUT_FILES
#mkdir -p $WORK/$i/../bin
mkdir -p $WORK/$i/../velocity
export JSON_OUT=$WORK/$i/../
cp $WORK_SHARED/specfem/velocity_$VELOCITY/* $WORK/$i/../velocity
cp -r $RUN_PATH/$RUN_ID/OUTPUT_FILES/DATABASES_MPI $WORK/$i/../OUTPUT_FILES
cp -r $i/ $WORK/$i/../
echo $WORK/$i -------------------------------------------------------
cd $WORK/$i/../
# runs database generation and simulation
echo
echo "database generation and simulation..."
echo
export EVENT_PATH=`pwd`
#cd bin/
python $RUN_PATH/verce-hpc-pe/src/bulk_run_specfem_movie.py $RUN_PATH/jsonout_inputgen $RUN_PATH/jsonout_decompose $RUN_PATH/solverconf $MYMPIEXEC_CMD $COUNTER 
echo "database generation and simulation... complete"
echo "see results in directory: OUTPUT_FILES/"
echo "update provenance simulation..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ provloc $EVENT_PATH/provout_run_specfem
echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $EVENT_PATH/provout_run_specfem $PROV_PATH/provout_run_specfem$RUN_ID$TIME


echo "generation of seed and plot files..."
cd $RUN_PATH/verce-hpc-pe/src/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
$MYMPIEXEC_CMD python -m dispel4py.new.processor mpi test.hpc.forwardsim.postproc_graph
#python -m dispel4py.new.processor -t multi -n 50  test.hpc.forwardsim.postproc_graph

echo "generation of kmz file..."
python -m dispel4py.new.processor simple test.hpc.forwardsim.postproc_graph_kml

let COUNTER=COUNTER+1

rm -rf $EVENT_PATH/OUTPUT_FILES/DATABASES_MPI

chmod -R u+w $HOME/$MODEL
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $i/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $EVENT_PATH/OUTPUT_FILES/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $EVENT_PATH/DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $HOME/$MODEL
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $EVENT_PATH/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $HOME/$PROV
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $HOME/$MODEL
done
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ hostname $HOSTN
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
