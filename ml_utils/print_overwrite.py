import os
import builtins

conf_show_logs = 0

'''
instead of checking every print for file
the conf_show_logs variable is initialized
at the start, defining if logs will be show
throughout the entire instance of the program
'''
def init_print():
    if os.path.exists("data/DEV.conf"):
        global conf_show_logs
        conf_show_logs=1
'''
prints logs only if data/DEV.conf exits
warnings and errors are always printed
'''
def print(message):
    warning = (message[0:7]=="WARNING")
    error = (message[0:5]=="ERROR")
    if conf_show_logs or error or warning:
        builtins.print(message)

if __name__ == "__main__":
    print("WARNING:testing")
    print("ERROR:testing")
    print("LOG:testing")
