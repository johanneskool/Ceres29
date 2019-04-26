
__author__ = 'Tristan Trouwen'

from backend import app, api
from flask import render_template

from flask_restful import Resource


@app.route('/')
def hello_world():
    return render_template(
        "index.html"
    )


class Data(Resource):
    def get(self, data_name):
        return {
                "ok": data_name
        }


api.add_resource(Data, '/api/<data_name>')
