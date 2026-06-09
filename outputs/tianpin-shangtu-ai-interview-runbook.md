# 甜拼商图 AI 面试演示 Runbook

日期：2026-06-10  
用途：移动端 AI 应用 demo 演示、技术讲解、面试追问准备

## 1. 一句话介绍

甜拼商图 AI 是一个移动端 AI 卖货图助手：用户上传几张商品照片，系统先做商品诊断，再生成封面图、详情拼图、平台文案和标签，最后可以用自然语言继续改图并导出发布包。

这不是普通拼图工具，也不是普通 AI 聊天 App。核心价值是帮助轻量卖家更快把商品发布出去，并且让图片和文案更适合闲鱼、小红书、商品主图、朋友圈小店这些不同场景。

## 2. 本地启动

先启动本地 API：

```bash
npm run api
```

再启动 Expo Web：

```bash
EXPO_PUBLIC_ANALYZE_ENDPOINT=http://localhost:3001/api/analyze \
EXPO_PUBLIC_EDIT_ENDPOINT=http://localhost:3001/api/edit \
npm run web -- --port 8081
```

打开：

```text
http://localhost:8081
```

面试现场如果网络或模型 key 不稳定，可以保持 `MODEL_PROVIDER=mock`。Demo 仍然能展示完整产品流程，因为 mock 会返回稳定的商品诊断和编辑指令。

## 3. 推荐演示路径

### 3.1 闲鱼主流程

1. 首页选择 `闲鱼卖货`。
2. 上传页展示闲鱼拍摄清单：正面主图、细节近景、瑕疵近景、配件/包装。
3. 点击 `使用样例图`。
4. 进入商品诊断页：
   - 识别 Sony WH-1000XM5 耳机。
   - 展示成色、卖点、补拍建议、真实模式提醒。
   - 展示 AI 链路状态，说明移动端不保存 OpenAI/Grok API Key。
5. 点击 `生成方案`。
6. 方案页展示 3 套发布资产，并标出 `首推` / `备选`。
7. 选择 `真实闲鱼风`。
8. 编辑器输入：

```text
标题短一点，背景真实一点，放大瑕疵说明
```

9. 点击 `应用 AI 改图`。
10. 观察画布和文案被结构化编辑命令更新。
11. 点击 `去导出`。
12. 导出页展示：
    - 封面图
    - 详情拼图
    - 发布文案
    - 平台标签
13. 点击 `标准导出` 和 `复制文案`，展示明确反馈。
14. 点击 `登录/注册` 进入 demo 账号。
15. 点击 `保存到历史`。
16. 回到首页，点击历史作品，恢复项目并继续编辑。

### 3.2 小红书对比流程

1. 回首页选择 `小红书种草`。
2. 使用样例图。
3. 方案页首推会变成 `小红书种草风`。
4. 导出文案会出现小红书语气：
   - 通勤降噪体验
   - 数码好物
   - 小红书数码

这个对比可以证明：平台选择不只是 UI 入口，而是影响拍摄清单、方案排序、文案语气、导出发布包。

## 4. 产品亮点

### 4.1 刚需场景

用户不是为了“做一张好看的拼图”，而是为了更快发布商品、更容易被点击、更可信地说明成色和瑕疵。

首期用户：

- 闲鱼二手卖家
- 小红书种草用户
- 朋友圈小店主
- 兼职副业卖家

### 4.2 产品闭环

```text
平台选择
→ 平台化拍摄清单
→ 上传商品图
→ AI 商品诊断
→ 生成 3 套发布资产包
→ 对话改图
→ 导出图片和文案
→ 登录保存历史
→ 恢复项目继续编辑
```

### 4.3 和普通工具的区别

普通拼图工具让用户从空白画布开始。这个 demo 的逻辑是：AI 默认给出可发布结果，用户只做少量选择和对话微调。

普通 AI 聊天 App 只回答文字。这个 demo 里的对话会转成结构化编辑命令，修改画布图层、背景、标签和文案。

## 5. 技术架构

### 5.1 前端

- Expo React Native
- TypeScript
- React Native Web 用于本地面试展示
- `expo-image-picker` 用于真实相册选择
- 无强制登录，游客可以先跑完整流程

### 5.2 AI 服务边界

移动端不直接调用 OpenAI/Grok，也不保存 API Key。

```text
Mobile App
  ├─ POST /api/analyze  商品诊断
  └─ POST /api/edit     对话改图

Local/Server API
  ├─ mock provider      稳定演示
  ├─ openai provider    OpenAI Responses API
  └─ grok provider      xAI Chat Completions API
```

相关文件：

