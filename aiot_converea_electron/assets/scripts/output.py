#python3 control.py {PIN} {VALUE}
import sys
from util import is_raspberry
import json
if is_raspberry():
    import RPi.GPIO as GPIO

def setup_digital(pin):
    if is_raspberry():
        GPIO.setup(pin, GPIO.OUT)

def setup_digital(pin):
    if is_raspberry():
        GPIO.setup(pin, GPIO.OUT)

def digital_output(pin, value):
    if is_raspberry():
        GPIO.output(pin, value)

def get_digital_status(pin):
    try:
        if is_raspberry():
            return GPIO.input(pin)
    finally:
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pin = int(sys.argv[1])
        value = int(sys.argv[2])
        try:
            if is_raspberry():
                GPIO.setmode(GPIO.BCM)
                setup_digital(pin)
                digital_output(pin, value)
                state = get_digital_status(value)
                GPIO.cleanup()
                print(json.dumps({
                    "result": True,
                    "data": state
                }))
            else:
                print(json.dumps({
                    "result": False,
                    "data": value
                }))
        except Exception:
            pass
