__author__ = 'Tristan Trouwen'

import os

basedir = os.path.abspath(os.path.dirname(__file__))  # absolute path to project


class Config(object):
    """ Default configuration object. All configurations should inherit from this one. """
    HOST = 'localhost'
    PORT = '5555'
    TESTING = False
    APP_TITLE = "Network visualisation tool"
    APP_AUTHOR = "Ceres29"
    APP_VERSION = "v0.1a"
    SQLALCHEMY_DATABASE_PATH = os.path.join(basedir, 'app.db')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + SQLALCHEMY_DATABASE_PATH
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEVELOPMENT = False
    UPLOAD_FOLDER = os.path.join(basedir, 'backend/static/uploads/')
    JSON_FOLDER_RELATIVE = 'json'
    JSON_FOLDER = os.path.join(basedir, 'backend/static/', JSON_FOLDER_RELATIVE)
    ALLOWED_EXTENSIONS = {'csv'}
    SECRET_KEY = 'yolowaterpolo'


class ProductionConfig(Config):
    PORT = 6798
    SQLALCHEMY_DATABASE_PATH = os.path.join(basedir, 'prod.db')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + SQLALCHEMY_DATABASE_PATH


class DevelopmentConfig(Config):
    APP_VERSION = "v0.2d (development)"
    DEVELOPMENT = True
    DEBUG = True
    TEMPLATES_AUTO_RELOAD = True
    SQLALCHEMY_DATABASE_PATH = os.path.join(basedir, 'dev-v0.2d.db')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + SQLALCHEMY_DATABASE_PATH
