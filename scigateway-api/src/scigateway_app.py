#!/usr/bin/env python
# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('Agg')
import json
from flask import request, send_file, Flask
from scigateway_services import mtensor, solver_par_files
from wfs_input_generator.input_file_generator import InputFileGenerator


DATA_PATH = "./data/"
ROOT_URL = "/"
app = Flask("scigateway-api")
mtstore = mtensor.MtStore(DATA_PATH)
solvergen = solver_par_files.SolverParfile(DATA_PATH)


def str_to_bool_pass(value):
    if value == "true":
        return True
    if value == "false":
        return False
    return value


@app.route(ROOT_URL)
def start():
    return "VERCE scigateway-api service."


@app.route(ROOT_URL + "version")
def version():
    """
    Return the version string of the webservice.
    """
    return "0.0.3"


@app.route(ROOT_URL + "mt/components-image")
def components_image():
    mrr = request.args['mrr']
    mtt = request.args['mtt']
    mpp = request.args['mpp']
    mrt = request.args['mrt']
    mrp = request.args['mrp']
    mtp = request.args['mtp']
    filename = mtstore.produceImage(id, mrr=float(mrr), mtt=float(mtt), mpp=float(mpp), mrt=float(mrt),
                                        mrp=float(mrp), mtp=float(mtp))
    return send_file(filename, mimetype='image/png')


@app.route(ROOT_URL + "mt/nodal-plane-image")
def nodal_plane_image():
    strike = request.args['strike']
    dip = request.args['dip']
    rake = request.args['rake']
    filename = mtstore.produceImage(strike=float(strike), dip=float(dip), rake=float(rake))
    return send_file(filename, mimetype='image/png')


@app.route(ROOT_URL + "solver/par-file/<solver>", methods=['POST'])
def solver_par_file(solver):
    solver_conf = json.loads(str(request.form["jsondata"]))
    gen = InputFileGenerator()
    fields = solver_conf["fields"]
    for x in fields:
        gen.add_configuration({x["name"]: str_to_bool_pass(x["value"])})
    par_file = gen.write_par_file(format=solver.upper())
    return par_file, 200, {'Content-Type': 'application/octet-stream'}


if __name__ == "__main__":
    app.run(debug=True)