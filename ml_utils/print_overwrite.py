# authors:       Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
# institution:   Freie Universität Berlin
# institute:     Institut für Informatik
# module:        SWP - Usable Machine Learning
# year:          2023

import os
import builtins

conf_show_logs = 0

'''this should never pop up'''
def default_error(code, message):
    builtins.print(f"code={code}: you should not be seeing this [f{message}]")
    return

error_function=default_error

'''
instead of checking every print for file
the conf_show_logs variable is initialized
at the start, defining if logs will be show
throughout the entire instance of the program

this with the error_func could've been used to
always send alerts to frontend on warning on
error, but isn't
'''
def init_print(error_func):
    global error_function
    error_function = error_func
    if os.path.exists("data/DEV.conf"):
        global conf_show_logs
        conf_show_logs=1
'''
prints logs only if data/DEV.conf exits
warnings and errors are always printed
'''
def print(message, flag=0):
    ''' use optional flag input if you're trying to print 
    something that isn't a string to buypass the slice
    and print it directly '''
    if flag:
        builtins.print(message)
    try:
        warning = (message[0:7]=="WARNING")
        error = (message[0:5]=="ERROR")
        if conf_show_logs or error or warning:
            builtins.print(message)
    except:
        error_function(3,"ERROR: Something is wrong in the backend, check logs")
        builtins.print("ERROR: failed to slice object. Convert your object to string first")

if __name__ == "__main__":
    init_print(default_error)
    print("WARNING:testing")
    print("ERROR:testing")
    print("LOG:testing")
