#global imports
import os
from backend import app, db

#local imports
from backend.orm.models import File
from werkzeug.utils import secure_filename
from flask import flash, redirect, request, url_for


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_available_files():
    return File.query.order_by(File.timestamp.desc()).limit(
        20).all()  # newest file on top; max 20 files. Possibly add some default files always in a separate category

def handle_file_upload(request_upload):
    # check if the post request has the file part
    if 'file' not in request_upload.files:  # if we encounter this the input for the file isn't shown or disabled; that should not happen
        flash('The webserver expected a file upload, but did not receive a file or files. Please select a file from your computer and click the upload button',
            'danger')
        return redirect(request_upload.url)
    file = request_upload.files['file']
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
        flash('Please select a file from your computer and click the upload button', 'danger')
        return redirect(request_upload.url)
    if not allowed_file(file.filename):
        flash('The file you uploaded is a .' + file.filename.rsplit('.', 1)[
            1].lower() + ' file. Please select one of the following: .' + ', .'.join(app.config['ALLOWED_EXTENSIONS']), 'danger')
        return redirect(request_upload.url)
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # process file into different forms and track this in db
        new_file = File(filename, name=filename.split('.csv')[0].replace('_', ' '))
        db.session.add(new_file)
        db.session.commit()

        flash(new_file.filename + " successfully uploaded as " + new_file.name + ", showing it below", 'success')
        return redirect(url_for('vis', data_id=str(new_file.id)))
