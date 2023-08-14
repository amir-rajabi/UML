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


def save_false_detected_images(loss_nr, model: Module, loader: DataLoader, cuda: bool,
                               test_loader: DataLoader = None) -> (float, float):
    model.eval()
    losses = []
    output_dir = "static/false_detected_images"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with torch.no_grad():
        for i, (data, target) in enumerate(loader):

            if cuda:
                data, target = data.cuda(), target.cuda()
            data, target = Variable(data), Variable(target)
            output = model(data)
            pred = output.data.max(1, keepdim=True)[1]

            # Save false detected images
            if test_loader is not None and loader == test_loader:
                for j in range(len(target)):
                    if pred[j] != target[j]:
                        image_data = data[j]
                        image = data[j].cpu().numpy().squeeze()
                        image = (image * 255).astype(np.uint8)
                        image = Image.fromarray(image)
                        label = target[j].item()
                        prediction = pred[j].item()
                        false_detected_images_data.append((image_data, label, prediction))

                        # Store information in the dictionary
                        image_info = {
                            'path': output_dir,  # Replace with actual image path
                            'label': label,
                            'prediction': prediction
                        }
                        if j not in false_detected_dict[label]:
                            false_detected_dict[label][j] = image_info

                        # Resize the image
                        image_size = (224, 224)
                        image = image.resize(image_size)

                        # Add label and prediction as comments
                        draw = ImageDraw.Draw(image)
                        font = ImageFont.load_default()
                        fill_color = 255  # Use 255 as the fill color (white text)
                        comment = f"Index: {j}, Label: {label}, Prediction: {prediction}"

                        draw.text((10, 10), comment, fill=fill_color, font=font)

                        image_name = f"false_detected_images/{label}_{j}th_{label}predicted{prediction}.png"
                        image_path = f"static/{image_name}"
                        image_info['path'] = image_path
                        image.save(image_path)

    # Extract tensors and information from the list
    false_detected_images_tensors = torch.stack([img for img, _, _ in false_detected_images_data])
    false_detected_labels_tensors = torch.tensor([label for _, label, _ in false_detected_images_data])
    false_detected_predictions_tensors = torch.tensor([prediction for _, _, prediction in false_detected_images_data])

    # Calculate the total number of images saved in false_detected_dict
    total_images = sum(len(images) for images in false_detected_dict.values())
    print(f"Total number of images saved: {total_images}")
    print("THIS IS MY DICT:", false_detected_dict)

    return false_detected_images_tensors, false_detected_labels_tensors, false_detected_predictions_tensors

