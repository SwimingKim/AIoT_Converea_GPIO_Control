import sys
from util import is_raspberry
import json
import random
if is_raspberry():
    import RPi.GPIO as GPIO

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit()

    arg1 = int(sys.argv[1])
    arg2 = int(sys.argv[2])

    if is_raspberry():
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(arg1, GPIO.OUT)
            GPIO.setup(arg2, GPIO.OUT)
            
            print(json.dumps({
                "result": True,
                "data": [GPIO.input(arg1), GPIO.input(arg2)]
            }))
        except Exception as e:
            print(e)
            pass
    else:
        print(json.dumps({
            "result": False,
            "data": [random.randrange(0, 2), random.randrange(0, 2)]
        }))
    
    