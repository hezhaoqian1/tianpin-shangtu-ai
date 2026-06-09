# 0x 发条鸟应用商店级产品设计

日期：2026-06-10  
阶段：从 demo 流程升级为可上架移动 App 的第一版产品壳  
当前产品名：0x 发条鸟 / AI 卖货图助手  

## 1. 北极星

一句话：拍几张商品图，AI 帮卖家做成能直接发布的封面、详情拼图、瑕疵说明图和平台文案。

这不是泛拼图工具，也不是普通 AI 聊天工具。产品要服务一个具体工作：轻量卖家把商品更快、更可信、更像真人地发布出去。

首期核心用户：

- 闲鱼二手卖家，尤其是数码、服饰鞋包、潮玩、母婴、家居。
- 小红书种草/带货用户，需要封面图、标题贴纸和话题文案。
- 朋友圈小店主和小商家，一次处理多件商品，需要统一风格。

核心成功指标：

- 用户从登录后到拿到第一套发布资产包小于 3 分钟。
- 用户能清楚知道 AI 看懂了哪些图、保留了哪些瑕疵、输出了哪些平台资产。
- 用户能复用模板和历史作品，而不是每次从零开始。

## 2. 产品判断

市场上已经有强商品图工具，不能只靠“AI 修图”竞争。我们的优势要放在“卖货工作流”：

- Photoroom、Pixelcut、Canva 证明商品图、背景处理、模板化输出是成熟需求。
- 闲鱼 AI 相机正在教育用户“拍照即可上架”，说明发布链路会被平台自动化。
- 我们的空间是跨平台资产包：闲鱼真实可信、小红书可种草、朋友圈可复用、小店可上新。

结论：

1. 用户不是来“设计图片”，是来“把东西发出去卖”。
2. AI 对话是操作方式，不是一个单独 Tab。
3. 模板不是装饰素材，而是平台策略 + 品类规则 + 画布布局 + 文案语气。
4. 用户信任比炫技更重要，尤其不能默认隐藏瑕疵、修改成色或过度美化二手商品。

## 3. 首次进入体验

### 3.1 启动动效

目标：2 秒内解释产品，不做阻塞式炫技。

动画脚本：

1. 暖白背景中出现“0x 发条鸟”机械小鸟标志。
2. 发条轻微旋转，3 张商品照片从散乱状态飞入。
3. 照片整理成三张资产：封面、详情拼图、文案卡。
4. 最后一帧显示口号：拍几张图，AI 做成能发布的卖货图。
5. 登录卡片从底部滑上来。

规则：

- 首次打开：1800 至 2200ms。
- 二次打开：700ms logo 过渡。
- 点按屏幕可跳过。
- P0 用 React Native Animated 实现，不引入 Lottie/Rive。

### 3.2 登录注册

进入产品主页面前先登录/注册。原因不是强行拦截，而是产品的核心价值依赖账号：历史作品、风格记忆、高清导出、模板收藏、跨设备找回。

登录方式 P0：

- 手机号验证码：正式产品主入口。
- 微信登录：国内用户主入口，P0 先做 UI。
- Apple 登录：iOS 上架时如果提供第三方登录，需要按 Apple 要求支持。
- 邮箱登录：兜底入口。

P0 实现方式：

- 先做 demo auth gate，不接真实短信。
- 真实上线建议用 Supabase Auth 承接手机号、邮箱、OAuth、用户资料和 Row Level Security。
- 移动端不保存 OpenAI/Grok/第三方模型 API Key。

注册后偏好设置：

```text
你主要卖什么？
[闲置数码] [服饰鞋包] [美妆护肤] [母婴家居] [潮玩手作]

主要发哪里？
[闲鱼] [小红书] [朋友圈] [淘宝/小店]

你想要的默认风格？
[真实可信] [干净主图] [种草封面] [快速清库存]
```

## 4. 登录后主信息架构

主页面采用 5 个底部 Tab：

1. 工作台
2. 模板
3. 创建
4. 作品
5. 我的

### 4.1 工作台

用户每天打开后的默认页。

首屏层级：

1. 顶部问候和账号状态。
2. 主 CTA：拍商品 / 选照片。
3. 最近项目或继续编辑。
4. 今日推荐模板。
5. 生成额度和本周节省时间。

工作台不再是 landing page，不解释太多功能。用户应该马上知道下一步是“开始做一套发布图”。

### 4.2 模板

模板广场要做，但不是普通美图模板瀑布流。模板是卖货策略包。

模板卡片包含：

- 真实商品预览图。
- 适合平台：闲鱼、小红书、朋友圈、商品主图。
- 适合品类：数码、服饰、鞋包、美妆、母婴、家居、潮玩。
- 需要照片：正面、细节、瑕疵、配件。
- 输出内容：封面、详情拼图、文案、标签。
- 操作：用这个模板做一套。

模板分类：

- 平台：闲鱼封面、小红书 3:4、朋友圈九宫格、商品主图。
- 品类：数码、服饰鞋包、美妆、母婴、家居、潮玩。
- 目标：快速出闲置、提高点击、真实成色、清库存、今日上新。
- 风格：真实闲鱼风、干净棚拍风、小红书种草风、价格促销风。

