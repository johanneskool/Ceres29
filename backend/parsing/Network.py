__author__ = "Rick Luiken, Tristan Trouwen"

import math
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
    def __init__(self, name, filesize, timestamp):
        self.name = name
        self.type = "Ordered as uploaded"
        self.filesize = filesize
        self.timestamp = timestamp

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

        # node tags or index if there are no labels
        to_be_converted["tags"] = self.graph.vs["label"] if self.graph.vs["label"] else [i for i in
                                                                                         range(self.graph.vcount())]

        # original (default ordering) node ids
        to_be_converted["cluster"] = self.graph.vs["cluster"]

        # edge weights in a adjacency matrix
        to_be_converted["weights"] = []
        matrix = self.graph.get_adjacency(attribute="weight")
        for row in range(self.graph.vcount()):
            to_be_converted["weights"].append(list(matrix[row]))

        # general file information
        to_be_converted["name"] = self.name
        to_be_converted["type"] = self.type
        to_be_converted["filesize"] = self.filesize

        # graph statistics
        to_be_converted["density"] = self.density
        to_be_converted["nodecount"] = self.graph.vcount()
        to_be_converted["edgecount"] = self.graph.ecount()
        to_be_converted["modularity"] = self.modularity
        to_be_converted["clustercount"] = self.num_of_clusters
        to_be_converted["avgweight"] = sum(self.graph.es["weight"])/self.graph.ecount() if self.graph.ecount == 0 else 0.0
        to_be_converted["timestamp"] = self.timestamp.strftime('%H:%M:%S, %A %B %d, %Y')
        to_be_converted["minWeight"] = min(self.graph.es["weight"]) if self.graph.es["weight"] else 0.0
        to_be_converted["maxWeight"] = max(self.graph.es["weight"]) if self.graph.es["weight"] else 0.0
        to_be_converted["fullyconnected"] = self.graph.vcount()**2 == self.graph.ecount()

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

    @property
    def density(self):
        """
        Calculates the density of the network

        @:returns density of the network
        """
        density = self.graph.density()
        if math.isnan(density):
            return 0
        else:
            return density

    @property
    def modularity(self):
        """
        Calculates the modularity of the clustering in self.communities

        @:returns the modularity of the clustering on this graph
        """
        return self.communities.modularity

    @property
    def num_of_clusters(self):
        """
        Gives the number of clusters in self.communities

        @:returns number of clusters in self.communities or 1 if self.communities doesn't exist
        """

        try:
            return len(self.communities)
        except NameError:
            return 1

    def reorder(self, reordering):
        """
        Convenience function, calls the reordering that the string reordering is referring to

        @:parameter reordering: string with the name of the reordering

        @:returns nothing
        """

        reordering_lower = reordering.lower()

        if reordering_lower == "default":
            pass
        elif reordering_lower == "lexicographic":
            self.reorder_lexicographic()
        elif reordering_lower == "fiedler":
            self.reorder_with_fiedler()
        elif reordering_lower == "degrees":
            self.reorder_with_degrees()
        elif reordering_lower == "pagerank":
            self.reorder_with_pagerank()
        elif reordering_lower == "betweenness":
            self.reorder_with_betweenness()
        elif reordering_lower == "cluster":
            self.reorder_with_clustering()
        else:
            raise ValueError("The requested reordering '{}' does not exist".format(reordering))

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

        return SubNetwork(self.name + "." + str(index), subgraph, self.filesize, self.timestamp)

    def get_cluster_graph(self):
        """
        Get a graph with all clusters concatenated into one vertex, showing edges between clusters

        :@returns subnetwork with the cluster graph
        """

        if len(self.communities) > 1:
            cluster_graph = self.communities.cluster_graph(combine_vertices="concat", combine_edges="mean")
            cluster_network = SubNetwork(self.name, cluster_graph, self.filesize, self.timestamp)
            cluster_network.type = 'Cluster graph'
            return cluster_network
        else:
            raise ValueError("This network does not contain any communities")

    def find_cluster(self, node_id):
        return self.communities.membership[node_id]


class TopNetwork(Network):
    """
    Helper class to convert and save network data in appropriate folders
    @:param string with name of data
    @:param filename String with name of file (already saved) in upload folder
    @:param id that is not equal to the name of a folder in the json folder

    @return nothing
    """

    def __init__(self, name, filename, directory_name, filesize, timestamp):
        super().__init__(name, filesize, timestamp)

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        self.graph = self.__parse__(filepath)

        self.directory_name = directory_name

        # find communities (based on the indices made by last ordering)
        self.find_communities()
        self.graph.vs["cluster"] = self.communities.membership

        # create folder to save all files in
        os.mkdir(os.path.join(app.config['JSON_FOLDER'], directory_name))


class SubNetwork(Network):

    def __init__(self, name, graph, filesize, timestamp):
        super().__init__(name, filesize, timestamp)
        self.graph = graph

        self.find_communities()
