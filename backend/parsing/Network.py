__author__ = "Rick Luiken, Tristan Trouwen"

import os

import igraph as ig
import numpy as np
import ujson
from scipy.sparse.linalg import eigs
from abc import abstractmethod

from backend import app

filenames = {
    'default': 'default.json',
    'fiedler': 'fiedler.json',
    'lexicographic': 'lexicographic.json',
    'pagerank': 'pagerank.json',
    'cluster': 'cluster.json',
}

# amount of nodes we're showing the cluster graph instead of the actual graph
cluster_threshold = 200


class Network:
    """
    Abstract class for changing networks and getting statistics

    @:param name: string with name of data
    @:param directory_name: string for the location to save the graph in json format

    @:returns nothing
    """

    @abstractmethod
    def __init__(self, name):
        self.name = name

    @staticmethod
    def __parse__(filename):
        """
        Parse a csv file of the given format of the course in a ordered tags list
        and an adjacency matrix ndarray

        @:param filename: Location of the csv file to be parsed

        @:returns python-igraph graph instance of the parsed csv file
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
        Converts this network to a json string

        @:returns json string containing stats about the graph and the actual graph
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
        """"
        Converts this network instance to a json file

        @:param filename: string where to save the json file

        @:returns nothing
        """

        jsonstring = self.__json_string__
        with open(filename, "w+", encoding='utf-8') as f:
            f.write(jsonstring)

    def reorder_lexicographic(self):
        """"
        Change the order of the vertices in the graph in lexicographic (alphabetical) order

        @:returns nothing
        """

        order = np.argsort(self.graph.vs["label"])
        self.graph = self.graph.permute_vertices(order.tolist())

    def reorder_with_fiedler(self):
        """
        Reorder the vertices in the graph based on the Fiedler vector

        @:returns nothing
        """

        L = np.array(self.graph.laplacian(weights=self.graph.es['weight']), dtype=float)

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
        """
        Reorder the vertices in the graph based on the pagerank score of the vertices

        @:returns nothing
        """

        scores = self.graph.pagerank(weights=self.graph.es["weight"])
        order = np.argsort(scores)
        self.graph = self.graph.permute_vertices(order.tolist())

    def find_communities(self):
        """"
        Find clusters in the graph using the community detection algorithm by Blondel et al

        @:returns nothing
        """
        self.communities = self.graph.as_undirected(combine_edges="sum").community_multilevel(weights="weight")

    def get_subnetwork(self, index):
        """"
        Get the subnetwork at index in the community structure

        @:param index: integer to select which subnetwork needs to be returned

        @:returns subnetwork with the selected graph
        """

        if not self.communities:
            raise ReferenceError("This network does not contain any communities")

        if index >= len(self.communities):
            raise IndexError('Índex is outside of community range')

        subgraph = self.communities.subgraph(index)

        return SubNetwork(self.name + "." + index, subgraph)


class TopNetwork(Network):
    """
    Helper class to convert and save network data in appropriate folders
    @:param string with name of data
    @:param filename String with name of file (already saved) in upload folder
    @:param id that is not equal to the name of a folder in the json folder

    @return nothing
    """

    def __init__(self, name, filename, directory_name):
        super().__init__(name)

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        self.graph = self.__parse__(filepath)

        self.directory_name = directory_name

        # create folder to save all files in
        os.mkdir(os.path.join(app.config['JSON_FOLDER'], directory_name))

        # processing and saving files

        # save default json
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['default'])
        )

        # convert to alphabetically sorted json
        self.reorder_lexicographic()
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['lexicographic'])
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

        # find communities if the graph has more vertices than the threshold
        self.communities = False
        if self.graph.vcount() > cluster_threshold:
            self.find_communities()
            cluster_graph = self.communities.cluster_graph(combine_vertices="concat", combine_edges="mean")
            cluster_network = SubNetwork(name, cluster_graph)
            cluster_network.save_as_json(
                os.path.join(app.config['JSON_FOLDER'], os.path.join(cluster_network.directory_name, filenames['cluster']))
            )


class SubNetwork(Network):

    def __init__(self, name, graph):
        super().__init__(name)
        self.graph = graph

        if self.graph.vcount() > cluster_threshold:
            self.find_communities()
