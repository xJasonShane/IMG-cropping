# 图片裁剪工具

一个功能完整的在线图片裁剪工具，支持批量处理、多种输出格式和丰富的编辑功能。

## 功能特性

### 核心功能

- 图片上传：支持拖放上传和文件选择，支持 JPG、PNG、WebP 格式
- 裁剪功能：集成 Cropper.js，支持自由裁剪和预设比例
- 网格裁剪：可设置 1-20 行/列的网格批量裁剪
- 批量处理：支持同时处理多张图片并打包下载

### 编辑功能

- 图片旋转：支持 90 度旋转
- 图片翻转：支持水平和垂直翻转
- 历史记录：支持撤销/重做操作
- 图片滤镜：亮度、对比度、饱和度、灰度、模糊

### 输出设置

- 输出格式：JPG、PNG、WebP
- 质量设置：10-100% 可调
- 命名规则：支持自定义命名模板
- 预设模板：社交媒体头像、证件照等常用尺寸

### UI/UX

- 响应式设计：支持桌面端和移动端
- 深色模式：自动适配系统主题
- 流畅动画：优雅的交互动画和过渡效果
- 直观界面：清晰的功能分区和操作反馈

## 技术栈

- 前端框架：Vue 3 (Composition API)
- 构建工具：Vite
- UI 框架：Tailwind CSS
- 图片处理：Cropper.js
- 状态管理：Pinia
- 路由：Vue Router
- 打包工具：JSZip

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 部署

### GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `gh-pages` 分支作为发布源
4. 推送代码后会自动部署

或者使用 GitHub Actions：

```yaml
# .github/workflows/deploy.yml 已配置
# 推送到 main 分支即可自动部署
```

### Cloudflare Pages

1. 连接 GitHub 仓库
2. 构建命令：`npm run build`
3. 输出目录：`dist`
4. 环境变量：`NODE_VERSION=20`

### Vercel

1. 导入 GitHub 仓库
2. 构建命令：`npm run build`
3. 输出目录：`dist`
4. 框架预设：Vite

## 项目结构

```
IMG-cropping/
├── src/
│   ├── components/       # Vue 组件
│   │   ├── Header.vue
│   │   ├── ImageUpload.vue
│   │   ├── ImageCropper.vue
│   │   ├── ImageList.vue
│   │   ├── SettingsPanel.vue
│   │   ├── FiltersPanel.vue
│   │   └── LazyImage.vue
│   ├── composables/      # 组合式函数
│   ├── stores/          # Pinia 状态管理
│   │   ├── image.js
│   │   └── settings.js
│   ├── utils/           # 工具函数
│   │   ├── helpers.js
│   │   └── imageProcessing.js
│   ├── workers/         # Web Workers
│   │   └── imageWorker.js
│   ├── views/           # 页面组件
│   │   └── Home.vue
│   ├── assets/          # 静态资源
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── public/
├── .github/workflows/   # GitHub Actions
├── dist/                # 构建输出
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 使用说明

### 上传图片

1. 点击上传区域选择图片，或直接拖放图片到上传区域
2. 支持同时上传多张图片

### 裁剪图片

1. 在左侧选择要裁剪的图片
2. 使用鼠标拖拽调整裁剪区域
3. 使用工具栏按钮旋转或翻转图片
4. 点击"下载当前裁剪"保存单张图片

### 网格裁剪

1. 在右侧设置面板调整网格行数和列数
2. 点击"裁剪网格"按钮
3. 系统会自动将图片分割并打包下载

### 批量处理

1. 上传多张图片
2. 设置统一的裁剪参数
3. 点击"批量裁剪所有图片"
4. 等待处理完成后下载 ZIP 文件

### 应用滤镜

1. 在右侧滤镜面板调整各项参数
2. 使用预设按钮快速应用复古或黑白效果
3. 滤镜会实时应用到当前图片

## 性能优化

- 代码分割：将第三方库分离到独立 chunk
- 懒加载：图片使用 Intersection Observer 实现懒加载
- Web Worker：图片处理在后台线程执行，不阻塞 UI
- 构建优化：使用 Terser 压缩代码，移除 console

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动端浏览器

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
