import os
import numpy as np
import torch
import torch.nn.functional as F
from torch.autograd import Variable
from torch.nn import Module
from torch.utils.data import DataLoader

from PIL import Image, ImageDraw, ImageFont
from typing import List, Dict, Union
import common
import torchvision.transforms as transforms
from torch import manual_seed, Tensor
from ml_utils.model import ConvolutionalNeuralNetwork
from torch.optim import Optimizer, SGD

#from ml_utils.data_beta import get_data_loaders
from ml_utils.data import get_data_loaders

loss_func = [F.cross_entropy, F.multi_margin_loss, F.multilabel_soft_margin_loss,
             F.soft_margin_loss, F.l1_loss, F.smooth_l1_loss, F.poisson_nll_loss]

stop_flag_fdi = False



def resize_tensor_image(tensor_image, new_size=(280, 280)):
    # Convert tensor to PIL image
    pil_image = transforms.ToPILImage()(tensor_image)

    #  .NEAREST for exact pixel duplication.
    pil_image_resized = pil_image.resize(new_size, Image.BICUBIC)

    return transforms.ToTensor()(pil_image_resized)


def save_false_detected_images(loss_nr, model: Module, loader: DataLoader, cuda: bool,test_loader: DataLoader = None) -> (dict):

    model.eval()
    losses = []
    correct = 0

    # Create a directory to save the false detected images
    output_dir = "static/false_detected_images"
    if common.false_detected_dict:
        common.false_detected_dict.clear()

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with torch.no_grad():
        for index, img, target in loader:

            if stop_flag_fdi:
                break

            data = img
            target = target

            if cuda:
                data, target = data.cuda(), target.cuda()
            data, target = Variable(data), Variable(target)
            output = model(data)
            target_input = target
            if loss_nr > 1:
                target_input = F.one_hot(target, 10)
            losses.append(loss_func[loss_nr](output, target_input).item())
            pred = output.data.max(1, keepdim=True)[1]
            correct += pred.eq(target.data.view_as(pred)).cpu().sum().item()

            # Save false detected images
            if test_loader is not None and loader == test_loader:
                for j, individual_index in enumerate(index):  # Enumerate through index
                    if pred[j] != target[j]:
                        image_tensor_original = data[j].cpu()
                        image_tensor = resize_tensor_image(image_tensor_original)

                        image = image_tensor.cpu().numpy().squeeze()

                        if not np.isfinite(image).all():
                            print(f"Non-finite values detected in image for index {individual_index}.")
                            continue  # Skip this iteration

                        image = (image * 255).astype(np.uint8)
                        image = Image.fromarray(image)

                        # tensors to int`.item()`
                        label = target[j].item()
                        prediction = pred[j].item()

                        # Use individual_index for the unique identifier
                        index_val = individual_index.item()

                        image_info = {
                            'index': index_val,  # Storing the index value in the dict
                            'image_tensor': image_tensor,
                            'label': label,
                            'prediction': prediction
                        }



                        # Directly save the image info with index_val as the key
                        common.false_detected_dict[index_val] = image_info

                        # Resize the image
                        image_size = (224, 224)
                        image = image.resize(image_size)

                        # Add label and prediction as comments
                        draw = ImageDraw.Draw(image)
                        font = ImageFont.load_default()
                        fill_color = 255  # Use 255 as the fill color (white text)
                        comment = f"Index: {index_val}, Label: {label}, Prediction: {prediction}"

                        draw.text((10, 10), comment, fill=fill_color, font=font)

                        image_name = f"false_detected_images/{label}_{index_val}th_{label}predicted{prediction}.png"
                        image_path = f"static/{image_name}"
                        image_info['path'] = image_path
                        image.save(image_path)
    #debug assertion
    for key, value in common.false_detected_dict.items():
        if 'image_tensor' not in value:
            print(f"Key: {key}, Value: {value}")

    #  original assertion
    for key, value in common.false_detected_dict.items():
        assert 'image_tensor' in value, f"'image_tensor' key missing for entry: {key}"

    return common.false_detected_dict

def init_model(model_name, model):
    if os.path.exists(f'data/{model_name}_model_new.pt'):
        model.load_state_dict(torch.load(f'data/{model_name}_model_new.pt'))
    elif os.path.exists(f'data/{model_name}_model.pt'):
        model.load_state_dict(torch.load(f'data/{model_name}_model.pt'))
    else:
        print("LOG: there is no model to evaluate")
        return -1, -1

    return model


def stop_false_detected():
    global stop_flag_fdi
    stop_flag_fdi = True



def start_false_detected(name, data, params):

    model = ConvolutionalNeuralNetwork(float(params["dropout_rate"]))
    model = init_model(name, model)
    cuda = False
    if os.path.exists("data/CUDA.conf"):
        cuda = True
    loss_nr = int(params["loss_function"])
    batch_size = int(params["batch_size"])

    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    return save_false_detected_images(loss_nr, model, test_loader, cuda,test_loader=test_loader)


