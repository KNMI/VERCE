#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
An attempt to create a generic input file generator for different waveform
solvers.

:copyright:
    Lion Krischer (krischer@geophysik.uni-muenchen.de), 2013
:license:
    GNU General Public License, Version 3
    (http://www.gnu.org/copyleft/gpl.html)
"""

import copy
import glob
import inspect
import json
from obspy.core import AttribDict
import os

class InputFileGenerator(object):
    """
    """

    def __init__(self):
        self.config = AttribDict()

    def add_configuration(self, config):
        """
        Adds all items in config to the configuration.

        Useful for bulk configuration from external sources.

        :type config: dict or str
        :param config: Contains the new configuration items. Can be either a
            dictionary or a JSON document.
        """
        try:
            doc = json.loads(config)
        except:
            pass
        else:
            if isinstance(doc, dict):
                config = doc

        if not isinstance(config, dict):
            msg = "config must be either a dict or a single JSON document"
            raise ValueError(msg)

        self.config.__dict__.update(config)


    def write_par_file(self, format):
        """
        Write an input file with the specified format.

        :type format: string
        :param format: The requested format of the generated input files. Get a
            list of available format with a call to
            self.get_available_formats().
        """
        # Check if the corresponding write function exists.
        self.__find_write_scripts()
        if format not in list(self.__write_functions.keys()):
            msg = "Format %s not found. Available formats: %s." % (
                format, list(self.__write_functions.keys()))
            raise ValueError(msg)



        # Set the correct write function.
        writer = self.__write_functions[format]
        config = copy.deepcopy(self.config)

        # Check that all required configuration values exist and convert to
        # the correct type.
        for config_name, value in writer["required_config"].iteritems():
            convert_fct, _ = value
            if config_name not in config:
                msg = ("The input file generator for '%s' requires the "
                       "configuration item '%s'.") % (format, config_name)
                raise ValueError(msg)
            try:
                config[config_name] = convert_fct(config[config_name])
            except:
                msg = ("The configuration value '%s' could not be converted "
                       "to '%s'") % (config_name, str(convert_fct))
                raise ValueError(msg)

        # Now set the optional and default parameters.
        for config_name, value in writer["default_config"].iteritems():
            default_value, convert_fct, _ = value
            if config_name in config:
                default_value = config[config_name]
            try:
                config[config_name] = convert_fct(default_value)
            except:
                msg = ("The configuration value '%s' could not be converted "
                       "to '%s'") % (config_name, str(convert_fct))
                raise ValueError(msg)

        # Call the write function. The write function is supposed to raise the
        # appropriate error in case anything is amiss.
        par_file = writer["function"](config=config)

        return par_file

    def __find_write_scripts(self):
        """
        Helper method to find all available writer scripts. A write script is
        defined as being in the folder "writer" and having a name of the form
        "write_XXX.py". It furthermore needs to have a write() method.
        """
        # Most generic way to get the 'backends' subdirectory.
        write_dir = os.path.join(os.path.dirname(inspect.getfile(
            inspect.currentframe())), "backends")
        files = glob.glob(os.path.join(write_dir, "write_*.py"))
        import_names = [os.path.splitext(os.path.basename(_i))[0]
                        for _i in files]
        write_functions = {}
        for name in import_names:
            module_name = "backends.%s" % name
            try:
                module = __import__(
                    module_name, globals(), locals(),
                    ["write", "REQUIRED_CONFIGURATION",
                     "DEFAULT_CONFIGURATION"], -1)
                function = module.write
                required_config = module.REQUIRED_CONFIGURATION
                default_config = module.DEFAULT_CONFIGURATION
            except Exception as e:
                print("Warning: Could not import %s." % module_name)
                print("\t%s: %s" % (e.__class__.__name__, str(e)))
                continue
            if not hasattr(function, "__call__"):
                msg = "Warning: write in %s is not a function." % module_name
                print(msg)
                continue
            # Append the function and some more parameters.
            write_functions[name[6:]] = {
                "function": function,
                "required_config": required_config,
                "default_config": default_config}

        self.__write_functions = write_functions

    def get_available_formats(self):
        """
        Get a list of all available formats.
        """
        self.__find_write_scripts()
        return list(self.__write_functions.keys())

    def get_config_params(self, solver_name):
        self.__find_write_scripts()
        if solver_name not in self.__write_functions.keys():
            msg = "Solver '%s' not found." % solver_name
            raise ValueError(msg)
        writer = self.__write_functions[solver_name]

        return writer["required_config"], writer["default_config"]
