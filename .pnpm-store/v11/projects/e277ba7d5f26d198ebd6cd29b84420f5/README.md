# 伊森随笔前端

独立于后台管理端的 Vue 3 博客前台，使用 TypeScript、Vue Router、Element Plus、Axios、TailwindCSS 和 Less。

## 启动

```bash
pnpm install
pnpm dev
```

开发地址为 `http://127.0.0.1:5174`。Vite 会把 `/public` 和 `/files` 代理到 `http://localhost:3000`。

生产环境可以复制 `.env.example` 为 `.env.local`，设置后端地址：

```bash
VITE_API_BASE_URL=https://api.example.com
```

## 脚本

```bash
pnpm typecheck
pnpm build
pnpm preview
```

## 页面

- `/`：编辑手记式首页，展示作者主张、封面文章和最近写作。
- `/articles`：文章分类、搜索和单列瀑布流。
- `/articles/:id`：文章正文、点赞、分享和匿名评论。
- `/photography`：摄影系列瀑布流。
- `/photography/:id`：摄影系列详情。
- `/diary`：日记时间轴。
- `/about`：关于页面。

## 公开接口

前台只调用以下无 JWT 接口：

| 方法 | 地址 | 用途 |
| --- | --- | --- |
| GET | `/public/site` | 首页公开内容数量 |
| GET | `/public/articles` | 已发布文章列表 |
| GET | `/public/articles/:id` | 已发布文章详情 |
| GET | `/public/articles/:id/comments` | 文章评论 |
| POST | `/public/articles/:id/comments` | 匿名发布评论 |
| POST | `/public/articles/:id/like` | 匿名点赞 |
| GET | `/public/categories` | 公开分类 |
| GET | `/public/photos` | 已发布摄影列表 |
| GET | `/public/photos/:id` | 已发布摄影详情 |
| GET | `/public/diaries` | 公开日记 |
| POST | `/public/visits` | 访问统计 |

后台 `/signin` 和其他管理接口继续使用原来的 JWT 鉴权，前台 Axios 实例不会携带后台 token。

## 匿名互动规则

- 评论只要求名称和正文，名称最多 20 字，正文最多 500 字。
- 同一临时 IP 每小时最多发布 10 条评论，限流在服务端执行。
- 点赞只保存文章总数量，不记录点赞人。
- 访问统计只保存页面、设备和时间。
- 评论名称可以保存在浏览器本地用于下次填写，但不形成账号。
