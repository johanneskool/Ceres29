__author__ = 'Tristan Trouwen'


import os

basedir = os.path.abspath(os.path.dirname(__file__))  # absolute path to project


class Config(object):
    """ Default configuration object. All configurations should inherit from this one. """
    HOST = 'localhost'
    PORT = '5555'
    TESTING = False
    DATABASE_URI = 'sqlite:///:memory:'  # set database URI to use local database in RAM
    DEVELOPMENT = False


class ProductionConfig(Config):
    PORT = 6798
    # DATABASE_URI = os.path.join(basedir, 'file.sql')


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    TEMPLATES_AUTO_RELOAD = True

