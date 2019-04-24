from backend import app
from flask import render_template


@app.route('/')
def hello_world():
    return render_template(
        "index.html"
    )
