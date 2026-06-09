# 0x 发条鸟 / AI 卖货图助手

拍几张商品图，AI 帮卖家做成一套能直接发布的卖货图和平台文案。

当前项目是 Expo / React Native App，加一个轻量 Node API 服务。移动端只请求业务接口，模型 API key 只放在服务端环境变量里。

## 产品结构

- 启动动效：进入产品前的品牌过渡。
- 登录注册：当前是产品壳和本地会话，后续接真实手机号/微信/Apple/邮箱登录。
- 主 Tab：
  - 工作台：开始拍商品、继续编辑、查看额度。
  - 模板：卖货策略模板，不是单纯装饰模板。
  - 创建：进入上传、诊断、选资产包、对话编辑、导出流程。
  - 作品：历史作品和复用入口。
  - 我的：账号、额度、偏好、隐私入口。
- 后端 API：
  - `POST /api/analyze`
  - `POST /api/edit`
  - `GET /health`

## 本地运行

项目使用 Node 20。建议先切到 Node 20：

```bash
nvm use
```

安装依赖：

```bash
npm ci
```

启动移动端开发服务：

```bash
npm run start
```

启动 Web 预览：

```bash
npm run web
```

启动本地 API：

```bash
npm run api
```

## 本地环境变量

复制 `.env.example` 为 `.env`。`.env` 已被 git 忽略，不要提交。

本地只跑产品流程，可以先不填模型 key：

```env
MODEL_PROVIDER=mock
EXPO_PUBLIC_ANALYZE_ENDPOINT=
EXPO_PUBLIC_EDIT_ENDPOINT=
API_PORT=3001
API_HOST=0.0.0.0
```

如果要让 Expo App 调本地 API：

```env
EXPO_PUBLIC_ANALYZE_ENDPOINT=http://localhost:3001/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=http://localhost:3001/api/edit
```

真机调试时，`localhost` 通常指手机自己，需要换成电脑局域网 IP。

## Railway 部署

Railway 使用 [railway.toml](./railway.toml)：

- Nixpacks 构建。
- `npm run api` 启动服务。
- `/health` 作为健康检查。

Railway 后端变量：

```env
MODEL_PROVIDER=openai
OPENAI_BASE_URL=https://api.apexpoc.com/v1
OPENAI_API_KEY=填新的服务端 key
OPENAI_MODEL=gpt-5-mini
API_HOST=0.0.0.0
```

如果 Railway 仍然选择 Node 18，在 Variables 里额外加：

```env
NIXPACKS_NODE_VERSION=20
```

部署成功后，把 Expo 前端 endpoint 指向 Railway 域名：

```env
EXPO_PUBLIC_ANALYZE_ENDPOINT=https://你的-railway-域名/api/analyze
EXPO_PUBLIC_EDIT_ENDPOINT=https://你的-railway-域名/api/edit
```

更多部署说明见 [docs/deployment.md](./docs/deployment.md)。

## 安全边界

- 不要把 `OPENAI_API_KEY` 放进 Expo App。
- 不要把真实 key 写进 `.env.example`、README、测试或提交记录。
- 用户上传照片只通过用户主动选择进入流程。
- 二手商品诊断不能默认隐藏瑕疵或篡改成色。

## 验证

```bash
npm run typecheck
npm test -- --run
npm run lint
```

Railway 生产路径可用下面方式模拟：

```bash
npx npm@10.8.2 ci --omit=dev
API_PORT=3210 npm run api
curl http://127.0.0.1:3210/health
```

## 相关文档

- [AI model router](./docs/ai-model-router.md)
- [Deployment guide](./docs/deployment.md)
- [App-store product design](./docs/aegis/specs/2026-06-10-0x-clockwork-bird-app-store-design.md)
