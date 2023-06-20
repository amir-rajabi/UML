import os
import builtins

'''
prints logs only if data/DEV.conf exits
warnings and errors are always printed
'''
def print(message):
    warning = (message[0:7]=="WARNING")
    error = (message[0:5]=="ERROR")
    if os.path.exists("data/DEV.conf") or error or warning:
        builtins.print(message)

if __name__ == "__main__":
    print("WARNING:testing")
    print("ERROR:testing")
    print("LOG:testing")
