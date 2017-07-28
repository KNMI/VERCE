 #!/bin/bash
export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

#load required modules
module load tools/python/2.7.9 openmpi/gcc/2.0.1-gcc-5.4.0 tools/ffmpeg libs/blas/openblas/0.2.19-gcc-5.4.0-sandy

unzip vercepes
unzip specfem
########################## INPUT PREPARATION ############################################
echo  -------------------------------------------------------
echo "Input Preparation"
echo  -------------------------------------------------------

echo "producing input files..."
python verce-hpc-pe/src/bulk_inputgen.py quakeml stations solverconf
export RUN_PATH=$(pwd)
RUN_BASE=$(basename "$PWD")
SIMULATION_PATHS=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen content path)
export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py jsonout_inputgen metadata runId)
VELOCITY=$(python verce-hpc-pe/src/PEDataExtractor.py solverconf root velocity_model)
echo $RUN_ID
mkdir -p $HOME/$RUN_ID
export WORK=$HOME/$RUN_ID
PROV="provfold"$(cat control)
MODEL="modelfold"$(cat control)
mkdir -p $HOME/$PROV
export PROV_PATH=$HOME/$PROV
export DISPLAY=localhost:38.0
HOSTN=draco-ext.scai.fraunhofer.de
SOURCE_BASE=""
export MODEL_PATH=$HOME/$MODEL

echo "update provenance inputgen..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ provloc $RUN_PATH/provout_inputgen

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)
cp $RUN_PATH/provout_inputgen $PROV_PATH/provout_inputgen$RUN_ID$TIME

############################### COMPILATION  ##################################################
echo  -------------------------------------------------------
echo "Specfem3d_globe Compilation"
echo  -------------------------------------------------------

echo "configuration and compilation of specfem3d_globe"
INPUTS=$RUN_PATH/$RUN_ID/$RUN_ID\"_0\"/DATA/

compilationStartTime=$(date "+%d/%m/%y %H:%M:%S")
echo "Compilation Start Time "$compilationStartTime

# configure and compile specfem3d_globe source code
python $RUN_PATH/verce-hpc-pe/src/run_specfemGlobe_compile.py $RUN_PATH/jsonout_inputgen $INPUTS/Par_file $INPUTS/CMTSOLUTION $INPUTS/STATIONS GNU

compilationEndTime=$(date "+%d/%m/%y %H:%M:%S")
echo "Compilation End Time "$compilationEndTime

# set up a directory structure to run the mesher and solver from the working directory 
python $RUN_PATH/verce-hpc-pe/src/run_specfemGlobe_setup.py $RUN_PATH/jsonout_inputgen

############################### MESH GENERATION  ##################################################
echo  -------------------------------------------------------
echo "Mesh Generation"
echo  -------------------------------------------------------

mesherStartTime=$(date "+%d/%m/%y %H:%M:%S")
echo "Mesh Generation Start Time "$mesherStartTime

python $RUN_PATH/verce-hpc-pe/src/run_specfemGlobeMesher.py $RUN_PATH/jsonout_inputgen $RUN_PATH/solverconf mpirun
#python $RUN_PATH/verce-hpc-pe/src/run_specfemGlobeMesher.py $RUN_PATH/jsonout_inputgen $RUN_PATH/solverconf mpiexec.hydra

mesherEndTime=$(date "+%d/%m/%y %H:%M:%S")
echo "Mesh Generation End Time "$mesherEndTime 

# For SpecfemGlobe, the value of DT is not included in the Par_file, so here it's read from output_mesher.txt and saved as an OS environment variable
export DT=`grep "the time step of the solver will be DT" $RUN_PATH/OUTPUT_FILES/output_mesher.txt | cut -d = -f 2 `

############################### SIMULATIONS cycles through events  ######################
echo  -------------------------------------------------------
echo "Solver Generation..."
MPIRUN_CMD_PAR_MOV="-np $(( $PBS_NUM_NODES * 4 ))"
echo $MPIRUN_CMD_PAR_MOV
echo  -------------------------------------------------------

