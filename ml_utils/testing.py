from PIL import Image
import torch
import cv2
import numpy as np
from torchvision import transforms
from ml_utils.model import ConvolutionalNeuralNetwork
import os
from ml_utils.print_overwrite import print
import matplotlib.pyplot as plt
from PIL import Image, ImageOps



def test_drawing(model_name):
    # Lade das trainierte Modell
    model = ConvolutionalNeuralNetwork(dropout_rate=0)  # Passe den dropout_rate-Wert entsprechend an
    if os.path.exists(f'data/{model_name}_model_new.pt'):
        model.load_state_dict(torch.load(f'data/{model_name}_model_new.pt'))
    elif os.path.exists(f'data/{model_name}_model.pt'):
        model.load_state_dict(torch.load(f'data/{model_name}_model.pt'))
    else:
        print("LOG: there is no model to evaluate")
        return -1, -1

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

    padding_size = max(roi_width//4 , roi_height//4)  # Adjust the padding size as desired
    padded_roi_image = ImageOps.expand(roi_image, padding_size, fill='black')

    # Convert the PIL image to OpenCV format (numpy array)
    roi_np_image = np.array(padded_roi_image)

    # Apply dilation to thicken the lines
    kernel_size = max(roi_width//2 , roi_height//2)//12  # Adjust the kernel size for desired thickness
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    dilated_image = cv2.dilate(roi_np_image, kernel, iterations=1)


    dilated_roi_image = Image.fromarray(dilated_image)
    
    #FOR OUTPUT
    output_img = dilated_roi_image
    transform_for_output = transforms.Compose([
        transforms.Resize((140, 140)),
        transforms.ToTensor(),
        transforms.Normalize(mean=(0.1307,), std=(0.3081,))
    ])
    for_output = transform_for_output(output_img)

    transform = transforms.Compose([
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize(mean=(0.1307,), std=(0.3081,))
    ])
    image = transform(dilated_roi_image)


    np_image_2 = image.numpy()
    np_image_2 = np_image_2.reshape((28, 28))


    output_img = for_output.numpy()
    output_img = output_img.reshape((140, 140))
    output_img = (output_img - np.min(output_img)) / (np.max(output_img) - np.min(output_img))  # Normalisieren der Werte auf den Bereich 0-1
    output_img = (output_img * 255).astype(np.uint8)  # Skalieren der Werte auf den Bereich 0-255

    pil_image = Image.fromarray(output_img)
    pil_image.save('static/images/output.png')

    # Führe die Vorhersage durch
    with torch.no_grad():
        prediction = model(image.unsqueeze(0))
        probabilities = torch.softmax(prediction, dim=1)
        predicted_class = torch.argmax(prediction, dim=1).item()
        confidence = probabilities[0, predicted_class].item()

    os.remove('static/img.jpg')

    return str(predicted_class), str(confidence)
