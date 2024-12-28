# hardback-hax0r

## Development setup
#### Clone the repo
```
cd ~/projects
git clone https://github.com/tesslinden/hardback-hax0r.git
```
#### Set up pre-commit hooks
```
cd ~/projects/hardback-hax0r
pre-commit install
```
#### Set up the backend
Ensure correct version of Python is being used (3.9.17):
```
python --version
```
If not, set python version to 3.9.17, then return here.
Set python interpreter in PyCharm to `/usr/bin/python3`.

Create virtual environment and install dependencies:
``` 
cd ~/projects/hardback-hax0r/
python3 -m venv hh-env
source hh-env/bin/activate
pip install -r requirements.txt --no-cache-dir --index-url https://pypi.org/simple
```

#### Set up the frontend
Check if you have Node.js installed:
```
cd ~/projects/hardback-hax0r/frontend
node -v
npm -v
```
If not, install Node.js, then return here.
```
cd ~/projects/hardback-hax0r/frontend
nvm install # installs the version of node specified in .nvmrc
nvm use # uses the version of node specified in .nvmrc
npm install # installs the dependencies listed in package.json
```

#### Run the website locally to test your setup is working
Run the backend:
```
cd ~/projects/hardback-hax0r
source hh-env/bin/activate # if not already activated
python backend/app.py
```
In a new terminal, run the frontend:
```
cd ~/projects/hardback-hax0r/frontend
npm start
```
Go to `http://localhost:3000/` to see the website.
Alternatively, in PyCharm, run the HH configuration to start the backend and frontend together.


## TODO
* search should happen automatically rather than having to hit search
* split webpage into 3 columns: letter counts; min length and max length inputs; search results
* Add button to clear all inputs, and ask user to confirm
* Add button to download results as text file
* Convert words.txt to SQL database and query it
* For each word, try pinging wiktionary and if it doesn't work then filter it out
* Paginate results if there are more than 100