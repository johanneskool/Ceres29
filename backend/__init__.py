__author__ = 'Tristan Trouwen'

from os import environ
from flask import Flask

app = Flask(__name__)

if environ.get('FLASK_ENV').lower() == 'production':
    app.config.from_object('backend_configuration.ProductionConfig')

else:  # default to development configuration
    app.config.from_object('backend_configuration.DevelopmentConfig')


import backend.views
