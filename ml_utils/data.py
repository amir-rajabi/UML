# authors:       Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
# institution:   Freie Universität Berlin
# institute:     Institut für Informatik
# module:        SWP - Usable Machine Learning
# year:          2023

from PIL import Image
from torch.utils.data import DataLoader
import torchvision
import torch
from torchvision import datasets, transforms


class MNIST(datasets.MNIST):
    def __init__(self, *args, **kwargs):
        super(MNIST, self).__init__(*args, **kwargs)

    def __getitem__(self, index):
        img, target = super(MNIST, self).__getitem__(index)
        return index, img, target


def get_data_loaders(batch_size):
    # Data transformation
    transform = torchvision.transforms.Compose([
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Normalize(mean=(0.1307,),
                                             std=(0.3081,))
        ])

    # MNIST datasets
    train_dataset = MNIST('./data', train=True, download=True, transform=transform)
    test_dataset = MNIST('./data', train=False, download=True, transform=transform)

    # Data loaders
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    return train_loader, test_loader
