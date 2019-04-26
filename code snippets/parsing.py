__author__ = "Rick Luiken"

import csv
import numpy as np
from collections import OrderedDict

with open('GephiMatrix_co-citation.csv', newline='', encoding='utf-8') as csvfile:
	reader = csv.reader(csvfile, delimiter=';', quotechar='|')
	tags = list(OrderedDict.fromkeys(next(reader)[1:]))
	array = np.zeros((len(tags), len(tags)))
	already_seen = []
	for i,row in enumerate(reader):
		rownumber = tags.index(row[0])
		if rownumber != -1 and row[0] not in already_seen:
			already_seen.append(row[0])
			array[rownumber] = [float(num) for num in row[1:-1]]

print(tags)
print(array)