# Docker Compose 部署说明

当前 Compose 会启动六个容器：

- `blog`：公开博客前端，Nginx 托管静态文件并代理 `/public`、`/files`
- `admin`：管理后台前端，Nginx 托管静态文件并代理后台 API
- `backend`：Express API
- `mysql`：业务数据库
- `rustfs`：S3 兼容对象存储
- `redis`：带 AOF 持久化的缓存

MySQL、Redis 和 RustFS 使用独立的内部 `data` 网络。宿主机只开放博客端口和后台管理端口，不应把 MySQL、Redis、RustFS 的端口直接暴露到公网。RustFS 端口目前只绑定到服务器的 `127.0.0.1`，本机程序可以访问，但不能从公网直连。

## 第一次部署

在 ECS 上安装 Docker Engine 和 Docker Compose 插件，然后在项目根目录执行：

```bash
cp .env.example .env
openssl rand -hex 32
```

将生成的随机值用于 `JWT_SECRET`，同时替换 `.env` 中所有 `CHANGE_ME_*`。生产环境首次启动时，如果管理员密码仍是 `123456`，后端会拒绝启动。

```bash
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs -f --tail=200 backend
```

默认访问地址：

- 博客：`http://服务器公网IP/`
- 管理后台：`http://服务器公网IP:8080/`
- 健康检查：在服务器内执行 `docker compose exec backend wget -qO- http://127.0.0.1:3000/health`

阿里云安全组至少开放 `22`、`80`、`8080`。`3306`、`3000`、`6379`、`9000`、`9001` 不开放公网。

## 数据和更新

`mysql_data` 保存数据库，`uploads` 保存当前版本上传的本地文件，`rustfs_data` 保存对象文件，`redis_data` 保存 Redis AOF。普通停止或更新容器不会删除它们。

```bash
docker compose down
git pull
docker compose up -d --build
```

不要在生产服务器执行 `docker compose down -v`，该命令会删除上述命名卷。

数据库备份示例：

```bash
docker compose exec -T mysql sh -c \
  'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction "$MYSQL_DATABASE"' \
  > "blog-$(date +%F).sql"
```

## RustFS 和 Redis 的接入顺序

容器现在可以提前启动，但应用目前还没有使用它们，不能把“容器正在运行”等同于“迁移完成”：

1. 后端引入 S3 SDK，通过 RustFS 的 S3 API 完成上传、读取、删除和容量统计。
2. 数据库只保存对象键或可公开访问的 URL，历史 `/files/*` 地址需要兼容或迁移。
3. 前端图片地址不再依赖后端容器本地目录；可继续由后端代理，或使用签名 URL。
4. Redis 接入会话/限流/热点查询缓存，并明确失效策略。
5. 做一次本地文件到 RustFS 的数据迁移和回滚演练，再切换生产流量。

当前代码仍然使用 `serve/public/files`，所以在完成上述改造前不要停用 `uploads` 卷。RustFS 管理台建议通过 SSH 隧道 `ssh -L 9001:127.0.0.1:9001 root@服务器IP` 访问，然后打开 `http://127.0.0.1:9001`；不要直接在阿里云安全组开放 `9000` 或 `9001`。

RustFS 镜像暂时使用 `latest`，正式接入文件上传前应改为一个经过验证的固定版本。
