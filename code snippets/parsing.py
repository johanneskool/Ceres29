__author__ = "Rick Luiken"
import os

import numpy as np
from scipy import sparse
import scipy.sparse.csgraph as csg
from scipy.sparse import linalg


def parse(filename):
    # with open(file, mode='r', encoding='utf-8') as csvfile:
    #     reader = csv.reader(csvfile, delimiter=';')
    #     tags = next(reader)[1:]  # tags are stored in the first row
    #     mydict = {rows[0]: map(int, rows[1:-1]) for rows in reader}

    with open(filename, 'r', encoding='utf-8') as f:
        tags = f.readline()
        colnr = tags.count(";")
        tags = tags.split(";")[1::]

    matrix = np.loadtxt(filename, delimiter=";",
                        skiprows=1,
                        usecols=range(1, colnr + 1))
    L = csg.laplacian(csg.csgraph_from_dense(matrix))

    eigvals, eigvec = linalg.eigs(L)
    ind = np.argsort(eigvals)
    eigvals = eigvals[ind]
    eigvec = eigvec[:, ind]
    lowest = eigvals[0]
    for i in range(len(eigvals)):
        if eigvals[i] != lowest:
            fiedler = eigvec[:, i]

    order = np.argsort(fiedler)
    #sort matrix on both the rows and columns
    matrix = matrix[order, order]
    tags = list(np.array(tags)[order])
    print(tags[0])

if __name__ == "__main__":
    filename = "GephiMatrix_co-citation.csv"
    parse(filename)
