from flask import Flask, request
from flask_cors import CORS
import os
from io import BytesIO
import base64
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

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
    return jsonify({'data': int(str(num) + '1919810')})


from flask import jsonify


@app.route('/api/chart', methods=['GET'])
def get_chart():
    plt.figure()
    plt.plot([1, 2, 3, 4], [1, 4, 2, 3])
    plt.title('我的图表')
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode('utf8')
    plt.close()
    return jsonify({'image': 'data:image/png;base64,' + plot_url})


if __name__ == '__main__':
    app.run(port=3001, debug=True)
