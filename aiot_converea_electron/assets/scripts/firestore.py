import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
from datetime import datetime
import json

file_name = "aiot-converea-firebase-adminsdk-xwmef-81c44db433.json"
path = os.path.join(os.path.dirname(__file__), 'secrets', file_name)
cred = credentials.Certificate(path)

def init_db():
    app = firebase_admin.initialize_app(cred)

def load_data(index):
    # print("load")
    db = firestore.client()
    doc = db.collection('sensor').order_by('update_time').limit(1).offset(index).get()[0]
    # print(doc.id, doc.to_dict())
    dict = doc.to_dict()
    dict["update_time"] = None
    # print(json.dumps(dict))
    return {
        "result": False,
        "data": dict
    }

def update_data(sensor_data):
    db = firestore.client()
    doc_ref = db.collection('sensor2').document()
    sensor_data["update_time"] = firestore.firestore.SERVER_TIMESTAMP
    doc_ref.set(sensor_data)
    # print("firebase updated...")


def setup_db():
    db = firestore.client()
    doc_ref = db.collection('device').document('d000001')
    device= {
        'id': os.getlogin(), # 디바이스 아이디
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
    doc_ref = db.collection('device').document('d000001')
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


if __name__ == "__main__":
    init_db()
    load_data(1)