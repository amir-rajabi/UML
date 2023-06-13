import json
import os
import sys
import random

#more general interface to writing
#into a json file
#might get useful with mutliplte 
#json file, like for saving 
#param data
def write_json(path, data):

    # NOTE: epoch_data.json has to exists
    #   will otherwise error
    #if file is empty it starts a list
    if os.stat(path).st_size == 0:
        listObj =[]
    #otherwise loads the json which is
    #already a list if it exists
    else:
        with open(path, "r") as file:
            listObj = json.load(file)
    listObj.append(data)
    json_object = json.dumps(listObj, indent=4)
    with open(path,"w") as outfile:
        outfile.write(json_object)
    

#writes specifically into epoch_data.json
def write_epoch(epoch, loss, accuracy):
    dictionary = {
        "epoch": epoch,
        "loss": loss,
        "accuracy": accuracy
            }
    write_json("epoch_data.json", dictionary)

#be carefull with this
def clear_file():
    open("epoch_data.json", "w").close()


'''
    DO NOT START THIS FILE IN "."
    this file is currenlty meant to be used in
    the directory ..
    so if you want to execute main you
    exectue the file with
    $ python ml_utils/json_write.py

    epoch_data.json has to exists
'''
if __name__ == "__main__":
    match len(sys.argv):
        case 2:
            if int(sys.argv[1]) == -1:
                clear_file()
        case _:
            write_epoch(2,random.randint(0,9),random.randint(0,9))
