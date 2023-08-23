import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
import torch
from torch.optim import Optimizer, SGD
import time, os, math


from data_beta import get_data_loaders,update_test_labels
import sys
sys.path.append('/Users/kian/zusatztaufgabe-usable-ml')
from common import user_modified_labels


def print_test_data():
    _, test_loader = get_data_loaders(batch_size=1)  # Setting batch_size to 1 to get one sample at a time

    for index, _, label in test_loader:
        print(f"Index: {index.item()}, Label: {label.item()}")


if __name__ == '__main__':
    update_test_labels(user_modified_labels)
    print_test_data()

