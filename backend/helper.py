__author__ = "Rick Luiken"
import os

import numpy as np
import ujson
from scipy import sparse
from scipy.sparse.csgraph import laplacian
from scipy import linalg
from backend import app


def parse(filename):
    # with open(file, mode='r', encoding='utf-8') as csvfile:
    #     reader = csv.reader(csvfile, delimiter=';')
    #     tags = next(reader)[1:]  # tags are stored in the first row
    #     mydict = {rows[0]: map(int, rows[1:-1]) for rows in reader}

    with open(filename, 'r', encoding='utf-8') as f:
        tags = f.readline()

    colnr = tags.count(";")
    matrix = np.loadtxt(filename, delimiter=";",
                        skiprows=1,
                        usecols=range(1, colnr + 1))
    laplacian = laplacian(sparse(matrix))

    eigvals, eigvec = linalg.eig(laplacian, left = True)
    ind = np.argsort(evals)
    eigvals = eigvals[ind]
    eigvec = eigvec[:, ind]
    lowest = eigvals[0]
    for i in range(eigvals):
        if eigvals[i] != lowest:
            fiedler = eigvec[i]

    print(fiedler)



    filename = os.path.basename(filename)
    filepath = os.path.join(app.config['JSON_FOLDER'], filename.split('.')[0] + ".json")
    with open(filepath, "w+", encoding='utf-8') as f:
        f.write(ujson.dumps(sparsematrix, indent=4))


if __name__ == '__main__':
    csvfilename = 'GephiMatrix_co-citation.csv'
    parse(csvfilename)
