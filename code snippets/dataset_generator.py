import csv

import names
from scipy import sparse


class FakeDataset:
    def __init__(self, n=100, density=0.5, ):
        csv.register_dialect('ceres', delimiter=';', quoting=csv.QUOTE_NONE)

        self.tags = self.generate_tags(n)
        assert (len(self.tags) == n)

        self.matrix = self.generate_matrix(n, density)
        assert (self.matrix.shape == (n, n))
        self.list = self.matrix.tolist()

    def generate_tags(self, n):
        return [names.get_full_name() for _ in range(n)]

    def generate_matrix(self, n, density):
        return sparse.rand(n, n, density).todense()

    def write_csv(self, filename):
        with open(filename, 'w+', newline='', encoding='utf-8') as f:
            f.write(';')  # a semicolon as first character is what the server expects
            writer = csv.writer(f, dialect='ceres')
            writer.writerow(self.tags)
            for i, tag in enumerate(self.tags):
                values = self.list[i]
                values.insert(0, tag)
                writer.writerow(values)


if __name__ == '__main__':
    fakedata = FakeDataset(n=10000, density=0.1)
    fakedata.write_csv('fakedata.csv')
