# DBL29 Ceres
> Webapp that visualizes weighted directed graphs

### Backend Installation

1. Create virtual environment with correct versions. 
    
       virtualenv -p python3 venv
       source venv/bin/activate
       
       pip3 install -r backend/requirements.txt

##### Development
       
2. Run Development Server
<<<<<<< HEAD

       python backend_start.py
=======
    
        python backend_start.py
>>>>>>> 2b0b3ffb16a4cc0bba474cc829699d204d46af40

##### Production

2. Run Production Server

       export FLASK_ENV = production
       pip3 install gunicorn
       
       gunicorn -w 2 backend:app
       

## License

<a href="https://github.com/johanneskool/Ceres29/blob/master/LICENSE">MIT</a>
