
__author__ = 'Tristan Trouwen'

from backend import app, api
from flask import render_template

<<<<<<< HEAD
from flask_restful import Resource


=======
>>>>>>> 2b0b3ffb16a4cc0bba474cc829699d204d46af40
@app.route('/')
def hello_world():
    return render_template(
        "index.html"
    )


class Data(Resource):
    def get(self):
        return {
            {
                "ok"
            }
        }
