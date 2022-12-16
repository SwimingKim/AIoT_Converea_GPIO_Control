#python3 control.py {PIN} {VALUE}
import sys
import RPi.GPIO

print(sys.argv)
GPIO.setmode(GPIO.BCM)

def setup_digital(pin):
    GPIO.setup(pin, GPIO.OUT)

def digital_output(pin, value):
    GPIO.output(pin, value)

def digital_on(pin):
    print("digital_on", pin)
    GPIO.output(pin, 1)

def digital_off(pin):
    print("digital_off", pin)
    GPIO.output(pin, 0)

def get_digital_staus(pin):
    return GPIO.input(pin)


if len(sys.argv) > 1:
    try:
        pin = int(sys.argv[1])
        value = int(sys.argv[2])

        setup_digital(pin)
        digital_output(pin, value)
        GPIO.cleanup()

    except Exception:
        print("Error")
