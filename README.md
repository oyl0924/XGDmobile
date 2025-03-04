# 手机端报工系统

这是一个基于Vue 3和Ant Design Mobile的移动端报工系统的前端演示项目。

## 功能特点

- 移动端自适应布局
- 工单报工流程
- 工单、工序、人员等信息选择
- 良品/不良品报工
- 模拟数据演示

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Ant Design Vue
- Ant Design Mobile
- Less

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
├── public/              # 静态资源
├── src/
│   ├── api/             # API接口和模拟数据
│   ├── assets/          # 资源文件
│   ├── components/      # 公共组件
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── views/           # 页面视图
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html           # HTML模板
├── vite.config.ts       # Vite配置
├── tsconfig.json        # TypeScript配置
└── package.json         # 项目依赖
```

## 页面说明

### 报工页面

支持以下功能：

- 选择工单号、生产人员、工序名称
- 显示工单详细信息、产品信息、自定义字段等
- 填写报工数量（良品数/不良品数）
- 选择不良品原因
- 提交报工数据

## 后续扩展

- 添加用户登录功能
- 增加历史报工记录查询
- 集成实际后端API
- 支持离线报工
- 增加图表统计功能 