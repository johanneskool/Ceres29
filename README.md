# DBL29 Ceres
> Webapp that visualizes weighted directed graphs

## Features

- Upload csv file automatically saves data and sorts data
- Visualises the data in a matrix
- Zoom (scroll)


## Installation

Installation was tested on Ubuntu 18.04. Installation on Windows may differ slightly.

### Backend Installation

1. Install build tools needed for python-igraph

        sudo apt install build-essential python-dev libxml2 libxml2-dev zlib1g-dev

2. Create virtual environment with correct versions. 
    
       virtualenv -p python3 venv
       source venv/bin/activate
       
       pip3 install -r requirements.txt

We are using python 3.6. However, python 3.7 probably also works.

##### Development
       
3. Run Development Server

        python backend_start.py

Go to the url printed in the console to visit the website.

##### Production

3. Run Production Server

       export FLASK_ENV = production
       pip3 install gunicorn
       
       gunicorn -w 2 backend:app
       


## License

<a href="https://github.com/johanneskool/Ceres29/blob/master/LICENSE">MIT</a>
