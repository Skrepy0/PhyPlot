from dataclasses import dataclass, field
from typing import List, Tuple, TypedDict
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64
matplotlib.use('Agg')
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# ===== 前端点类型 =====
class FrontPoint(TypedDict):
    id: int
    x: str
    y: str


@dataclass
class Chart:
    # ===== 数据（后端统一格式）=====
    points: List[Tuple[float, float]] = field(default_factory=list)

    # ===== 回归参数（外部传入）=====
    k: float = 0.0
    m: float = 0.0
    k_error: float = 0.0
    m_error: float = 0.0
    corr: float = 0.0
    confidence: float = 0.0

    # ===== 图表信息 =====
    title: str = ""
    x_label: str = ""
    y_label: str = ""

    # ===== 图例 =====
    point_legend: str = "Points"
    line_legend: str = "Fit Line"

    # =============================
    # 从前端加载数据
    # =============================
    def load_from_frontend(self, data: List[FrontPoint]):
        self.points.clear()

        for item in data:
            try:
                x = float(item["x"])
                y = float(item["y"])
                self.points.append((x, y))
            except (ValueError, KeyError, TypeError):
                continue

        # 可选：排序（推荐）
        self.points.sort(key=lambda p: p[0])

        if len(self.points) < 2:
            raise ValueError("Need at least 2 valid points")

    # =============================
    # 添加点（后端用）
    # =============================
    def add_point(self, x: float, y: float):
        self.points.append((x, y))

    # =============================
    # 生成 base64 图片
    # =============================
    def to_base64(self, show_params: bool = True) -> str:
        if not self.points:
            raise ValueError("No data points")

        x_vals = np.array([p[0] for p in self.points])
        y_vals = np.array([p[1] for p in self.points])

        plt.figure()

        # ===== 散点 =====
        plt.scatter(x_vals, y_vals, label=self.point_legend)

        # ===== 回归直线 =====
        x_line = np.linspace(x_vals.min(), x_vals.max(), 100)
        y_line = self.k * x_line + self.m
        plt.plot(
            x_line,
            y_line,
            label=f"{self.line_legend}: y={self.k:.2f}x+{self.m:.2f}"
        )

        # ===== 标题 & 坐标轴 =====
        plt.title(self.title)
        plt.xlabel(self.x_label)
        plt.ylabel(self.y_label)

        # ===== 图例 =====
        plt.legend()

        # ===== 参数显示 =====
        if show_params:
            text = (
                f"k = {self.k:.4f} ± {self.k_error:.4f}\n"
                f"m = {self.m:.4f} ± {self.m_error:.4f}\n"
                f"corr = {self.corr:.4f}\n"
                f"confidence = {self.confidence:.2%}"
            )

            plt.text(
                0.02, 0.98, text,
                transform=plt.gca().transAxes,
                verticalalignment='top',
                fontsize=10,
                bbox=dict(boxstyle="round", alpha=0.2)
            )

        # ===== 网格 =====
        plt.grid(True, linestyle='--', alpha=0.5)

        # ===== 转 base64 =====
        img = BytesIO()
        plt.savefig(img, format='png', bbox_inches='tight')
        plt.close()

        img.seek(0)
        return base64.b64encode(img.getvalue()).decode("utf8")