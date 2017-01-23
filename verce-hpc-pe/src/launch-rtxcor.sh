ulimit -n 5200

export PROV_PATH="./prov-files"
export RUN_ID=$(date | md5 | awk '{print $1}')

#mpiexec.hydra python -m dispel4py.new.processor mpi test.rtxcorr.rtxcorr3 -f $RUN_PATH/input
python -m dispel4py.new.processor multi test.rtxcorr.rtxcorr3 -n 174 -f xcrr-input
#python -m dispel4py.new.processor simple test.rtxcorr.rtxcor_rays -f xcrr-input
