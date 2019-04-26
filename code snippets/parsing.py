__author__ = "Rick Luiken"

import csv
import numpy as np
from collections import OrderedDict

with open('GephiMatrix_co-citation.csv', newline='', encoding='utf-8') as csvfile:
	reader = csv.reader(csvfile, delimiter=';', quotechar='|')
	tags = list(OrderedDict.fromkeys(next(reader)[1:])) #tags are stored in the first row
	weights = np.zeros((len(tags), len(tags)), dtype=str)
	already_seen = []
	for i,row in enumerate(reader):
		rownumber = tags.index(row[0]) #look for the position in the tags array
		if rownumber != -1 and row[0] not in already_seen:
			already_seen.append(row[0])
			weights[rownumber] = row[1:-1]

weights = weights.astype(float, copy=False)
dict = OrderedDict() #ordering of the keys is important, as it determines the order of the weight arrays
for i,row in enumerate(weights):
	dict[tags[i]] = row.tolist()

print(dict)
