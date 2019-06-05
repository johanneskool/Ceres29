__author__ = "Rick Luiken, Tristan Trouwen"

import os
from abc import abstractmethod

import igraph as ig
import numpy as np
import ujson
from scipy.sparse.linalg import eigs

from backend import app

filenames = {
    'default': 'default.json',
    'fiedler': 'fiedler.json',
    'lexicographic': 'lexicographic.json',
    'pagerank': 'pagerank.json',
    'cluster': 'cluster.json',
    'degrees': 'degrees.json',
    'betweenness': 'betweenness.json',
    'cluster_graph': 'cluster_graph.json'
}


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
        self.type = "Ordered as uploaded"

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
    def json_string(self):
        """
        Converts this network to a json string

        @:returns json string containing stats about the graph and the actual graph
        """

        to_be_converted = {}
        to_be_converted["name"] = self.name
        to_be_converted["type"] = self.type
        to_be_converted["tags"] = self.graph.vs["label"] if self.graph.vs["label"] else [i for i in
                                                                                         range(self.graph.vcount())]
        to_be_converted["minWeight"] = min(self.graph.es["weight"]) if self.graph.es["weight"] else 0.0
        to_be_converted["maxWeight"] = max(self.graph.es["weight"]) if self.graph.es["weight"] else 0.0
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

        jsonstring = self.json_string
        with open(filename, "w+", encoding='utf-8') as f:
            f.write(jsonstring)

    def reorder_lexicographic(self):
        """"
        Change the order of the vertices in the graph in lexicographic (alphabetical) order

        @:returns nothing
        """

        vertices = np.argsort(self.graph.vs["label"]).tolist()
        order = [vertices.index(i) for i in range(self.graph.vcount())]
        self.graph = self.graph.permute_vertices(order)

    def reorder_with_fiedler(self):
        """
        OLD DO NOT USE

        Reorder the vertices in the graph based on the Fiedler vector

        @:returns nothing
        """

        L = np.array(self.graph.laplacian(weights=self.graph.es['weight']), dtype=float)

        # calculate eigenvalues and eigenvectors from the laplacian
        # TODO: look into making this more efficient, not all eigenvalues have
        # to be calculated

        # calculate the k eigenvalues/vectors with the lowest magnitude
        eigvals, eigvec = eigs(L, k=np.linalg.matrix_rank(L), sigma=0.001, which="LM")

        eigorder = np.argsort(eigvals)
        eigvals = eigvals[eigorder]
        eigvec = eigvec[:, eigorder]

        for i, val in enumerate(eigvals):
            if not np.isclose(val, 0):
                fiedler = eigvec[:, i]
                break

        # find the reordering based on the Fiedler vector
        vertices = np.argsort(fiedler).tolist()
        order = [vertices.index(i) for i in range(self.graph.vcount())]
        # sort matrix on both the rows and columns
        self.graph = self.graph.permute_vertices(order)

    def reorder_with_degrees(self):
        """
        Reorder the vertices in the graph based on the degree of the vertices

        @:returns nothing
        """

        degrees = self.graph.degree()
        vertices = np.argsort(degrees).tolist()[::-1]
        order = [vertices.index(i) for i in range(self.graph.vcount())]
        self.graph = self.graph.permute_vertices(order)

    def reorder_with_pagerank(self):
        """
        Reorder the vertices in the graph based on the pagerank score of the vertices

        @:returns nothing
        """

        scores = self.graph.pagerank(weights=self.graph.es["weight"])
        vertices = np.argsort(scores).tolist()[::-1]
        order = [vertices.index(i) for i in range(self.graph.vcount())]
        self.graph = self.graph.permute_vertices(order)

    def reorder_with_betweenness(self):
        """
        Reorder the vertices in the graph based on the betweenness of the vertices

        @:returns nothing
        """
        betweenness = self.graph.betweenness(weights='weight')
        vertices = np.argsort(betweenness).tolist()[::-1]
        order = [vertices.index(i) for i in range(self.graph.vcount())]
        self.graph = self.graph.permute_vertices(order)

    def reorder_with_clustering(self):
        """
        Reorder the matrix so the vertices are grouped in their clusters/communities

        @:returns nothing
        """
        clusters = list(self.communities)
        clusters.sort(key=len, reverse=True)
        vertices = [vtx for cluster in clusters for vtx in cluster]
        order = [vertices.index(i) for i in range(self.graph.vcount())]
        self.graph = self.graph.permute_vertices(order)

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
            raise IndexError('Index is outside of community range')

        subgraph = self.communities.subgraph(index)

        return SubNetwork(self.name + "." + str(index), subgraph)


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
        self.type = 'Lexicographically reordered'
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['lexicographic'])
        )

        # convert to degrees
        self.reorder_with_degrees()
        self.type = 'Reordered using the degree distribution'
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['degrees'])
        )

        # convert to betweenness
        self.reorder_with_betweenness()
        self.type = 'Reordered using betweenness'
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['betweenness'])
        )

        # convert to pagerank
        self.reorder_with_pagerank()
        self.type = 'Reordered using pagerank-vector'
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['pagerank'])
        )

        # convert to sorted by cluster

        # find communities (based on the indices made by last ordering)
        self.find_communities()

        self.reorder_with_clustering()
        self.type = 'Reordered using clustering of vertices'
        self.save_as_json(
            os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['cluster'])
        )

        # make cluster graph if there are multiple clusters
        if len(self.communities) > 1:
            cluster_graph = self.communities.cluster_graph(combine_vertices="concat", combine_edges="mean")
            cluster_network = SubNetwork(name, cluster_graph)
            cluster_network.type = 'Cluster graph'
            cluster_network.save_as_json(
                os.path.join(app.config['JSON_FOLDER'], self.directory_name, filenames['cluster_graph'])
            )


class SubNetwork(Network):

    def __init__(self, name, graph):
        super().__init__(name)
        self.graph = graph

        self.find_communities()
