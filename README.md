# 图片分割工具

一个简洁高效的在线图片分割工具，支持自定义行列数分割图片，一键打包下载。

## 功能特性

### 核心功能

- **图片上传**：支持拖放上传和文件选择，支持 JPG、PNG、WebP 格式
- **自定义分割**：支持 1-20 行/列的自由分割设置
- **实时预览**：上传图片后可预览分割网格效果
- **快速预设**：内置常用分割预设（2×2、3×3、4×4 等）
- **一键下载**：支持单独下载或打包下载所有分割图片

### 输出设置

- **输出格式**：PNG、JPG、WebP
- **质量设置**：10-100% 可调
- **命名模板**：支持自定义命名模板（{original}、{index}）

### UI/UX

- **响应式设计**：支持桌面端和移动端
- **深色模式**：自动适配系统主题，可手动切换
- **流畅动画**：优雅的交互动画和过渡效果
- **直观界面**：清晰的功能分区和操作反馈

## 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **UI 框架**：Tailwind CSS v4
- **状态管理**：Pinia
- **打包工具**：JSZip

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

### 运行测试

```bash
npm run test
```

## 部署

### Cloudflare Pages (推荐)

#### 方法一：通过 Cloudflare Dashboard 部署

1. 将代码推送到 GitHub/GitLab 仓库
2. 访问 [Cloudflare Pages](https://pages.cloudflare.com)
3. 点击 "Create a project" → "Connect to Git"
4. 选择你的仓库
5. 配置构建设置：
   - **Project name**: `img-cropping` (或自定义)
   - **Production branch**: `main` (或 `master`)
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 "Save and Deploy"
7. 等待部署完成，即可获得 `*.pages.dev` 域名

#### 方法二：使用 Wrangler CLI 部署

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler login
```

3. 部署项目：
```bash
wrangler pages deploy dist
```

#### Cloudflare Pages 配置说明

项目已包含以下 Cloudflare Pages 优化配置：

- `public/_redirects` - SPA 路由重定向配置
- `wrangler.toml` - Wrangler 配置文件
- 已优化 `vite.config.js` 和路由配置

### GitHub Pages

1. 在 `vite.config.js` 中修改 `base` 为你的仓库名：
```javascript
base: '/你的仓库名/',
```

2. 在 `src/main.js` 中修改路由 base：
```javascript
history: createWebHistory('/你的仓库名/'),
```

3. 将代码推送到 GitHub 仓库
4. 在仓库设置中启用 GitHub Pages
5. 选择 `gh-pages` 分支作为发布源

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
│   │   ├── Header.vue          # 页面头部
│   │   ├── ImageUpload.vue     # 图片上传组件
│   │   ├── ImagePreview.vue    # 图片预览组件
│   │   ├── SettingsPanel.vue   # 设置面板
│   │   └── Toast.vue           # 通知组件
│   ├── stores/          # Pinia 状态管理
│   │   ├── image.js            # 图片状态
│   │   └── settings.js         # 设置状态
│   ├── utils/           # 工具函数
│   │   ├── helpers.js          # 通用工具函数
│   │   └── imageProcessing.js  # 图片处理函数
│   ├── views/           # 页面组件
│   │   └── Home.vue            # 主页面
│   ├── assets/          # 静态资源
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── tests/               # 测试文件
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
2. 支持 JPG、PNG、WebP 格式

### 设置分割参数

1. 在右侧设置面板调整行数和列数
2. 使用快速预设按钮快速选择常用分割方式
3. 可预览分割网格效果

### 分割图片

1. 点击"分割图片"按钮开始分割
2. 等待处理完成，查看分割结果

### 下载图片

- **单独下载**：点击每张分割图片下方的下载按钮
- **打包下载**：点击"下载全部"按钮，自动打包为 ZIP 文件

## 性能优化

- **代码分割**：将第三方库分离到独立 chunk
- **构建优化**：使用 Terser 压缩代码

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动端浏览器

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
