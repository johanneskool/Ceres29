__author__ = "Rick Luiken"

import numpy as np
import scipy.sparse.csgraph as csg
from scipy.sparse import linalg
import ujson


filenames = {
    'default': 'default.json',
    'fiedler': 'fiedler.json'
}


class Network(object):

    def __init__(self, filename):
        self.tags, self.adjacency_matrix = self.__parse__(filename)

    @staticmethod
    def __parse__(filename):
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

        return tags, matrix

    @property
    def __json_string__(self):
        """
        Converts a tags list and adjacency matrix to a json string

        Parameters:
        tags (list): list of tags that name the rows and columns in the adjacency
                     matrix
        matrix (ndarray): the parsed adjacency matrix values

        Returns:
        json string in the format {"tags": ["tag1", "tag2", "tagn"], "weights": 2D array of weights}
        """
        to_be_converted = {}
        to_be_converted["tags"] = self.tags
        to_be_converted["weights"] = []
        for row in range(len(self.tags)):
            to_be_converted["weights"].append(list(self.adjacency_matrix[row, :]))

        return ujson.dumps(to_be_converted)

    def save_as_json(self, filename):
        jsonstring = self.__json_string__()
        with open(filename, "w+", encoding='utf-8') as f:
            f.write(jsonstring)

    def reorder_with_fiedler(self):
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

        L = csg.laplacian(csg.csgraph_from_dense(self.adjacency_matrix))

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

        # sort matrix on both the rows and columns
        self.adjacency_matrix = self.adjacency_matrix[order, :]
        self.adjacency_matrix = self.adjacency_matrix[:, order]
        # sort tags
        self.tags = list(np.array(self.tags)[order])
