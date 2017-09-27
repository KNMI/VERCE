from verce.processing import *

import socket
import traceback

import json
class specfemGlobeDirectorySetup(SeismoPreprocessingActivity):
    global create_directory_structure
    global copy_setup_files
    global create_links_to_existing_models

    def compute(self):
         create_directory_structure(self)
         copy_setup_files(self)
         create_links_to_existing_models(self)

    def create_directory_structure(self):
        stdoutdata = None
        stderrdata = None
        stdoutdata, stderrdata = commandChain([["{}".format(
            "mkdir -p $RUN_PATH/DATA $RUN_PATH/DATABASES_MPI $RUN_PATH/OUTPUT_FILES $RUN_PATH/bin",
        )]], os.environ.copy())

        self.addOutput(stdoutdata)
        self.error += str(stderrdata)


    def create_links_to_existing_models(self):
         stdoutdata = None
         stderrdata = None
         stdoutdata, stderrdata = commandChain(
             [["{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{};{}".format(
                 "cd $RUN_PATH/DATA/",
                 "ln -s $RUN_PATH/specfem/DATA/crust2.0",
                 "ln -s $RUN_PATH/specfem/DATA/s362ani",
                 "ln -s $RUN_PATH/specfem/DATA/QRFSI12",
                 "ln -s $RUN_PATH/specfem/DATA/topo_bathy",
                 "ln -s $RUN_PATH/specfem/DATA/s40rts",
                 "ln -s $RUN_PATH/specfem/DATA/old",
                 "ln -s $RUN_PATH/specfem/DATA/s20rts",
                 "ln -s $RUN_PATH/specfem/DATA/full_sphericalharmonic_model",
                 "ln -s $RUN_PATH/specfem/DATA/heterogen",
                 "ln -s $RUN_PATH/specfem/DATA/eucrust-07",
                 "ln -s $RUN_PATH/specfem/DATA/epcrust",
                 "ln -s $RUN_PATH/specfem/DATA/crustmap",
                 "ln -s $RUN_PATH/specfem/DATA/crust1.0",
                 "ln -s $RUN_PATH/specfem/DATA/cemRequest",
                 "ln -s $RUN_PATH/specfem/DATA/Zhao_JP_model",
                 "ln -s $RUN_PATH/specfem/DATA/Simons_model",
                 "ln -s $RUN_PATH/specfem/DATA/PPM",
                 "ln -s $RUN_PATH/specfem/DATA/Montagner_model",
                 "ln -s $RUN_PATH/specfem/DATA/Lebedev_sea99",
                 "cd .."
             )]], os.environ.copy())

         self.addOutput(stdoutdata)
         self.error += str(stderrdata)



    def copy_setup_files(self):
         stdoutdata = None
         stderrdata = None
         stdoutdata, stderrdata = commandChain([["{};{};{}".format(
             "cp $RUN_PATH/$RUN_ID/$RUN_ID\"_0\"/DATA/* $RUN_PATH/DATA",
             "cp $RUN_PATH/specfem/bin/* $RUN_PATH/bin/",
             "cp $RUN_PATH/specfem/OUTPUT_FILES/values_from_mesher.h $RUN_PATH/OUTPUT_FILES"
         )]], os.environ.copy())

         self.addOutput(stdoutdata)
         self.error += str(stderrdata)


if __name__ == "__main__":
    proc=specfemGlobeDirectorySetup("specfemGlobeDirectorySetup")
    proc.process();



