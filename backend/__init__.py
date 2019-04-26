__author__ = 'Tristan Trouwen'

from os import environ
from flask import Flask
from flask_restful import Api

app = Flask(__name__)


# import configuration
if environ.get('FLASK_ENV', '').lower() == 'production':
    app.config.from_object('backend_configuration.ProductionConfig')

else:  # default to development configuration
    app.config.from_object('backend_configuration.DevelopmentConfig')

# initialize API
api = Api(app)


import backend.views
