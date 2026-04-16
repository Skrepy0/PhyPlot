from dataclasses import dataclass, field
from typing import List, Tuple, TypedDict
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64

# 设置 matplotlib 使用非交互式后端
matplotlib.use('Agg')

# 全局字体设置（支持中文）
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False


class FrontPoint(TypedDict):
    id: int
    x: str
    y: str


@dataclass
class FitLine:
    # 拟合线类型：linear 或 exponential
    fit_type: str = "linear"

    # 数据点
    points: List[Tuple[float, float]] = field(default_factory=list)

    # 回归参数
    k: float = 0.0  # 线性：斜率，指数：不适用
    m: float = 0.0  # 线性：截距，指数：不适用
    a: float = 0.0  # 指数：系数a
    b: float = 0.0  # 指数：系数b

    # 误差
    k_error: float = 0.0
    m_error: float = 0.0
    a_error: float = 0.0
    b_error: float = 0.0

    # 统计信息
    corr: float = 0.0
    y_std_err: float = 0.0

    # 显示名称和颜色
    name: str = ""
    color: str = ""

@dataclass
class Chart:
    # 数据点
    points: List[Tuple[float, float]] = field(default_factory=list)

    # 回归参数
    k: float = 0.0
    m: float = 0.0
    k_error: float = 0.0
    m_error: float = 0.0
    corr: float = 0.0
    confidence: float = 0.0

    # 图表文字
    title: str = ""
    x_label: str = ""
    y_label: str = ""

    # 图例
    point_legend: str = "观测点"
    line_legend: str = "拟合直线"

    # 暗色模式标志
    dark_mode: bool = False
    # 是否显示网格
    show_grid: bool = True

    # 多条拟合线
    fit_lines: List[FitLine] = field(default_factory=list)

    # 颜色方案
    @property
    def colors(self):
        if self.dark_mode:
            return {
                'bg': '#1e1e2e',           # 背景色
                'axes': '#2a2a3a',          # 坐标轴背景
                'text': '#f0f0f0',          # 文字颜色
                'scatter': '#ffb347',       # 散点颜色
                'line': '#4cd964',          # 拟合线颜色
                'grid': '#3a3a4a',          # 网格线颜色
                'param_bg': '#2a2a3acc',    # 参数框背景（半透明）
                'param_text': '#ffffff',
            }
        else:
            return {
                'bg': '#ffffff',
                'axes': '#f8f9fa',
                'text': '#333333',
                'scatter': '#ff7f0e',
                'line': '#2ca02c',
                'grid': '#e0e0e0',
                'param_bg': '#f0f0f0cc',
                'param_text': '#1e1e2a',
            }

    def load_from_frontend(self, data: List[FrontPoint]):
        self.points.clear()
        for item in data:
            try:
                x = float(item["x"])
                y = float(item["y"])
                self.points.append((x, y))
            except (ValueError, KeyError, TypeError):
                continue
        self.points.sort(key=lambda p: p[0])
        if len(self.points) < 2:
            raise ValueError("至少需要2个有效数据点")

    def add_point(self, x: float, y: float):
        self.points.append((x, y))

    def to_base64(self, show_params: bool = True, dpi: int = 120) -> str:
        if not self.points and not self.fit_lines:
            raise ValueError("无数据点")

        # 收集所有数据点的范围
        all_x_vals = []
        all_y_vals = []

        if self.points:
            all_x_vals.extend([p[0] for p in self.points])
            all_y_vals.extend([p[1] for p in self.points])

        for line in self.fit_lines:
            if line.points:
                all_x_vals.extend([p[0] for p in line.points])
                all_y_vals.extend([p[1] for p in line.points])

        if not all_x_vals:
            raise ValueError("无有效数据点")

        x_min, x_max = min(all_x_vals), max(all_x_vals)
        y_min, y_max = min(all_y_vals), max(all_y_vals)

        # 扩展范围以便更好地显示
        x_range = x_max - x_min
        y_range = y_max - y_min
        x_min -= x_range * 0.05
        x_max += x_range * 0.05
        y_min -= y_range * 0.05
        y_max += y_range * 0.05

        # 创建图形，设置背景色
        fig, ax = plt.subplots(figsize=(8, 6), facecolor=self.colors['bg'])
        ax.set_facecolor(self.colors['axes'])

        # 预定义颜色列表用于多条拟合线
        line_colors = ['#4cd964', '#ff7f0e', '#1f77b4', '#ff6b6b', '#9c27b0', '#00bcd4']

        # 绘制原始数据点
        if self.points:
            x_vals = np.array([p[0] for p in self.points])
            y_vals = np.array([p[1] for p in self.points])
            ax.scatter(x_vals, y_vals,
                       label=self.point_legend,
                       color=self.colors['scatter'],
                       s=60,
                       edgecolors='white',
                       linewidth=1.5,
                       alpha=0.9,
                       zorder=3)

        # 绘制多条拟合线
        param_texts = []

        # 绘制拟合线
        # 如果有fit_lines，只绘制fit_lines；否则绘制主拟合线（向后兼容）
        if self.fit_lines:
            # 只绘制fit_lines，不绘制主拟合线
            pass  # 跳过主拟合线绘制，直接绘制fit_lines
        elif self.points and self.k != 0.0:
            # 向后兼容：如果没有fit_lines但有主拟合线参数，绘制主拟合线
            x_line = np.linspace(x_min, x_max, 200)
            y_line = self.k * x_line + self.m
            ax.plot(x_line, y_line,
                    label=self.line_legend,
                    color=self.colors['line'],
                    linewidth=2.5,
                    linestyle='-',
                    zorder=2)

        # 绘制拟合线（包括fit_lines或主拟合线）
        for i, line in enumerate(self.fit_lines):
            if not line.points:
                continue

            line_x_vals = np.array([p[0] for p in line.points])
            line_y_vals = np.array([p[1] for p in line.points])

            # 绘制该线的数据点
            if line.fit_type == 'linear':
                point_label = f"{line.name} 数据点" if line.name else f"数据集{i+1}"
            else:
                point_label = f"{line.name} 数据点" if line.name else f"指数数据集{i+1}"

            # 使用自定义颜色或回退到预设颜色
            point_color = line.color if line.color else line_colors[i % len(line_colors)]

            ax.scatter(line_x_vals, line_y_vals,
                       label=point_label,
                       color=point_color,
                       s=40,
                       alpha=0.7,
                       zorder=3)

            # 绘制拟合曲线
            x_fit = np.linspace(min(line_x_vals), max(line_x_vals), 200)

            if line.fit_type == 'linear':
                y_fit = line.k * x_fit + line.m
                line_label = line.name if line.name else f"线性拟合{i+1}"
            else:  # exponential
                y_fit = line.a * np.exp(line.b * x_fit)
                line_label = line.name if line.name else f"指数拟合{i+1}"

            ax.plot(x_fit, y_fit,
                    label=line_label,
                    color=point_color,
                    linewidth=2.5,
                    linestyle='-',
                    zorder=2)

        # 标题与轴标签
        ax.set_title(self.title, fontsize=14, fontweight='bold', color=self.colors['text'], pad=12)
        ax.set_xlabel(self.x_label, fontsize=12, color=self.colors['text'], labelpad=8)
        ax.set_ylabel(self.y_label, fontsize=12, color=self.colors['text'], labelpad=8)
        ax.set_xlim(x_min, x_max)
        ax.set_ylim(y_min, y_max)

        # 刻度颜色
        ax.tick_params(colors=self.colors['text'], labelsize=10)
        for spine in ax.spines.values():
            spine.set_color(self.colors['text'])

        # 图例
        legend = ax.legend(
            loc='best',
            frameon=True,
            fancybox=True,
            shadow=True,
            fontsize=10,
            facecolor=self.colors['bg'],
            edgecolor=self.colors['text']
        )

        # 设置图例文字颜色
        for text in legend.get_texts():
            text.set_color(self.colors['text'])

        # 网格
        if self.show_grid:
            ax.grid(True, linestyle='--', linewidth=0.8, alpha=0.5, color=self.colors['grid'])

        # 参数信息框已移除

        # 紧凑布局
        plt.tight_layout()
        fig.subplots_adjust(left=0.12, right=1.00)

        # 转换为 base64
        img = BytesIO()
        plt.savefig(img, format='png', dpi=dpi, bbox_inches='tight', facecolor=fig.get_facecolor())
        plt.close(fig)

        img.seek(0)
        return base64.b64encode(img.getvalue()).decode("utf8")