- `src/shared/analysisClient.ts`
- `src/shared/editClient.ts`
- `src/server/modelRouter.ts`
- `src/server/editRouter.ts`
- `src/server/analyzeRoute.ts`
- `src/server/editRoute.ts`
- `src/server/devApiServer.ts`

### 5.3 为什么要 mock fallback

面试现场最怕网络、密钥、模型服务不稳定。这个 demo 有 fallback 策略：

- 没有 endpoint：本地 mock。
- endpoint 失败：mock fallback。
- provider key 缺失：mock fallback。

这样能保证完整演示链路不断，同时诊断页和编辑器会显示当前是远端 AI、本地演示还是降级演示。

### 5.4 结构化编辑

AI 改图不是返回一张不可编辑死图，而是返回 `EditCommand`：

```text
EditCommand
├─ intent
├─ operations
│  ├─ updateText
│  ├─ updateBackground
│  └─ addCallout
├─ copy
└─ explanation
```

这样可以继续保留画布图层，适合撤销、历史保存、继续编辑和二次导出。

## 6. 数据库设计

Supabase schema 已经放在：

```text
supabase/schema.sql
```

核心表：

- `profiles`：用户资料。
- `projects`：一个商品发布项目。
- `media_assets`：上传图、抠图、背景、导出图。
- `product_analyses`：AI 商品诊断结果。
- `publish_packs`：平台发布资产包。
- `canvases`：可编辑画布和图层。
- `edit_commands`：用户对话和 AI 编辑指令。
- `ai_runs`：模型调用、provider、耗时、成本、失败原因。
- `style_presets`：用户风格记忆。
- `usage_credits`：免费/付费额度。

这个设计支持从 demo 继续扩展到真实产品：登录、历史、高清导出、批量生成、风格复用、成本统计。

## 7. 模型选择建议

### 7.1 商品诊断和文案

适合使用多模态/文本模型，例如 OpenAI 或 Grok：

- 识别商品类型、品牌、型号。
- 判断成色和可见瑕疵。
- 生成平台文案。
- 输出结构化 JSON。

### 7.2 对话改图

模型负责生成结构化编辑指令，不直接把所有结果做成死图。

### 7.3 图像生成/编辑

后续真实版本可以接 GPT Image 系列或其他图像编辑服务，用于：

- 背景生成
- 局部修图
- 商品抠图
- 高清导出

但必须保留真实性边界：不能隐藏瑕疵、不能改变商品成色、不能把二手商品修得失真。

## 8. 面试讲法

### 8.1 产品侧

我没有做泛拼图工具，而是选择了轻量卖家的发布刚需。用户真正要的是能直接发出去的封面、详情图和文案，所以我把产品定义成“发布资产包”，不是“单张图片生成”。

### 8.2 技术侧

移动端用 Expo React Native 做快速 demo，AI 调用全部放在服务端边界。移动端只传图片元数据、画布状态和用户指令，不保存模型 key。服务端可以在 mock、OpenAI、Grok 之间切换，并且失败时自动 fallback。

### 8.3 工程侧

核心对象是 `PublishPack` 和 `EditCommand`。AI 生成的是可编辑资产和结构化操作，不是不可编辑死图。这让历史保存、继续编辑、风格复用和批量生成都能自然扩展。

### 8.4 UI 侧

我刻意避免做成泛 AI 模板风：没有紫蓝渐变、玻璃卡片和大聊天框。视觉方向更像移动端卖家工作台，信息密度更高，强调结果可发布。

## 9. 可能被问到的问题

### Q1：为什么不做纯 AI 聊天？

因为用户的任务不是聊天，而是发布商品。聊天只是操作方式，最终要修改画布、文案和导出资产。

### Q2：为什么不强制登录？

强制登录会挡住首屏体验。这个 demo 采用游客先体验，保存历史、高清导出、批量生成时再登录。

### Q3：真实图片生成怎么做？

服务端接图像模型或图像编辑 provider。移动端只关心画布状态和导出结果。这样可以替换模型，不影响前端流程。

### Q4：怎么防止 AI 把瑕疵修没？

产品里有真实模式。诊断阶段会提醒不要隐藏瑕疵；编辑阶段更偏结构化标注和布局调整，而不是默认美化商品本体。

### Q5：为什么适合量子堆栈？

他们的业务方向包含工具类 App、AI 对话类 App、仓管类 App、图片编辑类 App。这个 demo 把移动端工具、AI 对话、拼图编辑、发布资产管理结合在一起，能展示快速做产品闭环的能力。

## 10. 当前验证命令

```bash
npm test -- --run
npm run typecheck
npm run lint
npx expo export --platform web --output-dir dist-web
curl -s http://localhost:3001/health
```

当前 demo 的核心演示地址：

```text
http://localhost:8081
```

