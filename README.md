# 车间小工单

这是一个基于Vue 3和Vant的移动端工单管理系统的渐进式Web应用(PWA)，专为工厂车间环境设计，方便员工进行工单查询和报工操作。

## 功能特点

- 移动端自适应布局，适配各种屏幕尺寸
- 工单查询和处理，支持多种筛选和搜索方式
- 工单、工序、人员等信息智能选择
- 良品/不良品报工，支持不良品原因选择
- 支持离线访问，保证在网络不稳定环境下的可用性
- 可添加到手机主屏幕，提供类似原生应用的体验
- 用户个人信息管理和密码修改
- 完整的报工记录查询和管理

## 版本信息

- 当前版本: 202503071245
- 发布日期: 2025年3月7日

## 技术栈

- Vue 3 - 前端框架
- TypeScript - 类型安全的JavaScript超集
- Vite - 下一代前端构建工具
- Vue Router - 路由管理
- Pinia - 状态管理
- Vant UI - 移动端组件库
- PWA (VitePWA) - 渐进式Web应用支持
- Axios - HTTP客户端

## 项目运行

### 前置要求

- Node.js 16.0+ 
- npm 7.0+

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
# 或使用批处理文件
start.bat
```

应用将在 http://localhost:3000 启动，并自动在浏览器中打开。

### 生产环境构建

```bash
npm run build
```

构建产物将生成在 `dist` 目录中，可部署到任何静态文件服务器。

### 构建产物预览

```bash
npm run preview
```

## 项目结构

```
├── public/                # 静态资源
│   ├── pwa-icons/         # PWA图标资源
│   ├── vite.svg           # 网站图标
│   └── apple-touch-icon.png # iOS设备图标
├── src/                   # 源代码
│   ├── api/               # API接口和模拟数据
│   │   ├── index.ts       # API主入口
│   │   ├── types.ts       # API类型定义
│   │   └── workOrder.ts   # 工单相关API
│   ├── assets/            # 资源文件
│   │   └── styles/        # 样式文件
│   ├── components/        # 公共组件
│   ├── router/            # 路由配置
│   ├── styles/            # 全局样式
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   │   ├── Login.vue         # 登录页面
│   │   ├── WorkOrderList.vue # 工单列表页面
│   │   ├── ReportList.vue    # 报工列表页面
│   │   ├── WorkReport.vue    # 报工提交页面
│   │   ├── MyProfile.vue     # 个人信息页面
│   │   ├── ChangePassword.vue # 修改密码页面
│   │   ├── UpdateLog.vue     # 更新日志页面
│   │   ├── TaskList.vue      # 任务列表页面
│   │   └── NotFound.vue      # 404页面
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── pwa.ts             # PWA配置
├── index.html             # HTML模板
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
├── .env                   # 环境变量配置
├── start.bat              # 快速启动脚本
└── package.json           # 项目依赖和脚本
```

## 主要功能

### 登录系统

- 用户名和密码登录
- 记住登录状态
- 权限管理

### 工单列表

- 查看所有工单
- 筛选紧急工单
- 工单状态显示（待处理、进行中、已完成）
- 按条件搜索和筛选工单
- 工单排序功能

### 工单详情

- 查看工单详细信息
- 工单处理和报工
- 填写良品/不良品数量
- 记录处理时间和进度

### 报工页面

- 选择工单号、生产人员、工序名称
- 显示工单详细信息、产品信息等
- 填写报工数量（良品数/不良品数）
- 选择不良品原因
- 提交报工数据
- 查看历史报工记录

### 个人中心

- 查看和修改个人信息
- 修改密码
- 查看应用版本和更新日志

## PWA 配置说明

本项目已配置为 PWA 应用，命名为"车间小工单"。当前使用缓存版本为202503071245。

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
3. 在手机浏览器中访问应用
4. 在浏览器菜单中选择"添加到主屏幕"选项
5. 测试离线模式：开启飞行模式后尝试访问应用

## 兼容性

- 支持Android 5.0+和iOS 10.0+
- 推荐使用Chrome、Safari或其他现代浏览器
- 对于较旧的浏览器会优雅降级，提供基本功能

## 部署指南

1. 执行构建命令生成静态文件
   ```bash
   npm run build
   ```

2. 将dist目录下的文件部署到Web服务器
   - 可以使用Nginx、Apache等Web服务器
   - 也可以部署到云服务如Vercel、Netlify等

3. 配置服务器HTTPS（推荐）
   - PWA功能在HTTPS环境下表现最佳
   - 可以使用Let's Encrypt等免费SSL证书

## 开发注意事项

- 所有API请求都应通过 `/src/api` 目录下的文件进行
- 组件应遵循Vue 3的组合式API风格
- 确保所有页面都适配移动设备

## Git配置

项目已配置.gitignore文件，以排除不必要的文件和目录：
- node_modules/（依赖包）
- dist/（构建输出）
- dev-dist/（开发环境PWA输出）
- 各类日志文件
- 编辑器配置文件

## 问题反馈与贡献

如发现任何问题或有改进建议，请提交Issue或Pull Request。 