__author__ = 'Tristan Trouwen'

import os
from backend import app, api
from flask import render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
from flask_restful import Resource

api_version = app.config['API_VERSION']


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/', methods=['GET', 'POST'])
def hello_world():
    if request.method == 'GET':
        return render_template("index.html")

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
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            flash("Successfully uploaded!")
            return render_template("index.html")

@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.cache_control.max_age = 0
    return response

class Data(Resource):
    def get(self, data_name):
        return {
            "ok": data_name
        }


api.add_resource(Data, '/api/' + api_version + '/<data_name>')
