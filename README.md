# 个人博客

一个现代化的个人博客系统，支持 Cloudflare Pages + D1 SQLite 数据库部署。

## 功能特性

- 📝 简洁美观的登录页面
- ✍️ 强大的 Markdown 编辑器，支持实时预览
- 📱 响应式设计，适配各种屏幕尺寸
- 🎨 深色主题，护眼友好
- 🔒 简单的身份验证
- 💾 Cloudflare D1 SQLite 数据库存储
- 🚀 支持 Cloudflare Pages + Workers 部署

## 技术栈

- **前端框架**: React 18 + TypeScript
- **路由**: React Router v6
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **Markdown**: react-markdown
- **图标**: Lucide React
- **状态管理**: Zustand
- **后端**: Cloudflare Workers + D1 SQLite

## 本地开发

### 前置要求

- Node.js 18+
- npm 或 yarn 或 pnpm
- Cloudflare Wrangler CLI (用于本地测试 Workers)

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 测试 Cloudflare Worker

```bash
# 安装 Wrangler
npm install -g wrangler

# 创建 D1 数据库
wrangler d1 create blog-db

# 更新 wrangler.toml 中的 database_id
# 然后运行开发服务器
wrangler dev
```

## Cloudflare 部署

### 1. 创建 D1 数据库

```bash
wrangler d1 create blog-db
```

复制数据库 ID，更新 `wrangler.toml` 中的 `database_id` 字段。

### 2. 设置环境变量

在 Cloudflare Dashboard 或通过 CLI 设置：

```bash
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD
wrangler secret put JWT_SECRET
```

### 3. 部署 Worker

```bash
wrangler deploy
```

### 4. 初始化数据库

部署后，访问 `https://your-worker-url/api/init` 初始化数据表。

### 5. 部署前端（Cloudflare Pages）

1. 将代码推送到 GitHub 仓库
2. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
3. 点击 "Create a project" -> "Connect to Git"
4. 选择你的仓库
5. 配置构建设置：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
6. 在 Pages 设置中添加 Worker 路由：将 `/api/*` 路由到你的 Worker

## 使用说明

### 登录

- 默认用户名：`admin`
- 默认密码：`admin123`
- 访问 `/admin/login` 登录

### 管理文章

1. 登录后访问 `/admin/dashboard`
2. 点击 "新建文章" 创建新文章
3. 在编辑器中使用 Markdown 编写内容
4. 右侧实时预览效果
5. 点击 "保存" 发布文章

### 文章数据

所有文章数据存储在 Cloudflare D1 SQLite 数据库中。

## 项目结构

```
blog/
├── worker/               # Cloudflare Worker
│   └── index.ts         # API 后端
├── src/
│   ├── components/        # 组件
│   │   └── Navbar.tsx    # 导航栏
│   ├── pages/            # 页面
│   │   ├── Home.tsx      # 首页
│   │   ├── PostDetail.tsx # 文章详情页
│   │   ├── Login.tsx     # 登录页
│   │   ├── Dashboard.tsx # 管理面板
│   │   └── Editor.tsx    # 编辑器
│   ├── lib/              # 工具库
│   │   └── api.ts        # API 调用
│   ├── store/            # 状态管理
│   │   └── useBlogStore.ts
│   ├── types.ts          # 类型定义
│   ├── App.tsx           # 应用入口
│   ├── main.tsx          # 渲染入口
│   └── index.css         # 全局样式
├── wrangler.toml         # Cloudflare 配置
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 自定义配置

### 修改登录凭据

修改 `wrangler.toml` 中的环境变量或通过 Cloudflare Dashboard 设置 Secrets。

### 主题自定义

编辑 `tailwind.config.js` 中的颜色配置。

## 许可证

MIT
