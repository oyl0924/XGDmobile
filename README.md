# 车间小工单

这是一个基于Vue 3和Vant的移动端工单管理系统的渐进式Web应用(PWA)。

## 功能特点

- 移动端自适应布局
- 工单查询和处理
- 工单、工序、人员等信息选择
- 良品/不良品报工
- 支持离线访问
- 可添加到手机主屏幕

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Vant UI
- PWA (VitePWA)

## 项目运行

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境构建

```bash
npm run build
```

## 项目结构

```
├── public/                # 静态资源
│   ├── pwa-icons/         # PWA图标资源
│   ├── vite.svg           # 网站图标
│   └── apple-touch-icon.png # iOS设备图标
├── src/                   # 源代码
│   ├── api/               # API接口和模拟数据
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── pwa.ts             # PWA配置
├── index.html             # HTML模板
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── package.json           # 项目依赖
```

## 主要功能

### 工单列表

- 查看所有工单
- 筛选紧急工单
- 工单状态显示

### 工单详情

- 查看工单详细信息
- 工单处理和报工
- 填写良品/不良品数量

### 报工页面

- 选择工单号、生产人员、工序名称
- 显示工单详细信息、产品信息等
- 填写报工数量（良品数/不良品数）
- 选择不良品原因
- 提交报工数据

## PWA 配置说明

本项目已配置为 PWA 应用，命名为"车间小工单"。当前使用 `public/vite.svg` 作为应用图标。

### 图标配置

- 网站图标：`public/vite.svg`（SVG格式，在任何分辨率下保持清晰）
- Apple 触摸图标：`public/apple-touch-icon.png`
- PWA图标：`public/pwa-icons/`目录下有不同尺寸的图标

### PWA特性

- 离线访问：即使没有网络连接，也能访问应用
- 可安装：可以添加到主屏幕，像原生应用一样使用
- 缓存管理：自动缓存应用资源，提高加载速度
- 自动更新：当发布新版本时，应用会自动更新

## 如何测试 PWA 功能

1. 运行构建命令：`npm run build`
2. 使用 `npx serve dist` 或其他静态服务器预览构建版本
3. 在手机浏览器中访问应用，可以添加到主屏幕
4. 测试离线模式：开启飞行模式后尝试访问应用

## Git配置

项目已配置.gitignore文件，以排除不必要的文件和目录：
- node_modules/（依赖包）
- dist/（构建输出）
- 各类日志文件
- 编辑器配置文件 