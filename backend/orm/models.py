__author__ = 'Tristan Trouwen'

import secrets
import os

from datetime import datetime

from backend import app
from backend import db
from backend.parsing import Network


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Time)
    filename = db.Column(db.String, unique=True)
    hash = db.Column(db.String, unique=True)  # contains path of directory with all different files

    def __init__(self, file, name):
        self.timestamp = datetime.now()
        self.name = name

        # set hash with collision checking
        current_files = db.session.query(File.hash).all()
        while True:
            generated_hash = secrets.token_urlsafe()
            if generated_hash not in current_files:
                break
        self.hash = generated_hash

        network = Network.Network(file, generated_hash)

    @property
    def location_path(self):
        return os.path.join(app.config['JSON_FOLDER'], self.hash)

    @property
    def default(self):
        return os.path.join(self.location_path, Network.filenames['default'])

    @property
    def fiedler(self):
        return os.path.join(self.location_path, Network.filenames['fiedler'])

    def __repr__(self):
        return "<File {}>".format(self.name)
