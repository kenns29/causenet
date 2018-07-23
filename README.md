# Cause Net

## Backend

### Install

Go to the `/backend` directory and do

```
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

Currently the data loading process is hard coded, we support two sets of data ("uberEats" and "lookalike"). You need to download the data from the [google drive folder](https://drive.google.com/drive/u/0/folders/1n9FmqDravUOg4HjnlsmP2cUdtRp16QKO). Copy the `/metadata` folder and place it in the `/backend` directory, then do

```
python3 generate_data.py
```

This script preprocesses the data (filtering and converting numerical variables to categorical ones), then calculates pairwise distances for all the features and performs hierarchical clustering. The resulting data will be placed in the `/data` directory. A config file will also be generated under the `/data` directory (`/data/config.json`) that has the following format:

```json
{
  "eats_qcut_5": {
    "data_file": "eats_qcut_5.bin",
    "pdist_file": "eats_qcut_5_pdist.bin",
    "clustering_file": "eats_qcut_5_clustering.bin"
  },
  "lookalike_cut_5": {
    "data_file": "lookalike_cut_5.bin",
    "pdist_file": "lookalike_cut_5_pdist.bin",
    "clustering_file": "lookalike_cut_5_clustering.bin"
  },
  "lookalike_full_feature_cut_5": {
    "data_file": "lookalike_full_feature_cut_5.bin",
    "pdist_file": "lookalike_full_feature_pdist.bin",
    "clustering_file": "lookalike_full_feature_cut_5_clustering.bin"
  }
}
```

This config file is to help the backend keep track of the existing datasets and their corresponding files.

### Run

```
python3 manager.py runserver
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
