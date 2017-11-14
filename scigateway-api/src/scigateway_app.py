#!/usr/bin/env python
# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('Agg')
import json
from flask import request, send_file, Flask
from scigateway_services import mtensor
from scigateway_services.wfs_input_generator.input_file_generator import InputFileGenerator
from pymongo import MongoClient
import sys

DATA_PATH = "../mt/"
ROOT_URL = "/"
app = Flask("scigateway-api")
mtstore = mtensor.MtStore(DATA_PATH)
uri=sys.argv[1]
db=MongoClient(uri,maxPoolSize=100)["verce-prov"]

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

@app.route(ROOT_URL + "solver/<solverId>")
def solver_config(solverId):
    solver = db['solver']
    try:
        solver = solver.find_one({"_id": solverId})
        if (solver != None):
            solver.update({"success": True})
            userId = request.args["userId"][0] if "userId" in request.args else False

            def userFilter(item):
                return (not "users" in item) or (userId and userId in item["users"])

            def velmodFilter(item):
                item["velmod"] = filter(userFilter, item["velmod"])
                return item

            solver["meshes"] = map(velmodFilter, filter(userFilter, solver["meshes"]))
            return json.dumps(solver), 200, {'Content-type': 'application/json'}
        else:
            return {"success": False, "error": "Solver " + solverId + " not Found"}

    except Exception, e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    app.run(debug=True)