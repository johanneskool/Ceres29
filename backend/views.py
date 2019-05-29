__author__ = 'Tristan Trouwen, Johannes Kool, Rick Luiken, Rink Pieters'

import os

from flask import render_template, request, redirect, flash, url_for, send_from_directory, abort

from backend import app
from backend.functions_file import get_available_files, handle_file_upload
from backend.orm.models import File


#Index page
@app.route('/', methods=['GET', 'POST'])
def index():
    data_id = request.args.get('data')
    if request.method == 'GET':
        if app.config['DEVELOPMENT'] == True: flash(
            'Flask is currently running development mode. This is an example to show how we handle messages in our layout. Possible types for flash are info, warning, danger, success, and Flask\'s default category message is also allowed. HTML is no longer allowed in the messages for safety reasons',
            'info')
        return render_template("index.html", data=data_id, title="Home")

    if request.method == 'POST':
        return handle_file_upload(request)

#Choose file page
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    data_id = request.args.get('data')
    if request.method == 'GET':
        return render_template("upload.html", files_available=get_available_files(), data=data_id,
                               title="Upload a file")

    if request.method == 'POST':
        return handle_file_upload(request)

#Visualisation page
@app.route('/vis', methods=['GET'])
@app.route('/vis/<int:data_id>', methods=['GET'])
def vis(data_id=None):
    if (data_id is None) and (request.args.get('data') is None):
        flash('Please select a file before going to the visualisation')
        return redirect(url_for('upload'))
    elif data_id is None:
        data_id = request.args.get('data')
    data_name = File.query.get(data_id).name
    if request.method == 'GET':
        return render_template("vis.html", files_available=get_available_files(), data=data_name, title=data_name,
                               data_id=data_id)

#Get data endpoint
@app.route('/data/<int:id>', methods=['GET'])
def data(id):
    clustertype = request.args.get('type')
    file = File.query.get(id)
    #If unknown type do a 400 Bad Request; type does not exist
    if clustertype not in ['fiedler', 'pagerank', 'cluster', 'lexicographic', 'cluster_graph', 'default']: abort(400)

    return send_from_directory(os.path.join(app.config["JSON_FOLDER"], file.hash), clustertype + ".json")

#Block some requests to static
@app.before_request
def a_little_bit_of_security_is_allowed():
    if '/static/uploads' in request.path \
            and '/static/uploads/Quick_Test_10x10_sparse.csv' not in request.path:
        abort(403)
    if '/static/json' in request.path:
        abort(403)


# Endpoint for different visualisations
@app.route('/subgraphs/<int:id>', methods=['GET'])
def subgraph(id):
    trace = [int(i) for i in request.args.get('trace').split(',')]
    file = File.query.get(id)
    network = file.get_pickle()
    for i in trace:
        network = network.get_subnetwork(i)
    return network.json_string
