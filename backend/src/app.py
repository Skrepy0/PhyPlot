from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/process', methods=['POST'])
def process_data():
    data = request.get_json()
    num = data['data']
    return jsonify({'data':int(str(num)+'1919810')})

if __name__ == '__main__':
    app.run(port=3001, debug=True)
