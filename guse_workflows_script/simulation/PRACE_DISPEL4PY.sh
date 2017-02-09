#!/bin/bash -l
. /etc/profile
. /etc/profile.d/modules.sh
module load python/2.7.6 specfem3d/2.0.1 ffmpeg
module load  mpi4py/1.3.1
unzip vercepes
unzip data
PROV=$(cat control)
mkdir -p $HOME/$PROV
export PROV_PATH=$HOME/$PROV
export DISPLAY=localhost:38.0
echo  -------------------------------------------------------
export RUN_PATH=$(pwd)
export WORK_SHARED=$WORK/../di68gex/
export RUN_BASE=$(basename "$PWD")
export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)
export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
echo $RUN_ID

echo "--- file copy for runtime metadata messaging -- "
TIME=$(date +%s)

cd verce-hpc-pe/src
poe python -m dispel4py.worker_mpi test.hpc.gateway_graph -a graph -f $RUN_PATH/inputfile

#python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ cleanloc $EVENT_PATH/
#python $RUN_PATH/verce-hpc-pe/src/transferMetadataProducer.py $RUN_PATH/solverconf gsiftp://supermuc.lrz.de/ hostname supermuc.lrz.de
echo "--- terminates PROV job -- "
touch $PROV_PATH/exitf
