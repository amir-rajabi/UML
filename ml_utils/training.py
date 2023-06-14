import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
import torch.nn as nn
import torch
from torch.optim import Optimizer, SGD

import time

if __name__ == '__main__':
    from data import get_data_loaders
    from evaluate import accuracy
    from model import ConvolutionalNeuralNetwork
    from json_write import write_epoch
else: 
    from ml_utils.data import get_data_loaders
    from ml_utils.evaluate import accuracy
    from ml_utils.model import ConvolutionalNeuralNetwork
    from ml_utils.json_write import write_epoch


def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)
    #NOTE: size of targe is [256]
    #       size of prediction is [256,10]
    #TODO: add function to adjust loss function
    #   will probably also have to adjust size
    #   depneding on the loss function

    #NOTE: for testing other loss functions
    #print("Target\n")
    #print(target)
    #print(target.size())
    #print("Prediction\n")
    #print(prediction)
    #print(prediction.size())
    #time.sleep(30)
    #print("batch")

    #NOTE: doesn't work
    #loss = F.multilabel_margin_loss(prediction, target)
    #loss = F.multilabel_soft_margin_loss(prediction, target)
    #loss = F.cosine_embedding_loss(prediction, target)
    #loss = F.hinge_embedding_loss(prediction, target)
    #loss = F.poisson_nll_loss(prediction, target)
    #loss = F.gaussian_nll_loss(prediction, target)
    
    #NOTE: works
    #loss = F.multi_margin_loss(prediction, target)
    #loss = F.nll_loss(prediction, target)
    loss = F.cross_entropy(prediction, target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()


def training(model: Module, optimizer: Optimizer, cuda: bool, n_epochs: int,
             batch_size: int):
    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    for epoch in range(n_epochs):
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target)
            #TODO: check for interrupt (probably a interrupt.lock)
            #TODO: if interrupt signal present (interrupt.lock acquired)
            #TODO: break loop

        loss, test_accuracy = accuracy(model, test_loader, cuda)
        #TODO: acquire, stats.lock file

        #NOTE: first arg might become legacy but keep it for now
        write_epoch(0, test_accuracy, loss)
        #TODO: free stats.lock file
        #TODO: send update signal to frontend
        #   with index of new stats: "update" : index
        #TODO: check for interrupt signal
        #TODO: clear interrupt signal
        #TODO: break
        print(f'epoch={epoch}, test accuracy={test_accuracy}, loss={loss}')
    if cuda:
        empty_cache()
    #TODO: acquire model.lock
    #TODO: write model into a file
    #TODO: free model.lock
    #TODO: send update -1 signal
    torch.save(model.state_dict(), 'model.pth')
    print("TRAINING FINISHED")

    #
    #weights_m=model.get_weights()
    #for i in range(8):
    #    print(weights_m[i].shape)

#this function is NOT used by frontend
def main(seed):
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork(0)
    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    training(
        model=model,
        optimizer=opt,
        cuda=False,
        n_epochs=10,
        batch_size=256,
    )

#this function is used by frontend
def start_training(lr=0.3, momentum=0.5, dropout_r=0, batch_size=256,epoch =5, seed=0):
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork(dropout_r)
    opt = SGD(model.parameters(), lr=lr, momentum=momentum)
    training(
        model=model,
        optimizer=opt,
        cuda=False,
        n_epochs=epoch,
        batch_size=batch_size,
    )

if __name__ == "__main__":
    main(0)