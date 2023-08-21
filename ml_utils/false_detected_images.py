import os
import numpy as np
import torch
import torch.nn.functional as F
from torch.autograd import Variable
from torch.nn import Module
from torch.utils.data import DataLoader
from PIL import Image, ImageDraw, ImageFont

# Global dictionary to store false detected images
false_detected_dict = {i: {} for i in range(10)}
false_detected_images_data = []

loss_func = [F.cross_entropy, F.multi_margin_loss, F.multilabel_soft_margin_loss,
             F.soft_margin_loss, F.l1_loss, F.smooth_l1_loss, F.poisson_nll_loss]


def save_false_detected_images(loss_nr, model: Module, loader: DataLoader, cuda: bool) -> (float, float):
    model.eval()
    losses = []
    bcounter = 0
    correct = 0
    false_detections = []  # List to store the false detected images' information
    batches = len(loader)
    with torch.no_grad():
        for index, data, target in loader:  # Adjusted unpacking here
            if cuda:
                data, target = data.cuda(), target.cuda()
            data, target = Variable(data), Variable(target)
            output = model(data)
            target_input = target
            if loss_nr > 1:
                target_input = F.one_hot(target,10)
            losses.append(loss_func[loss_nr](output, target_input).item())
            pred = output.data.max(1, keepdim=True)[1]
            correct += pred.eq(target.data.view_as(pred)).cpu().sum().item()

            false_indices = np.where(correct == 0)[0]
            for idx in false_indices:
                false_info = {
                    'index': index[idx].item(),  # Use the index directly
                    'actual_label': target.data[idx].item(),
                    'predicted_label': pred[idx].item(),
                    'image': data[idx]  #images as tensor
                }
                false_detections.append(false_info)



    return false_detections
