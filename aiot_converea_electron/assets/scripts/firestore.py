import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
from datetime import datetime
import platform
import sys
import json


# file_name = "aiot-nuguna-d2d46-23da7a244840.json"
# file_name = "aiot-converea-firebase-adminsdk-xwmef-81c44db433.json"
file_name = "converea-d9289-firebase-adminsdk-rc7d4-a2d5b50364.json"
path = os.path.join(os.path.dirname(__file__), 'secrets', file_name)
cred = credentials.Certificate(path)
last_dict = None

def init_db():
    app = firebase_admin.initialize_app(cred)

def get_node_name():
    return os.uname().nodename

def get_last_doc(sensor_ref):
    if last_dict == None:
        query = sensor_ref.order_by('update_time').limit(1)
        return list(query.stream())[0].to_dict()
    else:
        return last_dict

def load_data():
    # print("load")
    db = firestore.client()

    sensor_ref = db.collection('sensor')
    last_doc = get_last_doc(sensor_ref)

    doc = list(sensor_ref.order_by('update_time').start_after({
        'update_time': last_doc['update_time']
    }).limit(1).stream())[0]
    # print(doc.id, doc.to_dict())
    dict = doc.to_dict()
    # print(dict)

    global last_dict
    last_dict = dict
    dict["update_time"] = None
    # print(json.dumps(dict))

    return {
        "result": False,
        "data": dict
    }

    
def load_pin():
    db = firestore.client()
    doc_ref = db.collection('device').document(get_node_name())
    doc = doc_ref.get()

    if doc.exists:
        return {
            "result": True,
            "data": doc.to_dict()
        }
    else :
        return {
            "result": False
        }

def update_data(sensor_data):
    db = firestore.client()
    doc_ref = db.collection('sensor').document()
    sensor_data["update_time"] = firestore.firestore.SERVER_TIMESTAMP
    doc_ref.set(sensor_data)
    # print("firebase updated...")

def setup_db():
    db = firestore.client()
    doc_ref = db.collection('device').document(get_node_name())
    device= {
        'id': get_node_name(), # 디바이스 아이디
        'is_running': False, # 실행여부 bool
        'manufacture_date': str(datetime.now().date()), # 제조일자
        #'sensor': []
        # 추후 식물 성장도 추가
    }

    doc = doc_ref.get()
    if doc.exists:
        doc_ref.update(device)
    else:
        doc_ref.set(device)

    print("firebase started...")

def update_db(temp, Huminity, ph_value, sen_value, water_value, camera_value):
    db = firestore.client()
    doc_ref = db.collection('device').document(get_node_name())
    sensor_data = {
        'temperature' : temp, # 온도센서값,
        'humidity' : Huminity, # 습도센서 값,
        'ph': ph_value, # ph센서 값,
        'turbidity': sen_value, # 탁도센서 값,
        'water_level': water_value, # 수위 값
        'camera_value': camera_value,
        'update_time': datetime.now().strftime("%Y.%m.%d %H:%M:%S") # 센서읽은 시간
    }
    # sensor_data['update_time'] = firestore.SERVER_TIMESTAMP
    doc_ref.update({
        "is_running": True,
        "sensor": firestore.ArrayUnion([sensor_data])
    })
    print("firebase updated...")

def update_pin(pin):
    db = firestore.client()
    doc_ref = db.collection('device').document(get_node_name())

    _, date = platform.python_build() # Oct 11 2022 16:50:30
    value = datetime.strptime(date, '%b %d %Y %H:%M:%S').strftime('%Y.%m.%d %H:%M:%S')
    device= {
        # 'id': os.uname().nodename, # 디바이스 아이디
        # 'is_running': False, # 실행여부 bool
        'manufacture_date': value, # 제조일자
        # 'manufacture_date': str(datetime.now().date()), # 제조일자
        #'sensor': []
        # 추후 식물 성장도 추가
    }
    dict_data = dict(device, **pin)

    doc = doc_ref.get()
    if doc.exists:
        doc_ref.update(pin)
    else:
        doc_ref.set(pin)
    print(doc.to_dict())

    # print("firebase started...")

def migration():
    db = firestore.client()
    sensor_collection = db.collection('sensor')
    sensor_list = db.collection('sensor2').stream()

    index = 0
    for item in sensor_list:
        # print(item.id, item.to_dict())
        dict = item.to_dict()
        sensor_ref = sensor_collection.document(item.id)
        sensor_ref.set(dict)
        index += 1

    print("migration", index, "success")


if __name__ == "__main__":
    size = len(sys.argv)
    if size == 1:
        init_db()

        result = load_pin()
        print(json.dumps(result))
    elif size == 10:
        init_db()
        print(sys.argv)

        dht22 = int(sys.argv[1])
        turbidity = int(sys.argv[2])
        ph = int(sys.argv[3])
        water_level = int(sys.argv[4])
        fan = int(sys.argv[5])
        pump = int(sys.argv[6])
        db_update = json.loads(sys.argv[7].lower())
        sensor_interval = int(sys.argv[8])
        db_interval = int(sys.argv[9])

        update_pin({
            "dht22": dht22,
            "turbidity": turbidity,
            "ph": ph,
            "water_level": water_level,
            "fan": fan,
            "pump": pump,
            "db_update": db_update,
            "sensor_interval": sensor_interval,
            "db_interval": db_interval,
        })
    else:
        print(len(sys.argv))

