import json
import os
import sys
import random


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
    if not isinstance(data, dict):
        print("ERROR: data to be written is not a dictionary")
        return 
    if not os.path.exists(path):
        open(path, "w").close()
    if os.stat(path).st_size == 0:
        listObj =[]
    else:
        with open(path, "r") as file:
            listObj = json.load(file)
    listObj.append(data)
    json_object = json.dumps(listObj, indent=4)
    with open(path,"w") as file:
        file.write(json_object)
    print("WRITE SUCCESS")


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
    if not os.path.exists(path):
        print("WARNING: file doesn't exists")
        return
    if os.stat(path).st_size == 0:
        print("WARNING: file already empty")
        return
    with open(path, "r") as file:
        epoch_list = json.load(file)
    epoch_list = epoch_list[-1:]
    epoch_list = json.dumps(epoch_list, indent=4)
    open(path, "w").close()
    with open(path, "w") as file:
        file.write(epoch_list)
    return

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
    #input arg 1, -1 or -2 to:
    #add, nuke, clear

    #test dict
    dictionary = {
        "epoch": 0,
        "loss": random.randint(0,100),
        "accuracy":random.randint(0,100)
        }

    match int(sys.argv[1]):
        case 1:
            print("trying to write data")
            write_json(dictionary)
        case -1:
            print("file cleared")
            clear_file()
        case -2:
            print("history cleared")
            clear_history()
