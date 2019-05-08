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

# Create database from example db if it does not yet exist
if not os.path.isfile(app.config['SQLALCHEMY_DATABASE_PATH']):
    try:
        copyfile(app.config['SQLALCHEMY_DATABASE_PATH'].replace('.db', '.example.db'), app.config['SQLALCHEMY_DATABASE_PATH'])
    except FileNotFoundError:
        # if the db file is not there
        pass

# initialize db
db = SQLAlchemy(app)
from backend.orm import models

import backend.views
