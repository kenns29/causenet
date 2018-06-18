import pickle

def get_model():
    file = open('models/model.bin', mode='rb')
    model = pickle.load(file)
    file.close()
    return model