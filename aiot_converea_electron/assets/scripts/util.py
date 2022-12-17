import platform

def is_raspberry():
    return platform.machine() == "armv7l"