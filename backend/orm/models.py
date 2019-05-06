from backend import db
from datetime import datetime


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Time)
    filename = db.Column(db.String, unique=True)
    location_default = db.Column(db.String, unique=True)
    location_fiedler = db.Column(db.String, unique=True)

    def __init__(self, name):
        self.timestamp = datetime.now()
        self.name = name

    def __repr__(self):
        return "<File {}>".format(self.name)