from ml_utils import data_beta
import sys, json
sys.path.append('UML12-9shab') # IMPORTANT  always use absolute root path here
print(sys.path)

from common_dict import user_modified_labels

def print_test_data():
    _,test_loader = data_beta.get_data_loaders(1)  # Setting batch_size to 1 to get one sample at a time

    for index, _, label in test_loader:
        print(f"Index: {index.item()}, Label: {label.item()}")

def print_train_data():
    train_loader,_ = data_beta.get_data_loaders(1)  # Setting batch_size to 1 to get one sample at a time

    for index, _, label in train_loader:
        print(f"Index: {index.item()}, Label: {label.item()}")


if __name__ == '__main__':

    #print_train_data()
    print_test_data()
    #print(user_modified_labels)



