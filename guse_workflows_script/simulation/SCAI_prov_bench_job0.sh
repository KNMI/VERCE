#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load tools/python/2.7.9 intel/studio/2015.1.133 apps/specfem3d/2.0.2 tools/ffmpeg


unzip vercepes

PROV="provfold"$(cat control)
MODEL="modelfold"$(cat control)

mkdir -p $HOME/$PROV

export RUN_ID=$(cat control)

export DISPLAY=localhost:38.0
HOSTN=draco-ext.scai.fraunhofer.de
SOURCE_BASE=""
MYMPIEXEC_CMD_PAR_MOV="-np $(( $PBS_NUM_NODES * 4 )) -perhost 4 -f $PBS_NODEFILE"
echo $MYMPIEXEC_CMD_PAR_MOV
echo  -------------------------------------------------------
export RUN_PATH=$(pwd)
export PROV_PATH=$HOME/$PROV/

#$RUN_PATH/verce-hpc-pe/src/prov-files/

cp d4pywf $RUN_PATH/verce-hpc-pe/src/d4pywf.py

cd $RUN_PATH/verce-hpc-pe/src/
mpiexec.hydra python -m dispel4py.new.processor mpi d4pywf -f $RUN_PATH/input
#python -m dispel4py.new.processor multi  test.hpc.forwardsim.postproc_graph -n 50

echo "--- terminates PROV job -- "
touch $HOME/$PROV/exitf