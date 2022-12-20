# python3 input.py {DELAY} {DHT22} {TURBIDITY} {PH} {LIQUID_LEVEL}
import sys
from util import is_raspberry
from time import sleep
import random
import time
import json
if is_raspberry():
    import RPi.GPIO as GPIO
    import spidev
    import board
    import adafruit_dht
    import digitalio

def read_temp():
    try:
        return dhtDevice.temperature
    except:
        return None

def read_humidity():
    try:
        return dhtDevice.humidity
    except:
        return None

def read_liquid_level():
    try:
        return GPIO.input(liquid_level)
    except:
        return None

def read_analog(channel):
    try:
        r = spi.xfer2([1, (0x08 + channel) << 4, 0])
        adc_out = ((r[1] & 0x03) << 8) + r[2]
        return adc_out
    except Exception as e:
        return None

def read_phSensor(channel):
    try:
        sample = 10
        sampleValue = []
        for i in range(sample):
            adc = read_analog(channel)
            sampleValue.append(adc)
            time.sleep(0.10)
        sampleValue.sort()

        avg = 0
        for i in range(2, 8):
            avg += sampleValue[i]

        phValue = float(avg * 5 / 1024 / 6)
        phValue = float(3.5 * phValue)

        sampleValue.clear()
        return phValue
    except:
        return None

def read_turibidity(channel):
    try:
        adc = read_analog(channel)
        voltage = adc * (5.0 / 1024.0)
        return voltage
    except:
        return None

def convertToPin(number):
    if number == 0: return board.D0
    elif number == 1: return board.D1
    elif number == 2: return board.D2
    elif number == 3: return board.D3
    elif number == 4: return board.D4
    elif number == 5: return board.D5
    elif number == 6: return board.D6
    elif number == 7: return board.D7
    elif number == 8: return board.D8
    elif number == 9: return board.D9
    elif number == 10: return board.D10
    elif number == 11: return board.D11
    elif number == 12: return board.D12
    elif number == 13: return board.D13
    elif number == 14: return board.D14
    elif number == 15: return board.D15
    elif number == 16: return board.D16
    elif number == 17: return board.D17
    elif number == 18: return board.D18
    elif number == 19: return board.D19
    elif number == 20: return board.D20
    elif number == 21: return board.D21
    elif number == 22: return board.D22
    elif number == 23: return board.D23
    elif number == 24: return board.D24
    elif number == 25: return board.D25
    elif number == 26: return board.D26
    elif number == 27: return board.D27
    elif number == 30: return board.D30
    elif number == 31: return board.D31
    else: return board.D0

def get_sensor_data(turbidity, ph):
    if is_raspberry():
        return {
            "result": True,
            "data": {
                "temp": read_temp(),
                "humidity": read_humidity(),
                "turbidity": read_turibidity(turbidity),
                "ph": read_phSensor(ph),
                "liquid_level": read_liquid_level()
            }
        }
    else:
        temp = random.randrange(2300, 2800) * 0.01
        humidity = random.randrange(4000, 8000) * 0.01
        turbidity = random.randrange(4000, 6000) * 0.001
        ph = random.randrange(6000, 11000) * 0.001
        liquid_level = random.randrange(0, 2)
        return {
            "result": False,
            "data": {
                "temp": temp,
                "humidity": humidity,
                "turbidity": turbidity,
                "ph": ph,
                "liquid_level": liquid_level
            }
        }


if __name__ == "__main__":
    if len(sys.argv) != 6:
        sys.exit()
    
    delay = int(sys.argv[1])
    dht22 = int(sys.argv[2])
    turbidity = int(sys.argv[3])
    ph = int(sys.argv[4])
    liquid_level = int(sys.argv[5])
    try:
        if is_raspberry():
            spi = spidev.SpiDev()
            spi.open(0, 0)
            spi.max_speed_hz = 1000000

            GPIO.setmode(GPIO.BCM)
            GPIO.setup(liquid_level, GPIO.IN)

            dht22_pin = convertToPin(dht22)
            pin = digitalio.DigitalInOut(dht22_pin)
            dhtDevice = adafruit_dht.DHT22(dht22_pin)

        while True:
            result = get_sensor_data(turbidity, ph)
            print(json.dumps(result))
            sys.stdout.flush()

            time.sleep(delay)
    except:
        pass
