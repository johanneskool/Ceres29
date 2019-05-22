__author__ = 'Tristan Trouwen, Rick Luiken, Rink Pieters'

import os, shutil
from os import environ

from flask import Flask
from flask_compress import Compress
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
Compress(app)

# import configuration
if environ.get('FLASK_ENV', '').lower() == 'production':
    app.config.from_object('backend_configuration.ProductionConfig')

else:  # default to development configuration
    app.config.from_object('backend_configuration.DevelopmentConfig')

# Creating uploads folder if it does not yet exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Creating json folder if it does not yet exist
if not os.path.exists(app.config['JSON_FOLDER']):
    os.makedirs(app.config['JSON_FOLDER'])

# initialize db
if not os.path.isfile(app.config['SQLALCHEMY_DATABASE_PATH']):
    #if there was an update clean all existing shit except for a possible production db. Just to be safe
    for file in os.listdir(os.path.dirname(app.config['SQLALCHEMY_DATABASE_PATH'])):
        if file.endswith(".db") and file != "prod.db":
            os.remove(os.path.join(os.path.dirname(app.config['SQLALCHEMY_DATABASE_PATH']), file))

    for dirs in os.walk(app.config['JSON_FOLDER']):
        if dirs[0] != app.config['JSON_FOLDER']: shutil.rmtree(dirs[0])

    db = SQLAlchemy(app)
    from backend.orm import models

    db.create_all()  # it conditionally creates tables, so it is allowed to always call it
    new_file = models.File("Quick_Test_10x10_sparse.csv", name="Quick Test (10x10; sparse)")
    db.session.add(new_file)
    db.session.commit()
else:
    db = SQLAlchemy(app)
    from backend.orm import models

import backend.views
