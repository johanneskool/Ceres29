__author__ = 'Tristan Trouwen'


import os

basedir = os.path.abspath(os.path.dirname(__file__))  # absolute path to project


class Config(object):
    """ Default configuration object. All configurations should inherit from this one. """
    HOST = 'localhost'
    PORT = '5555'
    TESTING = False
    API_VERSION = 'test'
    DATABASE_URI = 'sqlite:///:memory:'  # set database URI to use local database in RAM
    DEVELOPMENT = False
    UPLOAD_FOLDER = os.path.join(basedir, 'backend/static/uploads')
    ALLOWED_EXTENSIONS = set(['csv'])
    SECRET_KEY = '\xfd{H\xe5<\x95\xf9\xe3\x96.5\xd1\x01O<!\xd5\xa2\xa0\x9fR"\xa1\xa8'


class ProductionConfig(Config):
    PORT = 6798
    # DATABASE_URI = os.path.join(basedir, 'file.sql')


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    TEMPLATES_AUTO_RELOAD = True

