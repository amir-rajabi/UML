import os

'''
prints logs only if data/DEV.conf exits
warnings and errors are always printed
'''
def print_t(message):
    warning = (message[0:7]=="WARNING")
    error = (message[0:5]=="ERROR")
    if os.path.exists("data/DEV.conf") or error or warning:
        print(message)

if __name__ == "__main__":
    print_t("WARNING:testing")
    print_t("ERROR:testing")
    print_t("LOG:testing")