### 4.3 创建

中间凸起主入口，不是普通列表页。点击后直接进入创建生产线。

生产线：

```text
选择平台/模板
  -> 拍照或选相册 3-8 张
  -> AI 商品诊断
  -> 生成 3 套发布资产包
  -> 对话改图
  -> 导出图片和文案
```

现有 `UploadScreen`、`DiagnosisScreen`、`PackSelectScreen`、`EditorScreen`、`ExportScreen` 继续复用，但外层要由主 Tab AppShell 管理。

### 4.4 作品

资产库，不只是历史列表。

内容：

- 草稿。
- 已导出。
- 已保存商品。
- 同款复用。
- 最近文案。

空状态要给出直接动作：还没有作品时显示“拍第一件商品”。

### 4.5 我的

账号和商业化入口。

内容：

- 账号资料。
- 会员/额度。
- 店铺偏好。
- 常用发布平台。
- 品牌语气。
- 隐私和数据管理。
- App Store 审核 demo 账号入口。

## 5. AI 生产线设计

### 5.1 AI 能力分层

P0 必须稳定，不依赖真实图像生成才能跑通。

分层：

1. 视觉理解：识别商品、品类、成色线索、瑕疵和缺失角度。
2. 结构化资产：返回 `ProductAnalysis -> PublishPack -> EditCommand`。
3. 画布渲染：用图层模型生成封面和详情拼图。
4. 对话修改：自然语言转为图层改动和文案改动。
5. 高级图像能力：背景移除、主体增强、局部重绘、阴影、超分，作为可插拔能力。

### 5.2 API 选择

P0 推荐：

- OpenAI Responses/Images：用于图片理解、结构化输出、图像生成/编辑。OpenAI 官方文档支持用 GPT Image 模型从文本生成和编辑已有图片，并提供图片编辑 endpoint。
- Supabase：用户、作品、模板收藏、导出记录、图片存储。
- Expo ImagePicker：拍照和相册选择。
- Expo ImageManipulator：本地裁剪、旋转、缩放等轻量处理。

P1 可接：

- remove.bg、Photoroom API、Clipdrop、fal.ai 等背景移除/商品图 API，作为后台模型路由候选。
- IMG.LY CreativeEditor SDK：如果要快速获得成熟移动端编辑器，可以评估商业 SDK。
- react-native-skia：如果继续自研画布和导出，需要用 Skia 承接性能和复杂图层。

暂不建议 P0 直接集成的开源方案：

- `prscX/react-native-photo-editor`、`NitrogenZLab/react-native-photo-editor`：功能覆盖裁剪、文字、贴纸，但偏原生桥接，维护和 Expo 兼容风险要验证。
- `nhn/tui.image-editor`：Web 端成熟，但不适合作为移动端 React Native 主编辑器。
- Android 原生 `burhanrashid52/PhotoEditor`：适合参考能力模型，不适合直接作为跨平台核心。

P0 结论：

先保留自研图层画布，因为我们需要的是“可解释发布资产包”，不是自由修图工具。真实图像编辑 API 和开源编辑器作为后续插件，不阻塞主产品成型。

## 6. 隐私和审核

关键原则：

- 用户主动选择照片，App 不默认读取整本相册。
- 不自动发布到闲鱼/小红书/朋友圈。
- 对二手商品不默认隐藏瑕疵，不自动篡改成色。
- 移动端不暴露模型 API Key。
- App Store 审核需要提供可登录 demo 账号和测试说明。

P0 UI 中必须可见：

- 登录页隐私说明。
- 上传页“只处理你选择的照片”说明。
- 诊断页“瑕疵会保留并标注”说明。
- 我的页“隐私与数据管理”入口。

## 7. 本轮代码落地范围

这轮先完成应用商店级产品壳，不一次性接真实后端：

- 新增启动动效。
- 新增登录/注册 gate。
- 新增登录后 5 Tab 主框架。
- 工作台首页替代旧首页，强调真实 app 工作台。
- 新增模板广场骨架和模板数据。
- 创建 Tab 复用现有生产线。
- 作品 Tab 复用 savedProjects。
- 我的 Tab 展示账号、额度、隐私、偏好。
- 文案去 demo 化，减少 mock/面试现场口吻。

非目标：

- 本轮不接真实短信、微信、Apple 登录。
- 本轮不引入新依赖，避免破坏 Expo 环境。
- 本轮不做真实高清图片导出。
- 本轮不接真实背景移除 API。

## 8. 参考资料

- OpenAI Image generation and edit docs: https://developers.openai.com/api/docs/guides/image-generation
- OpenAI image edit endpoint: https://developers.openai.com/api/reference/resources/images/methods/edit/
- Expo ImagePicker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo ImageManipulator: https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
- Supabase Expo React Native quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- Supabase Expo social auth: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
- Apple Sign in with Apple HIG: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
- Apple App Review guidance: https://developer.apple.com/distribute/app-review/
- IMG.LY React Native editor repo: https://github.com/imgly/editor-react-native
- React Native Photo Editor repo: https://github.com/prscX/react-native-photo-editor
- TOAST UI Image Editor repo: https://github.com/nhn/tui.image-editor

