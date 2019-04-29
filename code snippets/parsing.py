__author__ = "Rick Luiken"
import ujson
import os
from backend import app
import csv
from collections import OrderedDict


def parse(file):
    with open(file, mode='r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile, delimiter=';')
        tags = next(reader)[1:]  # tags are stored in the first row
        mydict = {rows[0]: map(int, rows[1:-1]) for rows in reader}


    jsondict = ujson.dumps(mydict, indent=2, sort_keys=True)
    return jsondict


if __name__ == '__main__':
    filename = 'GephiMatrix_co-citation.csv'
    jsons = parse(filename)
    # the split is done to remove the extension
    with open(app.config['JSON_FOLDER'] + filename.split('.')[0] + ".json", "w+") as f:
        f.write(jsons)

