#python3 control.py {PIN} {VALUE}
import sys
from util import is_raspberry
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
        try:
            pin = int(sys.argv[1])
            value = int(sys.argv[2])

            if is_raspberry():
                GPIO.setmode(GPIO.BCM)
                setup_digital(pin)
                digital_output(pin, value)
                state = get_digital_status(value)
                GPIO.cleanup()
                print({"result": True, "data": state})
        # except Exception as e:
        #     print({"result": False, "data": e})
        except Exception:
            pass
        finally:
            print({"result": False, "data": value})
            # print({"result": True, "data": 1 if value == 0 else 0})
