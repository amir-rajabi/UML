from contextlib import redirect_stdout
import numpy as np
import torch, os, sys
from model import ConvolutionalNeuralNetwork

'''
    lets you print the weights of a model
    into a file. by default writes into temp.txt
    of working dir. change to desired file
    in set path

    mainly for testing
'''

set_path = ""

if __name__ == "__main__":

    path = "temp.txt"
    if set_path:
        path=set_path

    try:
        model_path = sys.argv[1]
    except:
        print("WARNING path set to default data/_model.pt")
        model_path = "../data/_model.pt"

    model = ConvolutionalNeuralNetwork(0)

    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path))
    else:
        raise Exception("model does not exist")

    torch.set_printoptions(profile="full")
    with open(path, 'w') as f:
        with redirect_stdout(f):
            for params in model.parameters():
                print(params)
    print("Success!")
