# DBL29 Ceres
> Webapp that visualizes weighted directed graphs

### Backend Installation

1. Create virtual environment with correct versions. 
    
       virtualenv -p python3 venv
       source venv/bin/activate
       
       pip3 install backend/requirements.txt

##### Development
       
2. Run Development Server

    python backend_start.py

##### Production

2. Run Production Server

       export FLASK_ENV = production
       pip3 install gunicorn
       
       gunicorn -w 2 backend:app
       

## License

<a href="https://github.com/johanneskool/Ceres29/blob/master/LICENSE">MIT</a>
