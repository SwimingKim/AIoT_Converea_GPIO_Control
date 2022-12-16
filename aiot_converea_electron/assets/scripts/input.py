# python3 input.py {DELAY} {DHT22} {TURBIDITY} {PH} {LIQUID_LEVEL}
import sys
from util import is_raspberry
from time import sleep
import random
from output import get_digital_status
if is_raspberry():
    import RPi.GPIO as GPIO
    import spidev
    import board
    import adafruit_dht
    import digitalio

def setup_digital_input(pin):
    if is_raspberry():
        GPIO.setup(pin, GPIO.INPUT)

def read_temp(dhtDevice):
    try:
        return dhtDevice.temperature
    finally:
        return None

def read_humidity(dhtDevice):
    try:
        return dhtDevice.humidity
    finally:
        return None

def read_analog(channel):
    try:
        r = spi.xfer2([1, (0x08 + channel) << 4, 0])
        adc_out = ((r[1] & 0x03) << 8) + r[2]
        return adc_out
    finally:
        return None

def generate_analog_list(channel):
    sample = 10
    sampleValue = []
    for i in range(sample):
        adc = read_analog(channel)
        sampleValue.append(adc)

    sampleValue.sort()
    return sampleValue

def read_phSensor(channel):
    try:
        sampleValue = generate_analog_list(channel)
        avg = 0
        for i in range(2, 8):
            avg += sampleValue[i]

        phValue = float(avg * 5 / 1024 / 6)
        phValue = float(3.5 * phValue)
        return phValue
    finally:
        return None

def read_turibidity(channel):
    try:
        sampleValue = generate_analog_list(channel)
        avg = 0
        for i in range(2, 8):
            avg += sampleValue[i] * (5.0 / 1024.0)
        voltage = avg / 6
        return voltage
    finally:
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
    elif number == 28: return board.D28
    else: return board.D0

def print_sensor():
    try:
        dht22 = sys.argv[2]
        turbidity = sys.argv[3]
        ph = sys.argv[4]
        liquid_level = sys.argv[4]

        GPIO.setmode(GPIO.BCM)
        setup_digital_input(liquid_level)

        dht22_pin = convertToPin(dht22)
        pin = digitalio.DigitalInOut(dht22_pin)
        dhtDevice = adafruit_dht.DHT22(dht22_pin)

        spi = spidev.SpiDev()
        spi.open(0, 0)
        spi.max_speed_hz = 1000000

        sensor = {
            "temp": read_temp(dhtDevice),
            "humidity": read_humidity(dhtDevice),
            "turbidity": read_turibidity(turbidity),
            "ph": read_phSensor(),
            "liquid_level": get_digital_status(liquid_level)
        }
        print({"result": True, "data": sensor})
    except Exception:
        pass
    finally:
        temp = random.randrange(2300, 2800) * 0.01
        humidity = random.randrange(4000, 8000) * 0.01
        turbidity = random.randrange(4000, 6000) * 0.001
        ph = random.randrange(6000, 11000) * 0.001
        liquid_level = random.randrange(0, 2)
        sensor = {
            "temp": temp,
            "humidity": humidity,
            "turbidity": turbidity,
            "ph": ph,
            "liquid_level": liquid_level
        }
        print({"result": False, "data": sensor})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        delay = sys.argv[1]
        print_sensor()