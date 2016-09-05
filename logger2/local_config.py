import socket

# Specify a custom username here if desired. If not, the PC name will be used.

CUSTOM_USERNAME = None

#################################################################
#################################################################

if CUSTOM_USERNAME is not None:
    USERNAME = CUSTOM_USERNAME
else:
    USERNAME = socket.gethostname()
