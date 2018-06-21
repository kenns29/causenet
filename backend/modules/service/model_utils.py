import pickle

def get_model():
    file = open('models/qcut5/model.bin', mode='rb')
    model = pickle.load(file)
    file.close()
    return model