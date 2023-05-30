import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch.optim import Optimizer, SGD

#relativity of files depends on usage
if __name__ == "__main__":
    from data import get_data_loaders
    from evaluate import accuracy
    from model import ConvolutionalNeuralNetwork
else: 
    from ml_utils.data import get_data_loaders
    from ml_utils.evaluate import accuracy
    from ml_utils.model import ConvolutionalNeuralNetwork

#couroutine and socket stuff
from fastapi import FastAPI, WebSocket
from random import choice, randint
import asyncio
import uvicorn

app = FastAPI()

#hasn't changed from the beginning
def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)
    loss = F.cross_entropy(prediction, target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()

def training(model: Module, optimizer: Optimizer, cuda: bool, n_epochs: int,
             batch_size: int, websocket: WebSocket):
    websocket.send_json(randint(1, 10))
    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    for epoch in range(n_epochs):
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target)
        loss, test_accuracy = accuracy(model, test_loader, cuda)
        #sends random integer back to frontend
        #should have been replaced with accuracy and loss 
        #but now abandoned because of streamlit animation support
        websocket.send_json({"channel": "acc",
                             "data":randint(1, 10)})
        #print(f'epoch={epoch}, test accuracy={test_accuracy}, loss={loss}')
    if cuda:
        empty_cache()


#this would be the app to run
@app.websocket("/sample")
async def training_send(websocket: WebSocket):
    print("awaited the websocket")
    await websocket.accept()
    manual_seed(0)
    np.random.seed(0)
    model = ConvolutionalNeuralNetwork()
    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    training(
        model=model,
        optimizer=opt,
        cuda=False,
        n_epochs=10,
        batch_size=256,
        websocket=websocket
    )

#old main function
'''
def main(seed):
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork()
    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    training(
        model=model,
        optimizer=opt,
        cuda=False,
        n_epochs=10,
        batch_size=256,
    )
'''

#runs training_send
def main():
     uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    main()
