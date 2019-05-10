__author__ = 'Tristan Trouwen'

import os
import secrets

from datetime import datetime

from backend import app
from backend import db
from backend.parsing import Network


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    timestamp = db.Column(db.DateTime)
    filename = db.Column(db.String)
    hash = db.Column(db.String)

    def __init__(self, file, name):
        self.timestamp = datetime.utcnow()
        self.filename = file

        # create hash to save directory in
        while True:
            hash = secrets.token_urlsafe(64)
            if hash not in [file.hash for file in File.query.all()]:
                self.hash = hash
                break

        # check if name already present here
        count = 0
        actual_name = name
        while name in [file.name for file in File.query.all()]:
            # append (number) to end if already exists
            name = actual_name + " (" + str(count) + ")"
            count += 1
        self.name = name

        Network.Network(self.name, self.filename, self.hash)  # converts to correct models and saves file in hash folder

    @property
    def location_path(self):
        return os.path.join(app.config['JSON_FOLDER_RELATIVE'], self.hash)

    @property
    def default(self):
        return os.path.join(app.config["JSON_FOLDER"], self.location_path, Network.filenames['default'])

    @property
    def fiedler(self):
        return os.path.join(app.config["JSON_FOLDER"], self.location_path, Network.filenames['fiedler'])

    def __repr__(self):
        return "<File {}>".format(self.name)
