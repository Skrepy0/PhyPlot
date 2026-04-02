from dataclasses import dataclass, field
from typing import List, Tuple, TypedDict, Optional
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
        if not self.points:
            raise ValueError("无数据点")

        x_vals = np.array([p[0] for p in self.points])
        y_vals = np.array([p[1] for p in self.points])

        # 创建图形，设置背景色
        fig, ax = plt.subplots(figsize=(8, 6), facecolor=self.colors['bg'])
        ax.set_facecolor(self.colors['axes'])

        # 散点图（加大点尺寸，增加边缘白色，更清晰）
        ax.scatter(x_vals, y_vals,
                   label=self.point_legend,
                   color=self.colors['scatter'],
                   s=60,
                   edgecolors='white',
                   linewidth=1.5,
                   alpha=0.9,
                   zorder=3)

        # 拟合直线
        x_line = np.linspace(x_vals.min(), x_vals.max(), 200)
        y_line = self.k * x_line + self.m
        ax.plot(x_line, y_line,
                label=f"{self.line_legend}: y = {self.k:.4f}x + {self.m:.4f}",
                color=self.colors['line'],
                linewidth=2.5,
                linestyle='-',
                zorder=2)

        # 标题与轴标签
        ax.set_title(self.title, fontsize=14, fontweight='bold', color=self.colors['text'], pad=12)
        ax.set_xlabel(self.x_label, fontsize=12, color=self.colors['text'], labelpad=8)
        ax.set_ylabel(self.y_label, fontsize=12, color=self.colors['text'], labelpad=8)

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

        # ⭐ 设置图例文字颜色
        for text in legend.get_texts():
            text.set_color(self.colors['text'])

        # 网格（更美观）
        ax.grid(True, linestyle='--', linewidth=0.8, alpha=0.5, color=self.colors['grid'])

        # 参数信息框（毛玻璃效果）
        if show_params:
            text = (
                f"拟合参数\n"
                f"斜率 k = {self.k:.4f} ± {self.k_error:.4f}\n"
                f"截距 m = {self.m:.4f} ± {self.m_error:.4f}\n"
                f"相关系数 r = {self.corr:.4f}\n"
                f"置信度 = {self.confidence:.2%}"
            )
            bbox_props = dict(
                boxstyle="round,pad=0.5",
                facecolor=self.colors['param_bg'],
                edgecolor=self.colors['line'],
                alpha=0.9,
                linewidth=1.5
            )
            ax.text(0.02, 0.98, text,
                    transform=ax.transAxes,
                    verticalalignment='top',
                    fontsize=10,
                    # 移除 family='monospace'，使用全局中文字体
                    color=self.colors['param_text'],
                    bbox=bbox_props,
                    zorder=10)

        # 紧凑布局
        plt.tight_layout()
        fig.subplots_adjust(left=0.12, right=1.00)
        # 转换为 base64
        img = BytesIO()
        plt.savefig(img, format='png', dpi=dpi, bbox_inches='tight', facecolor=fig.get_facecolor())
        plt.close(fig)

        img.seek(0)
        return base64.b64encode(img.getvalue()).decode("utf8")