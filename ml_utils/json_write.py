import json
import os
import sys
import random

if __name__ == "__main__":
    from print_overwrite import print
else:
    from ml_utils.print_overwrite import print


#dictionary for testing and verifying
dictionary = {
    "loss": "1",
    "accuracy": "1",
    "train_loss" : "1",
    "train_accuracy" : "1",
    "learning_rate": "1",
    "momentum": "1",
    "dropout_rate": "1",
    "loss_function": "1",
    "epochs": "1",
    "batch_size": "1",
    "run": "1"
}

'''
    general interface for writing to json
    file specified with path

    assumes that the file in path is 
    either completely empty or contains list

    WARNING: make sure when clearing files 
    manually EVERYTHING is deleted
    otherwise will lead to parsing errors
'''
def write_json(data, path="data/epoch_data.json"):
    if empty_missing_file(path=path):
        listObj = {
            "loss": [],
            "accuracy": [],
            "train_accuracy": [],
            "train_loss": [],
            "learning_rate": [],
            "momentum": [],
            "dropout_rate": [],
            "loss_function": [],
            "epochs": [],
            "batch_size": [],
            "run": []
        }
    else:
        with open(path, "r") as file:
            listObj = json.load(file)

    for i in listObj.keys():
        listObj[i].append(data[i])
    json_object = json.dumps(listObj, indent=4)
    with open(path,"w") as file:
        file.write(json_object)
    print("LOG: WRITE SUCCESS")


'''
    nukes file
    be careful with this
'''
def clear_file(path="data/epoch_data.json"):
    open(path, "w").close()

'''
    clears everything except last element
    currently has epoch_data.json as default 
    arg, should likely be changed later
'''
def clear_history(path="data/epoch_data.json"):
    if empty_missing_file(path=path):
        return 0
    with open(path, "r") as file:
        epoch_list = json.load(file)
    for i in epoch_list.keys():
        epoch_list[i] = []
    epoch_list = json.dumps(epoch_list, indent=4)
    open(path, "w").close()
    with open(path, "w") as file:
        file.write(epoch_list)
    return

'''removes all elements in each array'''
def revert_history(path="data/epoch_data.json"):
    if empty_missing_file(path=path):
        return 0
    with open(path, "r") as file:
        epoch_list = json.load(file)
    if len(epoch_list["run"]) == 0:
        print("LOG: nothing to revert")
        return 0
    rev_epochs = epoch_list["run"].count(epoch_list["run"][-1])
    for keys in epoch_list.keys():
        epoch_list[keys] = epoch_list[keys][:-rev_epochs]
    epoch_list = json.dumps(epoch_list, indent=4)
    open(path, "w").close()
    with open(path, "w") as file:
        file.write(epoch_list)
    return 0
            
''' get the run number; used by training '''
def get_run_num(path="data/epoch_data.json"):
    if empty_missing_file(path=path) :
        return 0
    with open(path, "r") as file:
        epoch_list = json.load(file)
    if len(epoch_list["run"]) == 0:
        return 0
    return int(epoch_list["run"][-1])+1

''' returns 1 if missing or empty file '''
def empty_missing_file(path="data/epoch_data.json"):
    if not os.path.exists(path):
        open(path, "w").close()
        print("WARNING: file was missing")
        return 1
    if os.stat(path).st_size ==0:
        print("WARNING: file is empty")
        return 1
    return 0


''' verifying that data format is correct '''
def verify_data(path="data/epoch_data.json"):
    if empty_missing_file(path=path):
        return 0
    with open(path, "r") as file:
        try:
            data = json.load(file)
        except:
            raise Exception("ERROR: json corrupted")
            return 1

        if not isinstance(data, dict):
            raise Exception("ERROR: data is not a dictionary")
            return 1

        try:
            num_elems= len(data["run"])
        except:
            raise Exception("ERROR: json corrupted; run missing")
            return 1

        try:
            for key in dictionary.keys():
                if len(data[key]) != num_elems:
                    raise Exception("ERROR: json corrupted; index error")
                    return 1
        except:
            raise Exception("ERROR: json corrupted; missing key")
            return 1

    print("LOG: verifying data SUCCESS!")


'''
    WARNING: File path should be relativ
    from where you start the program

    if you use the default values given
    on epoch_data.json then start
    in the same directory as the 
    file epoch_data.json

    exectue the file with
    $ python ml_utils/json_write.py

    this block is for testing
    and for clearing file
'''
if __name__ == "__main__":
    #input arg 4, 1, -1, -2, -3 to:
    # verify, add, nuke, clear, revert

    #test dictionary
    match int(sys.argv[1]):
        case 2:
            print("LOG: verifying data")
            verify_data()
        case 1:
            print("LOG: trying to write data")
            write_json(dictionary)
        case -1:
            print("LOG: file cleared")
            clear_file()
        case -2:
            print("LOG: history cleared")
            clear_history()
        case -3:
            print("LOG: revert history")
            revert_history()
