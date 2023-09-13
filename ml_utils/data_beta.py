# authors:       Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
# institution:   Freie Universität Berlin
# institute:     Institut für Informatik
# module:        SWP - Usable Machine Learning
# year:          2023

from PIL import Image
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import json, os, common_dict,torch,torchvision
import re

ROOT_PATH = os.path.dirname(os.path.abspath('config.py'))
MODIFICATIONS_FILE = os.path.join(ROOT_PATH, 'modifications.json')


class MNIST_beta(datasets.MNIST):
    def __init__(self, *args, **kwargs):
        super(MNIST_beta, self).__init__(*args, **kwargs)

        self.new_images = []
        self.new_labels = []

        folder_path = os.path.join(os.getcwd(), 'New Test Images')
        if not self.train:
            for filename in os.listdir(folder_path):
                if filename.endswith('.png'):
                    match = re.search(r'.{32}(\d)\.png$', filename)
                    if match:
                        label = int(match.group(1))
                        image_path = os.path.join(folder_path, filename)
                        image = Image.open(image_path).convert('L')
                        self.new_images.append(image)
                        self.new_labels.append(label)
                    else:
                        print(f"Filename {filename} did not match the pattern")

    def __len__(self):
        return super(MNIST_beta, self).__len__() + len(self.new_images)

    def __getitem__(self, index):
        self.modifications = load_modifications()

        if index < super(MNIST_beta, self).__len__():
            img, target = super(MNIST_beta, self).__getitem__(index)
        else:
            img = self.new_images[index - super(MNIST_beta, self).__len__()]
            target = self.new_labels[index - super(MNIST_beta, self).__len__()]
            img = torchvision.transforms.ToTensor()(img)
            img = torchvision.transforms.Normalize(mean=(0.1307,), std=(0.3081,))(img)

        # Apply the modification if the index is in the modifications list
        if str(index) in self.modifications:  # JSON keys are strings
            modified_label = int(self.modifications[str(index)])  # Convert back to int
            target = torch.tensor(modified_label, dtype=torch.long)  # Convert to tensor

        return index, img, target


def get_data_loaders(batch_size):
    # Data transformation
    transform = torchvision.transforms.Compose([
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Normalize(mean=(0.1307,),
                                             std=(0.3081,))
        ])

    # MNIST datasets
    train_dataset = MNIST_beta('./data', train=True, download=True, transform=transform)
    test_dataset = MNIST_beta('./data', train=False, download=True, transform=transform)

    # Print the total number of images in the test dataset
    print(f"Total number of images in the test dataset: {len(test_dataset)}")

    # Data loaders
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=False)
    test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    return train_loader, test_loader


def save_modifications(index_label_mapping, filename=MODIFICATIONS_FILE):
    with open(filename, 'w') as file:
        json.dump(index_label_mapping, file)



def load_modifications(filename=MODIFICATIONS_FILE):
    try:
        with open(filename, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {}



#Adjust the update_test_labels function to both modify in-memory and save the modifications.
#get the index_label_mapping in form {5: 3, 100: 8, 150: 2, ...} and save the changes to this data set.
def update_training_labels(index_label_mapping, batch_size):
    train_loader, _ = get_data_loaders(batch_size=batch_size)

    for batch_indices, _, targets in train_loader:
        for idx, new_label in index_label_mapping.items():
            # Check if idx is in the current batch of indices
            if idx in batch_indices.tolist():
                position_in_batch = (
                            batch_indices == idx).nonzero().item()  # get the position of idx within the current batch
                targets[position_in_batch] = new_label

    # Save modifications to disk
    current_modifications = load_modifications()
    current_modifications.update(
        {str(k): v for k, v in index_label_mapping.items()})  # Convert keys to strings for JSON
    save_modifications(current_modifications)


def clear_modifications(filename=MODIFICATIONS_FILE):
    with open(filename, 'w') as file:
        json.dump({}, file)
    for entry in common_dict.false_detected_dict.values():
        entry.pop('actual_label', None)  # removes 'actual_label' if it exists, otherwise does nothing
        # Clear user_modified_labels
    common_dict.user_modified_labels.clear()


