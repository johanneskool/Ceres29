import ujson
import os
from collections import OrderedDict

import numpy as np
import scipy.sparse.csgraph as csg
from scipy.sparse import linalg

from backend import app


def parse(filename):
    """
    Parse a csv file of the given format of the course in a ordered tags list
    and an adjacency matrix ndarray

    Parameters:
    filename (str): Location of the csv file to be parsed

    Returns:
    tags (list): list of tags that name the rows and columns in the adjacency
                 matrix
    matrix (ndarray): the parsed adjacency matrix values
    """

    # TODO check file formatc and csv format and give appropriate errors

    with open(filename, 'r', encoding='utf-8') as f:
        tags = f.readline()
        colnr = tags.count(";")
        tags = tags.split(";")[1::]

    matrix = np.loadtxt(filename, delimiter=";",
                        skiprows=1,
                        usecols=range(1, colnr + 1))

    print(tags[0])
    return tags, matrix


def reorder(tags, matrix):
    """
    Reorder the tags and adjacency matrix based on the Fiedler vector

    parameters:
    tags (list): list of tags that name the rows and columns in the adjacency
                 matrix
    matrix (ndarray): the parsed adjacency matrix values

    Returns:
    tags (list): list of tags that name the rows and columns in the adjacency
                 matrix, in order of the Fiedler vector
    matrix (ndarray): the parsed adjacency matrix values, in order of the Fiedler
                      vector
    """

    L = csg.laplacian(csg.csgraph_from_dense(matrix))

    # calculate eigenvalues and eigenvectors from the laplacian
    # TODO: look into making this more effiecient, not all eigenvalues have
    # to be calculated
    eigvals, eigvec = linalg.eigs(L)

    # sort eigenvalues and eigenvectors from low to high
    ind = np.argsort(eigvals)
    eigvals = eigvals[ind]
    eigvec = eigvec[:, ind]

    # find second lowest unique eigenvalues, it's eigenvector is the Fiedler vector
    lowest = eigvals[0]
    for i in range(len(eigvals)):
        if eigvals[i] != lowest:
            fiedler = eigvec[:, i]
            break

    # find the reordering based on the Fiedler vector
    order = np.argsort(fiedler)
    print(fiedler[order[0:10]])

    # sort matrix on both the rows and columns
    matrix = matrix[order, :]
    matrix = matrix[:, order]
    # sort tags
    tags = list(np.array(tags)[order])
    print(tags[0:10])
    return tags, matrix


def adjacency_to_json_string(tags, matrix):
    """
    Convertes a tags list and adjacency matrix to a json string

    Parameters:
    tags (list): list of tags that name the rows and columns in the adjacency
                 matrix
    matrix (ndarray): the parsed adjacency matrix values

    Returns:
    json string in the format {"tag1": [value_tag1, value_tag2 ... value_tagn], ...}
    """
    to_be_converted = OrderedDict()
    for row, tag in enumerate(tags):
        to_be_converted[tag] = list(matrix[row, :])
    return ujson.dumps(to_be_converted)


def adjacency_to_json_file(filename, tags, matrix):
    jsonstring = adjacency_to_json_string(tags, matrix)
    filename = os.path.basename(filename)
    filepath = os.path.join(app.config['JSON_FOLDER'], filename.split('.')[0] + ".json")
    with open(filepath, "w+", encoding='utf-8') as f:
        f.write(jsonstring)
