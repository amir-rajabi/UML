import torch.nn as nn


#The default model
#dropout rate is currently after
#first and second hidden layer

#TODO: give more possibility to decide where 
#to adjust the dropout rate
#or just say that the default model has only one
#dropout rate layer and allow for further 
#customization in model creator
class ConvolutionalNeuralNetwork(nn.Module):

    def __init__(self,dropout_rate):
        super(ConvolutionalNeuralNetwork, self).__init__()
        self.convolutional_layers = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Conv2d(1, 16, kernel_size=8, stride=2, padding=2),
            nn.Tanh(),
            nn.MaxPool2d(kernel_size=2, stride=1),
            nn.Conv2d(16, 32, kernel_size=4, stride=2, padding=0),
            nn.Tanh(),
            nn.MaxPool2d(kernel_size=2, stride=1),
            nn.Dropout(dropout_rate)
        )
        self.linear_layers = nn.Sequential(
            nn.Linear(512, 32),
            nn.Tanh(),
            nn.Linear(32, 10),
        )

    def forward(self, x):
        x = self.convolutional_layers(x)
        x = x.view(x.size(0), -1)
        x = self.linear_layers(x)
        return x
