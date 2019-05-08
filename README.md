# DBL29 Ceres
> Webapp that visualizes weighted directed graphs

## Installation

Installation was tested on Ubuntu 18.04. Installation on Windows may differ slightly.

### Backend Installation

1. Create virtual environment with correct versions. 
    
       virtualenv -p python3 venv
       source venv/bin/activate
       
       pip3 install -r backend/requirements.txt

We are using python 3.6. However, python 3.7 probably also works.

##### Development
       
2. Run Development Server

        python backend_start.py

Go to the url printed in the console to visit the website.

##### Production

2. Run Production Server

       export FLASK_ENV = production
       pip3 install gunicorn
       
       gunicorn -w 2 backend:app
       


## License

<a href="https://github.com/johanneskool/Ceres29/blob/master/LICENSE">MIT</a>
