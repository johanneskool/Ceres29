__author__ = 'Tristan Trouwen'

from os import environ

from backend import app

if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        print('[*] Info: invalid port detected; defaulted to port 5555')
        PORT = 5555
    app.run(HOST, PORT)
