from flask import Flask, request
from flask_cors import CORS
import os
from models.chart import Chart


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


@app.route('/api/chart', methods=['POST'])
def get_chart():
    response = request.get_json()
    app.logger.info(response)
    data = response["data"]
    config = response["config"]
    chart = Chart(
    k=float(data["k"]),
    m=float(data["m"]),
    k_error=float(data["kStdErr"]),
    m_error=float(data["mStdErr"]),
    corr=float(data["corr"]),
    confidence=float(config["confidence"].split("%")[0])/100,
    title=config["chartTitle"],
    x_label=config["xName"],
    y_label=config["yName"],
    point_legend=config["pointCutline"],
    line_legend = config["lineCutline"]
    )

    chart.load_from_frontend(response["points"])
    plot_url = chart.to_base64()
    return jsonify({'image': 'data:image/png;base64,' + plot_url})


if __name__ == '__main__':
    app.run(port=3001, debug=True)
