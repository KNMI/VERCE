#!/bin/bash -l

export USER=$(whoami)

echo "--------- profile LOAD" 1>&2
echo "--------- profile LOAD"
source /etc/profile
echo "--------- modules.sh LOAD" 1>&2
echo "--------- modules.sh LOAD" 
source /etc/profile.d/modules.sh

module load python/2.7.6
module load  mpi4py/1.3.1
module load globus

unzip vercepes
cat conf


export RUN_ID=$(python verce-hpc-pe/src/PEDataExtractor.py conf root runId)
RND=$RUN_ID

export RUN_PATH=$(pwd)

export USER_NAME=$(python verce-hpc-pe/src/PEDataExtractor.py conf root user_name)
export IRODS_URL=dir-irods.epcc.ed.ac.uk
export INPUT_FILE=$RUN_PATH/conf



mkdir -p $HOME/"provfold"$RND
mkdir -p $HOME/"modelfold"$RND/specfem/

export PROV_PATH=$HOME/"provfold"$RND
export MODEL_PATH=$HOME/"modelfold"$RND/specfem/

echo ---------------- mesh and model stage-in ------------------------
cd verce-hpc-pe/src/
python -m dispel4py.new.processor  multi test.hpc.forwardsim.stagein_graph -n 18 

cd $RUN_PATH

echo $RND > control
cat control