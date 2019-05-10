__author__ = 'Tristan Trouwen, Johannes Kool, Rick Luiken, Rink Pieters'

import os

from flask import render_template, request, redirect, flash, url_for, send_from_directory
from werkzeug.utils import secure_filename

from backend import app, db
from backend.orm.models import File


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def get_available_files():
    return File.query.all()


def handle_file_upload(request_upload):
    # check if the post request has the file part
    if 'file' not in request_upload.files:
        flash('No file part')
        return redirect(request_upload.url)
    file = request_upload.files['file']
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
        flash('No selected file')
        return redirect(request_upload.url)
    if not allowed_file(file.filename):
        flash('Filetype not allowed')
        return redirect(request_upload.url)
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # process file into different forms and track this in db
        new_file = File(filename, name=filename.split('.csv')[0])
        db.session.add(new_file)
        db.session.commit()

        flash("Successfully uploaded!")
        return redirect(url_for('index'))


@app.route('/', methods=['GET', 'POST'])
def index():
    data_id = request.args.get('data')
    if request.method == 'GET':
        return render_template("index.html", files_available=get_available_files(), data=data_id, title="Home")

    if request.method == 'POST':
        return handle_file_upload(request)


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    data_id = request.args.get('data')
    if request.method == 'GET':
        return render_template("upload.html", files_available=get_available_files(), data=data_id, title="Upload a file")

    if request.method == 'POST':
        return handle_file_upload(request)


@app.route('/vis', methods=['GET'])
def vis():
    data_id = request.args.get('data')
    data_name = File.query.get(data_id).name
    if request.method == 'GET':
        return render_template("vis.html", files_available=get_available_files(), data=data_name, title=data_name)


@app.route('/data/<int:id>', methods=['GET'])
def data(id):
    type = request.args.get('type')
    file = File.query.get(id)
    if type == 'fiedler':
        return send_from_directory(os.path.join(app.config["JSON_FOLDER"], file.hash), "fiedler.json") # clean up later but good for now
    else:
        return send_from_directory(os.path.join(app.config["JSON_FOLDER"], file.hash), "default.json") # clean up later but good for now


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.cache_control.max_age = 0
    return response
