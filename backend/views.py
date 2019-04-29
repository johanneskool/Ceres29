__author__ = 'Tristan Trouwen, Johannes Kool, Rick Luiken, Rink Pieters'

import os

from flask import render_template, request, redirect, flash, url_for
from werkzeug.utils import secure_filename

from backend import app, api, helper

api_version = app.config['API_VERSION']


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/', methods=['GET', 'POST'])
@app.route('/<string:data_name>', methods=['GET', 'POST'])
def index(data_name=None):
    if request.method == 'GET':
        # find available JSON files
        json_file_path = app.config['JSON_FOLDER']
        available_files = [{
            "url": url_for('static', filename=os.path.join(app.config['JSON_FOLDER_RELATIVE'], file)),
            "filename": file
        }
            for file in os.listdir(json_file_path) if os.path.isfile(os.path.join(json_file_path, file))
        ]

        return render_template("index.html", files_available=available_files, app=app, data=data_name)

    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if not allowed_file(file.filename):
            flash('Filetype not allowed')
            return redirect(request.url)
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            helper.parse(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            flash("Successfully uploaded!")
            return redirect(url_for('index'))


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.cache_control.max_age = 0
    return response
