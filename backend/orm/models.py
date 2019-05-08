__author__ = 'Tristan Trouwen'

import os

from datetime import datetime
from backend import db

from parser import filenames
from parser import Network


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Time)
    filename = db.Column(db.String, unique=True)
    location_path = db.Column(db.String, unique=True)  # contains path of directory with all different files

    def __init__(self, file, name):
        self.timestamp = datetime.now()
        self.name = name

        network = Network(file)
        self.location_path = network.location_path

    @property
    def default(self):
        return os.path.join(self.location_path, filenames['default'])

    @property
    def fiedler(self):
        return os.path.join(self.location_path, filenames['fiedler'])

    def __repr__(self):
        return "<File {}>".format(self.name)
