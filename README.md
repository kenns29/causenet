# Cause Net

## Backend

### Install

Go to the `/backend` directory and do

```
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

### Run

```
python3 manager.py runserver
```

Currently the data loading process is hard coded, we support two sets of data ("uberEats" and "lookalike"). You need to download the data from the [google drive folder](https://drive.google.com/drive/u/0/folders/1n9FmqDravUOg4HjnlsmP2cUdtRp16QKO). Copy the `/data` folder and place it in the `/backend` directory. If you need some quick models to test, you can also download the `/model` folder and place it in the `/backend` direcotry as well.

Currently, when you click on the "Train Model" button in the frontend UI, the default dataset for the model is the "lookalike" data. If you want to train model for uberEats data, go to `/backend/modules/api/api.py` and change the following line in the code

```python
load_data = load_lookalike_cut_5_data
```

to

```python
load_data = load_qcut_5_data
```

## Frontend

### Install

Clone the repository from [sortable-matrix](https://github.com/kenns29/sortable-matrix), and place the repo folder under **the same parent directory** of the `/causenet` project folder. Follow the instructions in [sortable-matrix](https://github.com/kenns29/sortable-matrix) to install it.

Afterwards, go to the `/frontend` directory and do

```
npm install
```

### Run

```
npm start
```
