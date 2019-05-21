__author__ = "Rick Luiken, Tristan Trouwen"

import os

import igraph as ig
import numpy as np
import ujson
from scipy.sparse.linalg import eigs

from backend import app

filenames = {
    'default': 'default.json',
    'fiedler': 'fiedler.json',
    'pagerank': 'pagerank.json',
    'cluster': 'cluster.json',
    'test': 'test.json'
}


class Network:
    """
    Helper class to convert and save network data in appropriate folders
    @:param string with name of data
    @:param filename String with name of file (already saved) in upload folder
    @:param id that is not equal to the name of a folder in the json folder

    @return nothing
    """

    def __init__(self, name, filename, directory_name):
        self.name = name
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        self.graph = self.__parse__(filepath)
        self.directory_name = directory_name
        # processing and saving files

        # create folder to save all files in
        os.mkdir(os.path.join(app.config['JSON_FOLDER'], directory_name))

        # save default json
        self.reorder_alphabetically()
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['default'])
        )

        # convert to fiedler
        self.reorder_with_fiedler()
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['fiedler'])
        )

        # convert to pagerank
        self.reorder_with_pagerank()
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['pagerank'])
        )

        if self.graph.vcount() > 500:
            self.communities = self.get_cluster_graph()
            self.save_as_json(
                os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['cluster'])
            )

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

        # TODO check file format and csv format and give appropriate errors

        with open(filename, 'r', encoding='utf-8') as f:
            tags = f.readline()
            colnr = tags.count(";")
            tags = tags.split(";")[1::]

        matrix = np.loadtxt(filename, delimiter=";",
                            skiprows=1,
                            usecols=range(1, colnr + 1))
        g = ig.Graph.Adjacency(matrix.astype(bool).tolist())

        g.es["weight"] = matrix[matrix.nonzero()]
        g.vs['label'] = tags

        return g

    @property
    def __json_string__(self):
        """
        Converts a tags list and adjacency matrix to a json string

        Parameters:
        tags (list): list of tags that name the rows and columns in the adjacency
                     matrix
        matrix (ndarray): the parsed adjacency matrix values

        Returns:
        json string in the format {"name": DataName, "tags": ["tag1", "tag2", "tagn"], "weights": 2D array of weights}
        """
        to_be_converted = {}
        to_be_converted["name"] = self.name
        to_be_converted["tags"] = self.graph.vs["label"] if self.graph.vs["label"] else [i for i in
                                                                                         range(self.graph.vcount())]
        to_be_converted["minWeight"] = min(self.graph.es["weight"])
        to_be_converted["maxWeight"] = max(self.graph.es["weight"])
        to_be_converted["weights"] = []
        matrix = self.graph.get_adjacency(attribute="weight")
        for row in range(self.graph.vcount()):
            to_be_converted["weights"].append(list(matrix[row]))

        return ujson.dumps(to_be_converted)

    def save_as_json(self, filename):
        jsonstring = self.__json_string__
        with open(filename, "w+", encoding='utf-8') as f:
            f.write(jsonstring)

    def reorder_alphabetically(self):
        order = np.argsort(self.graph.vs["label"])
        self.graph = self.graph.permute_vertices(order.tolist())

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

        L = np.array(self.graph.laplacian(), dtype=float)
        # calculate eigenvalues and eigenvectors from the laplacian
        # TODO: look into making this more efficient, not all eigenvalues have
        # to be calculated

        # calculate the k eigenvalues/vectors with the lowest magnitude
        eigvals, eigvec = eigs(L, k=2, which="SM")

        fiedler = eigvec[:, 1]

        # find the reordering based on the Fiedler vector
        order = np.argsort(fiedler)
        # sort matrix on both the rows and columns
        self.graph = self.graph.permute_vertices(order.tolist())

    def reorder_with_pagerank(self):
        scores = self.graph.pagerank(weights=self.graph.es["weight"])
        order = np.argsort(scores)
        self.graph = self.graph.permute_vertices(order.tolist())

    def get_cluster_graph(self):
        communities = self.graph.as_undirected(combine_edges="sum").community_multilevel(weights="weight")
        self.graph = communities.cluster_graph(combine_vertices="concat", combine_edges="mean")
        return communities
