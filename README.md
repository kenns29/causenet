# Cause Net

## Backend

### Install

Make sure python version 3.6.5 is installed.

#### Setup virtual environment and install dependencies

For Mac users, go to the `/backend` directory and do

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

For windows users, go to the `/backend` directory and do

```bash
python -m venv venv
cd venv/bin
activate.bat
cd ../../
pip install -r requirements.txt
```

#### Install the C extension package

Under the virtual environment, go to the `backend/bn_edge_weights` directory and do

```bash
python setup.py install
```

#### Pre-generate the data

Currently the data loading process is hard coded. You need to download the data from the [google drive folder](https://drive.google.com/drive/folders/1ZokWnnJ_i91MmtZ2z3uog4s02XAKe-Q6?usp=sharing). Copy the `/metadata` folder and place it in the `/backend` directory, then do

```bash
python generate_open_source_data.py
```

This script preprocesses the data (filtering and converting numerical variables to categorical ones), then calculates pairwise distances for all the features and performs hierarchical clustering. The resulting data will be placed in the `/data` directory. A config file will also be generated under the `/data` directory (`/data/config.json`) that has the following format:

```js
{
  "test_0": {
    "raw_data_file": "test_0_raw.bin",
    "data_file": "test_0.bin",
    "base_avg_data_file": "test_0_base_avg.bin",
    "pdist_file": "test_0_pdist.bin",
    "clustering_file": "test_0_clustering.bin"
  },
  "fao_fused_spatio_temporal_cut_10": {
    "raw_data_file": "fao_fused_spatio_temporal_cut_10_raw.bin",
    "data_file": "fao_fused_spatio_temporal_cut_10.bin",
    "base_avg_data_file": "fao_fused_spatio_temporal_cut_10_base_avg.bin",
    "pdist_file": "fao_fused_spatio_temporal_cut_10_pdsit.bin",
    "clustering_file": "fao_fused_spatio_temporal_cut_10_clustering.bin"
  }
}
```

This config file is to help the backend keep track of the existing datasets and their corresponding files.

### Run

```bash
python manage.py runserver
```

## Frontend

### Install

Clone the repository from [sortable-matrix](https://github.com/kenns29/sortable-matrix), and place the repo folder under **the same parent directory** of the `/causenet` project folder. Follow the instructions in [sortable-matrix](https://github.com/kenns29/sortable-matrix) to install it.

Afterwards, go to the `/frontend` directory and do

```bash
npm install
```

### Run

```bash
npm start
```
