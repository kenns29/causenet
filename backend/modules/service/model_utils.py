import pickle


def get_model():
    with open('models/qcut5/model.bin', mode='rb') as file:
        return pickle.load(file)


def get_fitted_model():
    with open('models/qcut5/fitted_model.bin', mode='rb') as file:
        return pickle.load(file)
