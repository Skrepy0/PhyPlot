from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Any
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64

matplotlib.use('Agg')
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False


@dataclass
class FitLine:
    fit_type: str = "linear"
    points: List[Tuple[float, float]] = field(default_factory=list)
    k: float = 0.0
    m: float = 0.0
    a: float = 0.0
    b: float = 0.0
    c: float = 0.0
    L: float = 0.0  # 逻辑拟合参数：最大渐近值
    x0: float = 0.0  # 逻辑拟合参数：中点位置
    k_error: float = 0.0
    m_error: float = 0.0
    a_error: float = 0.0
    b_error: float = 0.0
    L_error: float = 0.0  # 逻辑拟合参数误差
    x0_error: float = 0.0  # 逻辑拟合参数误差
    corr: float = 0.0
    y_std_err: float = 0.0
    name: str = ""
    color: str = ""


@dataclass
class Chart:
    points: List[Tuple[float, float]] = field(default_factory=list)
    k: float = 0.0
    m: float = 0.0
    corr: float = 0.0
    confidence: float = 0.0
    title: str = ""
    x_label: str = ""
    y_label: str = ""
    point_legend: str = "观测点"
    line_legend: str = "拟合直线"
    dark_mode: bool = False
    show_grid: bool = True
    fit_lines: List[FitLine] = field(default_factory=list)

    @property
    def colors(self):
        if self.dark_mode:
            return {
                'bg': '#1e1e2e',
                'axes': '#2a2a3a',
                'text': '#f0f0f0',
                'scatter': '#ffb347',
                'line': '#4cd964',
                'grid': '#3a3a4a',
                'param_bg': '#2a2a3acc',
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

    def load_from_frontend(self, data: Dict[str, Any]):
        if isinstance(data, list):
            self.points.clear()
            for item in data:
                if not isinstance(item, dict):
                    continue
                try:
                    x = float(item.get('x', 0))
                    y = float(item.get('y', 0))
                    self.points.append((x, y))
                except (ValueError, TypeError):
                    continue
            self.points.sort(key=lambda p: p[0])
            if len(self.points) < 2:
                raise ValueError("至少需要2个有效数据点")
            return

        config = data.get('config', {})
        points_data = data.get('points', [])
        fit_lines_data = data.get('fitLines', [])
        settings = data.get('settings', {})

        self.title = config.get('chartTitle', '')
        self.x_label = config.get('xName', '')
        self.y_label = config.get('yName', '')
        self.dark_mode = settings.get('chartDarkMode', False)
        self.show_grid = settings.get('showGrid', True)

        self.points.clear()
        for pt in points_data:
            if not isinstance(pt, dict):
                continue
            try:
                x = float(pt.get('x', 0))
                y = float(pt.get('y', 0))
                self.points.append((x, y))
            except (ValueError, TypeError):
                continue
        self.points.sort(key=lambda p: p[0])

        self.fit_lines.clear()
        for line_data in fit_lines_data:
            if not isinstance(line_data, dict):
                continue
            fit_type = line_data.get('type', 'linear')
            name = line_data.get('name', '')
            color = line_data.get('color', '')

            try:
                k = float(line_data.get('k', '0'))
                m = float(line_data.get('m', '0'))
                a = float(line_data.get('a', '0'))
                b = float(line_data.get('b', '0'))
                c = float(line_data.get('c', '0'))
                k_error = float(line_data.get('kStdErr', '0'))
                m_error = float(line_data.get('mStdErr', '0'))
                a_error = float(line_data.get('aStdErr', '0'))
                b_error = float(line_data.get('bStdErr', '0'))
                corr = float(line_data.get('corr', '0'))
                y_std_err = float(line_data.get('yStdErr', '0'))
            except (ValueError, TypeError):
                continue

            points = []
            for pt in line_data.get('points', []):
                if not isinstance(pt, dict):
                    continue
                try:
                    x = float(pt.get('x', 0))
                    y = float(pt.get('y', 0))
                    points.append((x, y))
                except (ValueError, TypeError):
                    continue

            fit_line = FitLine(
                fit_type=fit_type,
                points=points,
                k=k, m=m,
                a=a, b=b, c=c,
                k_error=k_error, m_error=m_error,
                a_error=a_error, b_error=b_error,
                corr=corr, y_std_err=y_std_err,
                name=name, color=color
            )
            self.fit_lines.append(fit_line)

    def add_point(self, x: float, y: float):
        self.points.append((x, y))

    def to_base64(self, dpi: int = 120) -> str:
        all_x_vals = []
        all_y_vals = []

        if self.points:
            all_x_vals.extend(p[0] for p in self.points)
            all_y_vals.extend(p[1] for p in self.points)

        for line in self.fit_lines:
            if line.points:
                all_x_vals.extend(p[0] for p in line.points)
                all_y_vals.extend(p[1] for p in line.points)

        if all_x_vals:
            x_min, x_max = min(all_x_vals), max(all_x_vals)
            y_min, y_max = min(all_y_vals), max(all_y_vals)
            x_range = x_max - x_min
            y_range = y_max - y_min
            if x_range == 0:
                x_range = 1.0
            if y_range == 0:
                y_range = 1.0
            x_min -= x_range * 0.05
            x_max += x_range * 0.05
            y_min -= y_range * 0.05
            y_max += y_range * 0.05
        else:
            x_min, x_max = 0.0, 10.0
            y_min, y_max = 0.0, 10.0

        fig, ax = plt.subplots(figsize=(8, 6), facecolor=self.colors['bg'])
        ax.set_facecolor(self.colors['axes'])

        line_colors = ['#4cd964', '#ff7f0e', '#1f77b4', '#ff6b6b', '#9c27b0', '#00bcd4']

        if self.points:
            x_vals = np.array([p[0] for p in self.points])
            y_vals = np.array([p[1] for p in self.points])
            ax.scatter(x_vals, y_vals, label=self.point_legend,
                       color=self.colors['scatter'], s=60, edgecolors='white',
                       linewidth=1.5, alpha=0.9, zorder=3)

        if not self.fit_lines and self.points and (self.k != 0.0 or self.m != 0.0):
            x_line = np.linspace(x_min, x_max, 200)
            y_line = self.k * x_line + self.m
            ax.plot(x_line, y_line, label=self.line_legend,
                    color=self.colors['line'], linewidth=2.5, zorder=2)
        region_fit_line = 1
        for i, line in enumerate(self.fit_lines):
            point_color = line.color if line.color else line_colors[i % len(line_colors)]

            if line.points:
                line_x_vals = np.array([p[0] for p in line.points])
                line_y_vals = np.array([p[1] for p in line.points])
                point_label = f"{line.name} 数据点" if line.name else (f"数据集{i+1}" if line.fit_type == 'linear' else f"指数数据集{i+1}")
                ax.scatter(line_x_vals, line_y_vals, label=point_label,
                           color=point_color, s=40, alpha=0.7, zorder=3)

            if line.points:
                x_min_line = min(p[0] for p in line.points)
                x_max_line = max(p[0] for p in line.points)
            else:
                x_min_line, x_max_line = x_min, x_max

            if x_max_line <= x_min_line:
                x_min_line, x_max_line = x_min, x_max

            x_fit = np.linspace(x_min_line, x_max_line, 200)

            if line.fit_type == 'linear':
                y_fit = line.k * x_fit + line.m
                line_label = line.name if line.name else None
                if not line.points and not line_label:
                    if abs(line.k) < 1e-12:
                        x_intercept = "∞"
                    else:
                        x_intercept = f"{-line.m / line.k:.2e}"
                    y_intercept = f"{line.m:.2e}"

                    line_label = f"区域拟合线{region_fit_line} 横截距:{x_intercept}, 纵截距:{y_intercept}"
                    region_fit_line+=1
                ax.plot(x_fit, y_fit, label=line_label,
                        color=point_color, linewidth=2.5, zorder=2)
            elif line.fit_type == 'logistic':
                # 逻辑拟合: y = L / (1 + exp(-k * (x - x0)))
                exponent = np.clip(-line.k * (x_fit - line.x0), -700, 700)
                y_fit = line.L / (1 + np.exp(exponent))
                line_label = line.name if line.name else f"逻辑拟合{i+1}"
                ax.plot(x_fit, y_fit, label=line_label,
                        color=point_color, linewidth=2.5, zorder=2)
            else:
                exponent = np.clip(line.b * x_fit, -700, 700)
                y_fit = line.a * np.exp(exponent)+line.c
                line_label = line.name if line.name else f"指数拟合{i+1}"
                ax.plot(x_fit, y_fit, label=line_label,
                        color=point_color, linewidth=2.5, zorder=2)

        ax.set_xlim(x_min, x_max)
        ax.set_ylim(y_min, y_max)
        ax.set_title(self.title, fontsize=14, fontweight='bold', color=self.colors['text'], pad=12)
        ax.set_xlabel(self.x_label, fontsize=12, color=self.colors['text'], labelpad=8)
        ax.set_ylabel(self.y_label, fontsize=12, color=self.colors['text'], labelpad=8)
        ax.tick_params(colors=self.colors['text'], labelsize=10)
        for spine in ax.spines.values():
            spine.set_color(self.colors['text'])

        if ax.get_legend_handles_labels()[0]:
            legend = ax.legend(loc='upper left', frameon=True, fancybox=True, shadow=True,
                       fontsize=10, facecolor=self.colors['bg'], framealpha=0.3,
                       markerscale=0.6, edgecolor=self.colors['text'])
            for text in legend.get_texts():
                text.set_color(self.colors['text'])

        if self.show_grid:
            ax.grid(True, linestyle='--', linewidth=0.8, alpha=0.5, color=self.colors['grid'])

        plt.tight_layout()
        fig.subplots_adjust(left=0.12, right=1.00)

        img = BytesIO()
        plt.savefig(img, format='png', dpi=dpi, bbox_inches='tight', facecolor=fig.get_facecolor())
        plt.close(fig)
        img.seek(0)
        return base64.b64encode(img.getvalue()).decode("utf8")
