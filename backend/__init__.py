__author__ = 'Tristan Trouwen, Rick Luiken, Rink Pieters'

import os
from os import environ

from flask import Flask
from flask_compress import Compress
from flask_sqlalchemy import SQLAlchemy
from shutil import copyfile

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
db = SQLAlchemy(app)
from backend.orm import models
db.create_all() #it conditionally creates tables, so it is allowed to always call it

import backend.views
