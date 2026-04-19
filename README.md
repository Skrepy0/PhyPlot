# PhyPlot

![License](https://img.shields.io/badge/license-MIT-aqua)
PhyPlot 是一个简单的物理实验数据处理工具，为高中和大学物理学生提供基础的数据分析和图表绘制功能。帮助学生处理物理实验数据并进行简单的统计分析。

## ✨ 主要功能特性

### 📊 基础数据分析

- **JSON格式数据导入**：支持特定格式的JSON数据文件导入
- **图表绘制**：基于后端Python绘制的静态图表
- **基础数据展示**：简单的数据可视化展示

### 📈 曲线拟合功能

- **线性拟合**：提供基础的线性回归分析
- **指数函数拟合**：支持指数增长/衰减模型拟合
- **逻辑斯蒂拟合**：支持逻辑斯蒂函数拟合
- **局部直线拟合**：针对数据局部特征进行直线拟合

### 📋 单变量统计分析

- **基本统计量计算**：计算数据的均值、方差、标准差等
- **统计结果展示**：以表格形式展示统计结果

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.x
- **Python** >= 3.8
- **npm**管理器

### 安装和运行

1. **克隆项目**

   ```bash
   git clone https://github.com/Skrepy0/PhyPlot.git
   cd PhyPlot
   ```

2. **安装依赖**

   ```bash
   # 安装根目录依赖
   npm install

   # 安装前端依赖
   cd frontend
   npm install

   # 安装后端依赖
   cd ../backend
   pip install -r requirements.txt
   ```

3. **启动开发环境**

   ```bash
   # 在项目根目录运行
   npm run dev
   ```

   或者分别启动：

   ```bash
   # 启动前端 (新终端)
   npm run dev:frontend

   # 启动后端 (新终端)
   npm run dev:backend
   ```

4. **访问应用**
   - 前端应用：http://localhost:3000
   - 后端API：http://localhost:3001

### 项目结构

```
phyplot/
├── frontend/                 # 前端应用目录
│   ├── app/                 # 应用主目录
│   │   ├── components/      # Vue组件
│   │   ├── composables/     # 组合式函数
│   │   └── app.vue         # 应用入口
│   └── assets/             # 静态资源
│       └── scss/          # 样式文件
├── backend/                 # 后端应用目录
│   ├── src/                # 源代码
│   │   ├── app.py          # Flask应用入口
│   │   └── models/         # 数据模型
└── package.json            # 项目配置文件
```

## 🛠 技术架构

项目采用前后端分离架构：

- **前端**：Vue 3 + Nuxt.js + TypeScript
- **后端**：Flask + NumPy + Matplotlib
- **数据交互**：通过REST API进行通信
