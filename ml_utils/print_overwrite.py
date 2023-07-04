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
        print("ERROR: failed to slice object. Convert your object to string first")

if __name__ == "__main__":
    init_print()
    print("WARNING:testing")
    print("ERROR:testing")
    print("LOG:testing")
