#python3 control.py {PIN} {VALUE}
import sys
import platform
if platform.machine() == "armv7l":
    import RPi.GPIO

print(sys.argv, platform.machine())
def is_raspberry():
    return platform.machine() == "armv7l"

def setup_digital(pin):
    a = 2

def digital_output(pin, value):
    a = 2

def get_digital_staus(pin):
    return pin

if len(sys.argv) > 1:
    try:
        pin = int(sys.argv[1])
        value = int(sys.argv[2])

        setup_digital(pin)
        digital_output(pin, value)
        state = get_digital_staus(value)
        print({"result": True, "data": state})

    except ex as Exception:
        print({"result": False, "data": ex})
