from flask import Flask, request
from flask_cors import CORS
import os
from models.chart import FitLine,Chart

app = Flask(__name__)
CORS(app)

from flask import jsonify

@app.route('/api/chart', methods=['POST'])
def get_chart():
    response = request.get_json()
    app.logger.debug(response)
    data = response["data"]
    config = response["config"]
    settings = response["settings"]

    def safe_float(value, default=0.0):
        if value == "-" or value == "" or value is None:
            return default
        try:
            return float(value)
        except (ValueError, TypeError):
            return default

    # 处理多条拟合线
    fit_lines = []
    if "fitLines" in response and response["fitLines"]:
        for line_data in response["fitLines"]:

            fit_line = FitLine(
                fit_type=line_data.get("type", "linear"),
                name=line_data.get("name", ""),
                color=line_data.get("color", ""),
                k=safe_float(line_data.get("k", 0)),
                m=safe_float(line_data.get("m", 0)),
                a=safe_float(line_data.get("a", 0)),
                b=safe_float(line_data.get("b", 0)),
                k_error=safe_float(line_data.get("kStdErr", 0)),
                m_error=safe_float(line_data.get("mStdErr", 0)),
                a_error=safe_float(line_data.get("aStdErr", 0)),
                b_error=safe_float(line_data.get("bStdErr", 0)),
                corr=safe_float(line_data.get("corr", 0)),
                y_std_err=safe_float(line_data.get("yStdErr", 0))
            )

            # 加载该线的数据点
            if "points" in line_data:
                for point in line_data["points"]:
                    try:
                        x = float(point["x"])
                        y = float(point["y"])
                        fit_line.points.append((x, y))
                    except (ValueError, KeyError, TypeError):
                        continue
                fit_line.points.sort(key=lambda p: p[0])

            fit_lines.append(fit_line)

    chart = Chart(
        k=safe_float(data["k"]),
        m=safe_float(data["m"]),# 这两个备用
        corr=safe_float(data["corr"]),
        confidence=float(config["confidence"].split("%")[0])/100,
        title=config["chartTitle"],
        x_label=config["xName"],
        y_label=config["yName"],
        point_legend=config["pointCutline"],
        line_legend = config["lineCutline"],

        dark_mode=settings["chartDarkMode"],
        show_grid=settings["showGrid"],
        fit_lines=fit_lines
    )
    app.logger.debug(settings["chartDarkMode"])
    chart.load_from_frontend(response["points"])
    plot_url = chart.to_base64()
    return jsonify({'image': 'data:image/png;base64,' + plot_url})

# @app.route("/api/test",methods=["GET"])
# def test():
#     return jsonify({"a":"b"})

if __name__ == '__main__':
    app.run(port=3001, debug=True)