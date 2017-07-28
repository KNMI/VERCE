#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load tools/python/2.7.9 intel/studio/2017.1.043 apps/specfem3d/2017-05-16-60733886 tools/ffmpeg
#module load tools/python/2.7.9 intel/studio/2015.1.133 apps/specfem3d/2.0.2 tools/ffmpeg


unzip vercepes

PROV="provfold"$(cat control)
MODEL="modelfold"$(cat control)

mkdir -p $HOME/$PROV
export PROV_PATH=$HOME/$PROV
export DISPLAY=localhost:38.0
HOSTN=draco-ext.scai.fraunhofer.de
SOURCE_BASE=""
#MYMPIEXEC_CMD_PAR_MOV="-np $(( $PBS_NUM_NODES * 4 )) -perhost 4 -f $PBS_NODEFILE"
#echo $MYMPIEXEC_CMD_PAR_MOV
MPIRUN_CMD_PAR_MOV="-np $(( $PBS_NUM_NODES * 4 ))"
echo $MPIRUN_CMD_PAR_MOV
echo  -------------------------------------------------------
export RUN_PATH=$(pwd)


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
export WORK=$HOME/$RUN_ID

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
echo $EVENT_PATH
#cd bin/
python $RUN_PATH/verce-hpc-pe/src/bulk_run_specfem_movie.py $RUN_PATH/jsonout_inputgen $RUN_PATH/jsonout_decompose $RUN_PATH/solverconf mpirun $COUNTER "$MPIRUN_CMD_PAR_MOV" 
#python $RUN_PATH/verce-hpc-pe/src/bulk_run_specfem_movie.py $RUN_PATH/jsonout_inputgen $RUN_PATH/jsonout_decompose $RUN_PATH/solverconf mpiexec.hydra $COUNTER "$MYMPIEXEC_CMD_PAR_MOV" 
echo "database generation and simulation... complete"
echo "see results in directory: OUTPUT_FILES/"
echo "update provenance simulation..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ provloc $EVENT_PATH/provout_run_specfem
echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
#cp $EVENT_PATH/provout_run_specfem $PROV_PATH/provout_run_specfem$RUN_ID$TIME


echo "generation of seed and plot files..."
cd $RUN_PATH/verce-hpc-pe/src/
export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
#mpiexec.hydra python -m dispel4py.new.processor mpi  test.hpc.forwardsim.postproc_graph
python -m dispel4py.new.processor multi  test.hpc.forwardsim.postproc_graph -n 50

echo "generation of kmz file..."
python -m dispel4py.new.processor simple test.hpc.forwardsim.postproc_graph_kml

let COUNTER=COUNTER+1

rm -rf $EVENT_PATH/OUTPUT_FILES/DATABASES_MPI

echo "--- Cleanup of modelfold subdirectories ---"
chmod -R u+w $HOME/$MODEL
rm -R -- $HOME/$MODEL/specfem/*/

python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $i/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $EVENT_PATH/OUTPUT_FILES/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $EVENT_PATH/DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $HOME/$MODEL/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $EVENT_PATH/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $HOME/$PROV
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $HOME/$MODEL
done
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ hostname $HOSTN
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
