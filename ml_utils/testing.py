from PIL import Image
import torch
from torchvision import transforms
from ml_utils.model import ConvolutionalNeuralNetwork
import os
from ml_utils.print_t import print_t

def test_drawing(revert):
    # Lade das trainierte Modell
    model = ConvolutionalNeuralNetwork(dropout_rate=0)  # Passe den dropout_rate-Wert entsprechend an
    if not revert and os.path.exists('data/model_new.pt'):
        model.load_state_dict(torch.load('data/model_new.pt'))
    elif os.path.exists('data/model.pt'):
        model.load_state_dict(torch.load('data/model.pt'))
    else: 
        print_t("LOG: there is no model to evaluate")

    model.eval()

    # Lade und transformiere das Bild
    image = Image.open('static/img.jpg').convert('L')
    transform = transforms.Compose([
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize(mean=(0.1307,), std=(0.3081,))
    ])
    image = transform(image)

    # Führe die Vorhersage durch
    with torch.no_grad():
        prediction = model(image.unsqueeze(0))  # Unsqueeze, um eine Batch-Dimension hinzuzufügen
        predicted_class = torch.argmax(prediction, dim=1).item()

    os.remove('static/img.jpg')

    return str(predicted_class)