COUNTER=0
arr=(`echo $SIMULATION_PATHS`);

for i in "${arr[@]}"
do
   :
pwd
############################ PREPARE SIMULATION PARTITION in WORK ######################
export JSON_OUT=$WORK/$i/..
mkdir -p $WORK/$i/../
cp -r $RUN_PATH/DATABASES_MPI $WORK/$i/../
cp -r $RUN_PATH/OUTPUT_FILES/  $WORK/$i/../ 
cp -r $RUN_PATH/DATA $WORK/$i/../
cp -r $RUN_PATH/bin $WORK/$i/../
cp -r $i/ $WORK/$i/../

# create STATIONS_FILTERED file for compatibility with the cartesian output for postproc_graph_kml
cp $WORK/$i/STATIONS $WORK/$i/STATIONS_FILTERED 
echo $WORK/$i -------------------------------------------------------
cd $WORK/$i/../

solverStartTime=$(date "+%d/%m/%y %H:%M:%S")
echo "Solver Start Time "$solverStartTime

python $RUN_PATH/verce-hpc-pe/src/bulk_run_specfemGlobe_movie.py $RUN_PATH/jsonout_inputgen $RUN_PATH/jsonout_mesher $RUN_PATH/solverconf mpirun $COUNTER "$MPIRUN_CMD_PAR_MOV"  

solverEndTime=$(date "+%d/%m/%y %H:%M:%S")
echo "Solver End Time "$solverEndTime

echo "database generation and simulation... complete"
echo "see results in directory: OUTPUT_FILES/" 

export EVENT_PATH=$(pwd)
echo "update provenance simulation..."
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ provloc $EVENT_PATH/provout_run_specfem
echo "--- file copy for runtime metadata messaging -- " 
#######################    POSTPROCESSING    ################################## 
echo  -------------------------------------------------------
echo "Generation of Seed and Plot files..."
echo  -------------------------------------------------------

export INPUT_FILE=$JSON_OUT/jsonout_run_specfem
export SOLVER_NAME=$(python $RUN_PATH/verce-hpc-pe/src/PEDataExtractor.py $RUN_PATH/solverconf root solver)
cd $RUN_PATH/verce-hpc-pe/src/

python -m dispel4py.new.processor multi test.hpc.forwardsim.postproc_graph -n 50 

echo "generation of kmz file..."

# append the value of DT to the Par_file to maintain compatibility with the cartesian output for kmlGenerator_INGV
declare -r TAB="`echo -e "\t"`"
echo "#DT value obtained from output_mesher.txt\n" >> $EVENT_PATH/DATA/Par_file
echo "DT ${TAB}${TAB}${TAB}${TAB}=" $DT >> $EVENT_PATH/DATA/Par_file

python -m dispel4py.new.processor simple test.hpc.forwardsim.postproc_graph_kml

let COUNTER=COUNTER+1
############################# HOUSE KEEPING #################################### 
echo  -------------------------------------------------------
echo "House Keeping"
echo  -------------------------------------------------------

echo "---Set Transfer and Cleanup folders ---"

python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $i/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $EVENT_PATH/OUTPUT_FILES/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $EVENT_PATH/DATA/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ dataloc $HOME/$MODEL/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $i/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $EVENT_PATH/
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $HOME/$PROV
python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ cleanloc $HOME/$MODEL
done

python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf $SOURCE_BASE/ hostname $HOSTN

echo "--- Cleanup of model folder and other generated directories ---" 
rm -rf $RUN_PATH/specfem 
rm -rf $RUN_PATH/DATABASES_MPI
rm -rf $RUN_PATH/DATA
rm -rf $RUN_PATH/verce-hpc-pe
rm -rf $RUN_PATH/OUTPUT_FILES
rm -rf $RUN_PATH/bin

############################# END OF SIMULATIONS #################################### 
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
