import json
import os
import sys
import random
from time import sleep

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
#-----------------general functions---------------#

'''
    nukes file
    be careful with this
'''
def clear_file(path):
    open(path, "w").close()



'''
returns 1 if missing or empty file 
if you want to only check and not create
file pass create=0 to func
'''
def empty_missing_file(path, create=1):
    if not os.path.exists(path) and create:
        open(path, "w").close()
        print("WARNING: file was missing")
        return 1
    if os.stat(path).st_size ==0:
        print(f"WARNING: file is empty {path}")
        return 1
    return 0

#-----------------epoch_data functions--------------#

'''
    general interface for writing to json
    file specified with path

    assumes that the file in path is 
    either completely empty or contains a dict
'''
def write_json(data, path):
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
clears data associated to a run 
for all keys
'''
def revert_history(path):
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
def get_run_num(path):
    if empty_missing_file(path=path) :
        return 0
    with open(path, "r") as file:
        epoch_list = json.load(file)
    if len(epoch_list["run"]) == 0:
        return 0
    return int(epoch_list["run"][-1])+1


''' verifying that data format is correct '''
def verify_data(path):
    if empty_missing_file(path=path):
        return 0
    with open(path, "r") as file:
        try:
            data = json.load(file)
            num_elems= len(data["run"])
            for key in dictionary.keys():
                if num_elems == 0 and len(data[key])==num_elems:
                    continue
                elif num_elems == 0:
                    raise
                if data[key][num_elems-1] == "nan":
                    raise
                else:
                    continue
        except:
            print("ERROR: epoch data corrupted")
            return 1
    print("LOG: verifying epoch data SUCCESS!")
    return 0


#---------------Testing------------------#

'''
    WARNING: File path should be relativ
    from where you start the program

    if you use the default values given
    on _epoch_data.json then start
    in the same directory as the 
    file epoch_data.json

    exectue the file with
    $ python ml_utils/json_write.py

    this block is for testing
    and for clearing file
'''
if __name__ == "__main__":
    #input arg 2, 1, -1, -2, -3 to:
    # verify, add, nuke, clear, revert

    #test dictionary
    match int(sys.argv[1]):
        case 2:
            print("LOG: verifying data")
            verify_data("data/_epoch_data.json")
        case 1:
            print("LOG: trying to write data")
            write_json(dictionary)
        case -1:
            print("LOG: file cleared")
            clear_file("data/_epoch_data.json")
        case -2:
            print("LOG: history cleared")
            clear_history("data/_epoch_data.json")
        case -3:
            print("LOG: revert history")
            revert_history("data/_epoch_data.json")
