import os
import numpy as np
import torch
import torch.nn.functional as F
from torch.autograd import Variable
from torch.nn import Module
from torch.utils.data import DataLoader

from PIL import Image
import common_dict
import torchvision.transforms as transforms
from ml_utils.model import ConvolutionalNeuralNetwork

from ml_utils.data_beta import get_data_loaders

loss_func = [F.cross_entropy, F.multi_margin_loss, F.multilabel_soft_margin_loss,
             F.soft_margin_loss, F.l1_loss, F.smooth_l1_loss, F.poisson_nll_loss]


def resize_tensor_image(tensor_image, new_size=(280, 280)):
    # Convert tensor to PIL image
    pil_image = transforms.ToPILImage()(tensor_image)

    #  .NEAREST for exact pixel duplication.
    pil_image_resized = pil_image.resize(new_size, Image.BICUBIC)

    return transforms.ToTensor()(pil_image_resized)


def save_false_detected_images(loss_nr, model: Module, loader: DataLoader, cuda: bool,train_loader: DataLoader = None) -> (dict):

    model.eval()
    losses = []
    correct = 0
    processed_images_count = 0  # total images counter



    if common_dict.false_detected_dict:
        common_dict.false_detected_dict.clear()


    with torch.no_grad():
        for index, img, target in loader:
            data = img
            target = target

            processed_images_count += len(data)


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
            if train_loader is not None and loader == train_loader:
                for j, individual_index in enumerate(index):  # Enumerate through index
                    if pred[j] != target[j]:
                        image_tensor_original = data[j].cpu()
                        image_tensor = resize_tensor_image(image_tensor_original)

                        # tensors to int`.item()`
                        label = target[j].item()
                        prediction = pred[j].item()

                        # Use individual_index for the unique identifier
                        index_val = individual_index

                        image_info = {
                            'index': index_val,
                            'image_tensor': image_tensor,
                            'label': label,
                            'prediction': prediction
                        }

                        # index_val as the key
                        common_dict.false_detected_dict[index_val] = image_info
                        print("Image",index_val, "was falsly detected")


    print(f"Total processed images: {processed_images_count}")  # Total number of images processed
    return common_dict.false_detected_dict

def init_model(model_name, model):
    if os.path.exists(f'data/{model_name}_model_new.pt'):
        model.load_state_dict(torch.load(f'data/{model_name}_model_new.pt'))
    elif os.path.exists(f'data/{model_name}_model.pt'):
        model.load_state_dict(torch.load(f'data/{model_name}_model.pt'))
    else:
        print("LOG: there is no model to evaluate")
        return -1, -1

    return model

def start_false_detected(name,params):

    model = ConvolutionalNeuralNetwork(float(params["dropout_rate"]))
    model = init_model(name, model)
    cuda = False
    if os.path.exists("data/CUDA.conf"):
        cuda = True
    loss_nr = int(params["loss_function"])
    batch_size = int(params["batch_size"])

    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    return save_false_detected_images(loss_nr, model, train_loader, cuda,train_loader=train_loader)


