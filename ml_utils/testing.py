from PIL import Image
import torch
import cv2
import numpy as np
from torchvision import transforms
from ml_utils.model import ConvolutionalNeuralNetwork
import os
from ml_utils.print_overwrite import print



def test_drawing(revert):
    # Lade das trainierte Modell
    model = ConvolutionalNeuralNetwork(dropout_rate=0)  # Passe den dropout_rate-Wert entsprechend an
    if not revert and os.path.exists('data/model_new.pt'):
        model.load_state_dict(torch.load('data/model_new.pt'))
    elif os.path.exists('data/model.pt'):
        model.load_state_dict(torch.load('data/model.pt'))
    else:
        print("LOG: there is no model to evaluate")

    model.eval()

    # Lade und transformiere das Bild
    image = Image.open('static/img.jpg').convert('RGB')
    gray_image = image.convert('L')

    np_image = np.array(gray_image)

    contours, _ = cv2.findContours(np_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    largest_contour = max(contours, key=cv2.contourArea)

    # Calculate the bounding box of the largest contour
    x, y, w, h = cv2.boundingRect(largest_contour)

    # Define the region of interest coordinates based on the bounding box
    roi_top_left = (x, y)
    roi_width = w
    roi_height = h

    # Crop the grayscale image to extract the region of interest
    roi_image = gray_image.crop((roi_top_left[0], roi_top_left[1], roi_top_left[0] + roi_width, roi_top_left[1] + roi_height))

    transform = transforms.Compose([
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize(mean=(0.1307,), std=(0.3081,))
    ])
    image = transform(roi_image)

    # Führe die Vorhersage durch
    with torch.no_grad():
        prediction = model(image.unsqueeze(0))  # Unsqueeze, um eine Batch-Dimension hinzuzufügen
        predicted_class = torch.argmax(prediction, dim=1).item()

    os.remove('static/img.jpg')

    return str(predicted_class)
