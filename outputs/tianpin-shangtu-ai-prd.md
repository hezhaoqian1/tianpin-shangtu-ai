# 甜拼商图 AI 产品设计稿

日期：2026-06-09  
版本：v0.1  
定位：移动端 AI 卖货图与发布资产助手

## 1. 产品一句话

拍几张商品图，AI 自动生成一套能直接发布的卖货图片、详情拼图和平台文案。

## 2. 核心判断

不要做泛拼图工具，也不要做普通 AI 聊天 App。

真正有刚需的场景不是“我想把照片拼得好看”，而是：

- 我要尽快把东西发出去卖。
- 我要封面更容易被点击。
- 我要详情图更可信。
- 我要文案看起来像真人卖家，而不是硬广。
- 我要在闲鱼、小红书、朋友圈、小店等平台复用同一批图片。

所以产品核心不是“拼图”，而是“发布资产包”。拼图、AI 对话、抠图、文案、平台尺寸都是为了一个目标服务：让用户更快发布、更容易成交。

## 3. 目标用户

### 3.1 首期核心用户

每周发布 5-30 个商品的轻量卖家：

- 闲鱼二手卖家：数码、服饰、潮玩、母婴、家居。
- 小红书种草/带货用户：需要封面和种草图。
- 微商/朋友圈小店：需要快速做商品图和卖点图。
- 兼职副业卖家：没有设计能力，但愿意用工具省时间。

### 3.2 用户画像

**用户 A：闲鱼数码卖家**

- 手机拍了几张耳机、键盘、手机照片。
- 不会专业修图，但知道封面不好没人点。
- 害怕图片太假，买家不信。
- 想要真实、清楚、能卖出去的图片。

**用户 B：小红书种草用户**

- 想把商品/穿搭/护肤品做成漂亮封面。
- 需要标题、贴纸、色调、封面氛围。
- 对“好看”和“可分享”敏感。

**用户 C：朋友圈小店主**

- 一次要发很多商品。
- 想要统一风格、统一模板。
- 需要批量生成主图和卖点图。

## 4. 用户痛点

### 4.1 当前工作流

用户现在通常这样做：

1. 手机拍商品。
2. 打开醒图/美图/Canva/拼图 App。
3. 手动抠图、换背景、拼详情图。
4. 手写标题、卖点、成色说明。
5. 去不同平台再裁剪不同尺寸。
6. 反复修改，最后发布。

### 4.2 问题

- 工具割裂：修图、拼图、文案、尺寸裁剪不是一个流程。
- 门槛高：用户不知道什么封面更适合平台。
- 时间长：一个商品做完图片和文案可能要 10-30 分钟。
- 质量不稳定：太丑没人点，太假没人信。
- 缺少平台理解：闲鱼要真实，小红书要种草，淘宝主图要干净。

## 5. 产品原则

1. **发布优先，不是设计优先**  
   每个功能都要服务“更快发布”和“更容易点击/成交”。

2. **AI 生成可编辑资产，不生成死图**  
   AI 返回图层、模板、文案和编辑指令，用户还能继续改。

3. **真实感比炫技更重要**  
   闲鱼场景不能过度美化商品本体，尤其不能改颜色、改成色、隐藏瑕疵。

4. **默认给结果，不让用户从空白画布开始**  
   上传图片后先生成 3 套方案，用户选一套再微调。

5. **对话是操作方式，不是聊天目的**  
   用户说“背景别太假”“标题短一点”，AI 应该修改画布和文案。

## 6. 核心产品形态

### 6.1 产品名

首选：甜拼商图 AI

备选：

- 卖图 AI
- 图搭商图
- PicSeller AI
- 甜拼卖货版

### 6.2 主 slogan

拍几张图，AI 帮你做好一套能发布的卖货图。

### 6.3 第一屏

首页不是 landing page，而是移动端工作台：

```text
今天要发布什么？

[闲鱼卖货] [小红书种草]
[商品主图] [服饰上新]
[数码转卖] [朋友圈小店]

输入框：
例如：帮我把这双鞋做成闲鱼封面，真实一点，突出 9 成新
```

## 7. 端到端用户流程

### 7.1 主流程：闲鱼卖货

1. 用户打开 App。
2. 选择“闲鱼卖货”。
3. 上传 3-8 张商品图。
4. AI 分析图片：
   - 商品类型
   - 品牌/型号
   - 颜色/材质
   - 成色线索
   - 可见瑕疵
   - 缺失拍摄角度
5. AI 展示商品诊断卡：
   - “识别为：Sony WH-1000XM5 头戴耳机”
   - “建议突出：降噪、通勤、包装齐全”
   - “建议补拍：耳罩细节、充电口、包装盒”
   - “注意：不要隐藏耳罩磨损”
6. AI 生成 3 套资产包：
   - 真实闲鱼风
   - 干净商品图
   - 小红书种草风
7. 用户选择一套进入编辑器。
8. 用户通过对话继续改：
   - “标题短一点”
   - “背景别这么商业，真实一点”
   - “把瑕疵图放大”
   - “加一个 95 新标签”
9. 用户手动微调：
   - 拖拽图片
   - 缩放主体
   - 改标题
   - 换模板
10. 导出：
   - 封面图
   - 详情拼图
   - 瑕疵说明图
   - 发布标题
   - 商品描述
   - 标签建议

### 7.2 次流程：小红书种草

1. 选择“小红书种草”。
2. 上传商品/自拍/生活方式图片。
3. 输入诉求：
   - “做成甜酷风封面”
   - “适合护肤品种草”
   - “标题像小红书爆款，但别太夸张”
4. AI 生成：
   - 3:4 封面
   - 标题贴纸
   - 种草文案
   - 话题标签
5. 用户对话修改。
6. 导出小红书尺寸。

### 7.3 次流程：朋友圈小店

1. 选择“朋友圈小店”。
2. 上传商品图。
3. 选择风格：
   - 清爽上新
   - 今日特价
   - 节日促销
   - 高级简洁
4. AI 生成长图和单品图。
5. 导出朋友圈九宫格或长图。

## 8. 资产包定义

每次生成的不是单张图，而是一个 `PublishPack`：

```text
PublishPack
├─ coverImage          封面图
├─ detailCollage       详情拼图
├─ flawCalloutImage    瑕疵说明图
├─ specImage           尺寸/规格图，可选
├─ lifestyleImage      场景图，可选
├─ titleOptions        标题候选
├─ description         商品描述
├─ sellingPoints       卖点 bullet
├─ conditionNote       成色说明
├─ tags                平台标签
└─ platformExports     平台尺寸导出
```

## 9. 信息架构

```text
App
├─ 首页
│  ├─ 场景入口
│  ├─ 自然语言输入
│  └─ 最近作品
├─ 图片上传
│  ├─ 相册选择
│  ├─ 拍摄引导
│  └─ 图片质量检查
├─ 商品诊断
│  ├─ 商品识别
│  ├─ 成色/瑕疵
│  ├─ 缺失角度提醒
│  └─ 平台建议
├─ 方案选择
│  ├─ 真实闲鱼风
│  ├─ 干净商品图
│  └─ 小红书种草风
├─ 编辑器
│  ├─ 画布
│  ├─ 图层
│  ├─ 模板
│  ├─ 文案
│  ├─ 背景
│  ├─ 贴纸/标签
│  ├─ AI 对话
│  └─ 撤销/重做
├─ 导出
│  ├─ 图片导出
│  ├─ 文案复制
│  ├─ 平台尺寸
│  └─ 分享
└─ 历史作品
   ├─ 资产包列表
   ├─ 同款复用
   └─ 风格记忆
```

## 10. 页面详细设计

### 10.1 首页

目标：让用户立刻开始，不被模板库淹没。

模块：

- 顶部输入框：`你今天要发布什么？`
- 场景按钮：闲鱼卖货、小红书种草、商品主图、朋友圈小店。
- 最近作品：展示最近生成的资产包。
- 快捷指令：
  - `做一套真实闲鱼图`
  - `做一张小红书封面`
  - `把商品图背景变干净`

交互：

- 点场景后进入上传页。
- 直接输入自然语言后，App 自动推断场景。

### 10.2 上传页

目标：让用户提供足够好的素材。

模块：

- 图片选择：3-8 张。
- 拍摄建议：
  - 正面
  - 背面
  - 细节
  - 瑕疵
  - 包装/配件
- 图片质量提示：
  - 太暗
  - 主体太小
  - 模糊
  - 缺少细节图

交互：

- 用户可以跳过补拍，但 AI 会提示“结果可能不完整”。
- 允许只上传 1 张图，但会生成更简化的资产包。

### 10.3 商品诊断页

目标：体现 AI 不是只做美化，而是真的理解发布场景。

模块：

```text
识别结果
商品：AirPods Pro 2
类目：数码配件
疑似成色：轻微使用痕迹

建议突出
- 降噪
- 续航
- 包装齐全

建议补充
- 充电盒细节
- 耳机底部接口

风险提醒
- 不建议隐藏明显划痕
```

交互：

- 用户可以改识别结果。
- 用户可以选择是否启用“真实模式”。

### 10.4 方案选择页

目标：先给结果，再让用户选方向。

每套方案展示：

- 封面缩略图
- 详情图缩略图
- 标题建议
- 风格说明

默认三套：

1. 真实闲鱼风  
   真实可信、弱设计感、强调成色和细节。

2. 干净商品图  
   背景统一、主体突出、适合主图。

3. 小红书种草风  
   标题更强、氛围更明显、适合曝光。

### 10.5 编辑器页

目标：一屏完成“看、改、导出”。

布局：

```text
顶部：返回 / 当前平台尺寸 / 撤销 / 导出
中间：Skia 画布
底部：模板 / 文字 / 背景 / 标签 / 瑕疵 / AI
```

AI 面板：

- 底部抽屉。
- 支持文本输入和快捷 chips。
- 每次修改生成一个版本。
- 支持“恢复上一版”。

快捷 chips：

```text
更真实
更高级
标题短一点
突出成色
放大瑕疵
换成小红书风
生成 5 个标题
```

手动编辑能力：

- 图片拖拽、缩放、旋转。
- 文案编辑。
- 模板切换。
- 背景色/背景图切换。
- 标签位置调整。
- 瑕疵标注移动。

### 10.6 导出页

目标：让用户觉得“我现在就能发布”。

导出内容：

- 图片：
  - 封面图
  - 详情拼图
  - 瑕疵说明图
  - 小红书封面，可选
- 文案：
  - 标题 3-5 个
  - 商品描述
  - 成色说明
  - 标签
- 平台尺寸：
  - 闲鱼 1:1
  - 小红书 3:4
  - 淘宝/店铺 1:1
  - 朋友圈 3:4 或长图

交互：

- 保存到相册。
- 复制文案。
- 分享到平台。
- 保存为模板。

## 11. AI 能力设计

### 11.1 AI 角色拆分

```text
Vision Agent
负责看图：商品识别、成色、瑕疵、主体位置、图像质量。

Copy Agent
负责文案：标题、描述、卖点、标签、平台语气。

Layout Agent
负责排版：模板选择、主体位置、文字层级、图层结构。

Edit Agent
负责对话改图：把用户指令转成画布编辑命令。

Guard Agent
负责真实性：避免过度美化、隐藏瑕疵、改变商品本体。
```

### 11.2 AI 输出原则

AI 不直接输出“我建议你……”，而是输出结构化结果：

```text
分析结果
生成方案
编辑命令
风险提示
```

App 再把结构化结果渲染到 UI。

### 11.3 核心 JSON 协议

#### ProductAnalysis

```json
{
  "productType": "headphones",
  "productName": "Sony WH-1000XM5",
  "category": "digital_accessory",
  "condition": {
    "label": "lightly_used",
    "confidence": 0.72,
    "visibleIssues": [
      {
        "imageId": "img_03",
        "description": "ear pad has slight wear",
        "bbox": [0.32, 0.41, 0.22, 0.18]
      }
    ]
  },
  "sellingPoints": ["noise cancellation", "commute friendly", "case included"],
  "missingShots": ["charging port close-up", "accessories overview"],
  "truthfulnessWarnings": ["Do not hide visible ear pad wear"]
}
```

#### PublishPack

```json
{
  "platform": "xianyu",
  "style": "authentic_resale",
  "assets": [
    {
      "id": "cover_01",
      "type": "cover",
      "canvas": {
        "width": 1080,
        "height": 1080,
        "background": {
          "type": "color",
          "value": "#F4F1EA"
        },
        "layers": [
          {
            "id": "product_main",
            "type": "image",
            "imageId": "img_01",
            "x": 80,
            "y": 130,
            "width": 920,
            "height": 690,
            "cornerRadius": 28
          },
          {
            "id": "title",
            "type": "text",
            "text": "Sony 降噪耳机 95 新",
            "x": 78,
            "y": 855,
            "fontSize": 48,
            "fontWeight": "bold",
            "color": "#222222"
          }
        ]
      }
    }
  ],
  "copy": {
    "titles": [
      "Sony WH-1000XM5 降噪耳机 95 新",
      "自用索尼降噪耳机，通勤很稳",
      "Sony 头戴耳机，配件齐全"
    ],
    "description": "自用 Sony WH-1000XM5，功能正常，降噪和续航都很稳。耳罩有轻微使用痕迹，已在图片中标出，介意勿拍。",
    "tags": ["索尼耳机", "降噪耳机", "通勤耳机", "闲置数码"]
  }
}
```

#### EditCommand

```json
{
  "intent": "make_more_authentic",
  "operations": [
    {
      "type": "updateText",
      "layerId": "title",
      "text": "自用 Sony 耳机，95 新"
    },
    {
      "type": "updateBackground",
      "assetId": "cover_01",
      "background": {
        "type": "color",
        "value": "#F7F3EC"
      }
    },
    {
      "type": "addCallout",
      "assetId": "detail_01",
      "imageId": "img_03",
      "label": "耳罩轻微使用痕迹",
      "bbox": [0.32, 0.41, 0.22, 0.18]
    }
  ],
  "explanation": "已降低营销感，突出自用和真实成色。"
}
```

## 12. 功能优先级

### 12.1 P0：面试必须稳定

- 场景选择：闲鱼卖货、小红书种草。
- 相册选图。
- 商品诊断页。
- 生成 3 套方案。
- Skia 画布编辑。
- AI 对话改图。
- 标题/描述生成。
- 平台尺寸导出。
- Mock fallback：API 失败也能演示完整流程。

### 12.2 P1：明显加分

- 拍摄教练。
- 瑕疵标注。
- 成色标签。
- 封面评分。
- 版本历史。
- 同一批图生成多平台资产。
- 保存我的风格。
- 批量生成标题。

### 12.3 P2：野心产品

- 批量 SKU。
- 价格建议。
- 平台发布清单。
- 自动识别同类商品模板。
- 用户风格记忆。
- 团队模板库。
- 一键生成促销长图。
- 电商平台 API 发布集成。

## 13. 外部 API 依赖

### 13.1 核心结论

核心不是单纯用图像生成模型生成整张图。

这个产品的核心应是：

```text
多模态理解模型 + 结构化编辑指令 + Skia 可编辑画布 + 少量图像工具
```

也就是：

- AI 负责看懂商品、平台、用户指令。
- AI 生成结构化 `ProductAnalysis`、`PublishPack`、`EditCommand`。
- App 用 Skia 渲染可编辑图层。
- 图像生成/抠图 API 只处理背景、局部编辑、商品抠图等高价值步骤。

如果直接让图像模型生成整张商品图，会有三个问题：

- 可控性差：用户很难继续微调图层。
- 真实性风险：商品颜色、瑕疵、形状可能被改变。
- 演示不稳定：图像生成延迟和失败率会影响现场效果。

所以第一版必须坚持“画布优先、生成辅助”。

### 13.2 推荐模型分工

```text
Product Vision / 商品理解
  OpenAI multimodal model 或 Grok vision
  输入：商品图片 + 场景
  输出：ProductAnalysis

Copy / 文案
  OpenAI 或 Grok
  输入：商品分析 + 平台 tone
  输出：标题、描述、标签、成色说明

Layout / 排版
  OpenAI structured output
  输入：商品分析 + 图片数量 + 平台 preset
  输出：PublishPack / canvas layers

Edit / 对话改图
  OpenAI structured output
  输入：当前 canvas state + 用户指令
  输出：EditCommand

Image Edit / 图像编辑
  gpt-image-2 / gpt-image-1.5 / Photoroom / remove.bg / Cloudinary / fal.ai
  输入：图片、mask、背景诉求
  输出：背景图、局部编辑图、商品抠图
```

### 13.3 GPT Image 应该怎么用

适合用：

- 生成商品场景背景。
- 局部背景替换。
- 生成小红书风格背景图。
- 生成促销氛围图。
- 对非商品主体做图片编辑。

不适合第一版主流程依赖它：

- 不要让它直接重绘整个商品封面。
- 不要用它修改商品本体。
- 不要让它负责所有拼图排版。
- 不要依赖它做透明商品抠图。

根据 OpenAI 官方文档，GPT Image 系列当前包括 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`。它们可以通过 Image API 做图片生成和编辑，也可以通过 Responses API 的 image generation tool 做多轮图片体验。官方文档还说明透明背景取决于模型支持；商品抠图、主体保真和电商级背景处理仍建议优先交给 Photoroom、remove.bg、Cloudinary 或类似专业服务。

### 13.4 必需

**LLM + Vision**

- OpenAI：视觉理解、结构化输出、文案、编辑指令。
- Grok/xAI：可作为替代模型或文案模型。

**图片存储**

- Supabase Storage、Cloudflare R2 或 Cloudinary。

### 13.5 推荐

**抠图/商品图**

- Photoroom API：商品抠图、商品背景、商业图处理。
- remove.bg：轻量背景移除。
- Cloudinary：图片裁剪、压缩、背景处理。

**生成式图片**

- fal.ai：背景生成、图像编辑模型。
- Replicate：多模型快速接入。
- ComfyUI：如果要贴近量子堆栈 AIGC 岗位，可以作为高级图像工作流。

### 13.6 可后置

- OCR：识别包装文字、型号。
- 价格参考 API：后续做价格建议。
- 平台发布 API：面试 demo 不接，先导出图片和文案。

## 14. 登录注册与账号体系

### 14.1 核心结论

产品化需要登录注册；面试 demo 不应该被登录注册拖慢。

推荐策略：

```text
Demo：游客模式优先，后台静默创建 anonymous user。
产品版：手机号/邮箱/第三方登录。
中国用户版：手机号验证码 + 微信登录。
```

第一版打开 App 不弹登录，用户可以直接体验完整流程。只有在保存历史作品、同步风格、导出高清图、使用付费额度时才提示登录。

### 14.2 登录方式

P0：

- 游客模式。
- Supabase anonymous auth 或本地 guest session。
- 用户可生成和导出一次完整资产包。

P1：

- 邮箱验证码或 magic link。
- 手机号验证码，如果有短信服务。
- 绑定游客历史作品到正式账号。

P2：

- 微信登录。
- Apple 登录。
- 抖音/小红书授权不建议首版接，复杂度高。

### 14.3 登录触发点

不在首页强制登录。

触发登录的场景：

- 保存历史作品。
- 保存个人风格。
- 导出高清图。
- 批量生成。
- 使用真实图像生成额度。
- 跨设备同步。

### 14.4 用户权益设计

```text
游客
  可生成 1 个资产包
  可导出普通清晰度
  历史只保存在本地

登录用户
  保存历史作品
  保存个人风格
  每日免费额度
  可恢复作品

付费用户
  高清导出
  更多 AI 生成次数
  批量 SKU
  高级平台模板
  商用背景/高级抠图
```

## 15. 数据库设计

### 15.1 推荐数据库

推荐 Supabase：

- PostgreSQL 适合结构化数据和 JSONB 画布状态。
- Supabase Auth 可以快速做账号。
- Supabase Storage 可以存用户图片和导出图。
- Row Level Security 适合保护用户资产。

如果后端部署在 Vercel，也可以用 Neon + Clerk + R2，但 Supabase 对 vibe coding 更顺手。

### 15.2 核心表

#### users

由 Supabase Auth 管理。业务表中只引用 `user_id`。

#### profiles

```text
id                uuid primary key
user_id           uuid unique
display_name      text
avatar_url        text
default_platform  text
created_at        timestamptz
updated_at        timestamptz
```

#### projects

一个用户的一次商品发布任务。

```text
id                uuid primary key
user_id           uuid
title             text
scenario          text      -- xianyu / xiaohongshu / shop_main / wechat
status            text      -- draft / generating / ready / exported / failed
product_type      text
product_name      text
created_at        timestamptz
updated_at        timestamptz
```

#### media_assets

用户上传图、处理图、导出图。

```text
id                uuid primary key
user_id           uuid
project_id        uuid
kind              text      -- upload / cutout / background / export
storage_path      text
width             integer
height            integer
mime_type         text
metadata          jsonb
created_at        timestamptz
```

#### product_analyses

商品识别与诊断结果。

```text
id                uuid primary key
project_id        uuid
model             text
analysis          jsonb     -- ProductAnalysis
confidence        numeric
created_at        timestamptz
```

#### publish_packs

一次生成的资产包。

```text
id                uuid primary key
project_id        uuid
platform          text
style             text
status            text
copy              jsonb
score             jsonb
created_at        timestamptz
updated_at        timestamptz
```

#### canvases

每张可编辑图片的画布状态。

```text
id                uuid primary key
publish_pack_id   uuid
asset_type        text      -- cover / detail / flaw_callout / spec / lifestyle
width             integer
height            integer
background        jsonb
layers            jsonb
version           integer
created_at        timestamptz
updated_at        timestamptz
```

#### edit_commands

每次 AI 对话改图的记录。

```text
id                uuid primary key
project_id        uuid
publish_pack_id   uuid
user_message      text
command           jsonb     -- EditCommand
model             text
status            text      -- applied / rejected / failed
created_at        timestamptz
```

#### ai_runs

AI 调用日志，用于调试、成本分析和面试展示技术成熟度。

```text
id                uuid primary key
user_id           uuid
project_id        uuid
task_type         text      -- vision / copy / layout / edit / image_edit
provider          text      -- openai / xai / photoroom / fal / mock
model             text
input_tokens      integer
output_tokens     integer
cost_estimate     numeric
latency_ms        integer
status            text
error_code        text
created_at        timestamptz
```

#### style_presets

用户保存的个人风格。

```text
id                uuid primary key
user_id           uuid
name              text
platform          text
preset            jsonb
created_at        timestamptz
updated_at        timestamptz
```

#### usage_credits

额度与付费相关。

```text
id                uuid primary key
user_id           uuid
period_start      timestamptz
period_end        timestamptz
free_runs_used    integer
paid_runs_used    integer
image_runs_used   integer
updated_at        timestamptz
```

### 15.3 首版可简化

面试 demo 不需要一次实现所有表。

P0 最小数据库：

```text
profiles
projects
media_assets
publish_packs
canvases
edit_commands
ai_runs
```

如果时间特别紧，甚至可以先本地 Zustand + mock 数据跑通，再补 Supabase。

## 16. 技术架构

推荐 TypeScript 全栈。

```text
apps/mobile
  Expo React Native
  TypeScript
  Expo Router
  React Native Skia
  Reanimated
  Gesture Handler
  Zustand
  expo-image-picker
  expo-media-library
  expo-sharing

apps/api
  Next.js API Routes
  TypeScript
  OpenAI SDK
  xAI HTTP client
  Zod
  image upload / signed URLs

packages/shared
  Zod schemas
  canvas command types
  platform presets
  template definitions
```

### 16.1 数据流

```text
Mobile selects images
  -> API creates upload URLs
  -> Mobile uploads images
  -> API calls Vision Agent
  -> API returns ProductAnalysis
  -> API creates PublishPack candidates
  -> Mobile renders candidates
  -> User selects one
  -> Mobile opens Skia editor
  -> User sends chat instruction
  -> API returns EditCommand
  -> Mobile applies operations to canvas state
  -> User exports images and copy
```

### 16.2 安全原则

- API key 不放移动端。
- 图片上传走服务端签名 URL。
- 用户图片可设置过期删除。
- 真实模式下禁止 AI 擅自改变商品本体颜色、形状、瑕疵。
- 每个 AI 输出都用 Zod 校验，不合格则 fallback 到安全模板。

## 17. UI 设计方向

### 17.1 核心判断

UI 非常重要，而且不能做成常见 AI 模板风格。

要避免：

- 大面积紫蓝渐变。
- 玻璃拟态卡片堆叠。
- 满屏“AI magic”文案。
- 花哨发光边框。
- 聊天机器人占据主视觉。
- 营销 landing page 式首页。

这个产品应该像一个“移动端卖货工作台”，不是一个 AI 玩具。

### 17.2 视觉气质

关键词：

```text
真实
清爽
可信
轻商业
移动端工具感
有一点小红书精致感，但不过度网红
```

建议视觉：

- 背景：温暖浅灰或纸白，不用纯白刺眼。
- 主色：墨黑/炭黑用于文字和主按钮。
- 辅色：低饱和薄荷绿或珊瑚红，用于状态和标签。
- 强调色：只在导出、生成、评分等关键动作使用。
- 卡片：少用大圆角，半径控制在 8px 左右。
- 图像：商品图永远是视觉主角，UI 不抢商品图。

### 17.3 页面风格

首页：

- 像工作台，不像欢迎页。
- 顶部是一条自然语言任务输入。
- 场景入口用紧凑图标按钮，不做大卡片海报。
- 最近作品以横向缩略图展示。

上传页：

- 强调拍摄清单和图片质量。
- 用“缺正面/缺细节/缺瑕疵”这种任务状态，而不是 AI 夸张提示。

商品诊断页：

- 像质检报告，不像聊天回复。
- 用清晰分组展示识别、卖点、缺失照片、真实性提醒。

编辑器：

- 全屏画布优先。
- 工具栏密度高但清楚。
- AI 面板是底部抽屉，不永久占屏。
- 用户主要看画面，不看 AI 聊天。

导出页：

- 像发布清单。
- 图片、标题、描述、标签分块清楚。
- 让用户一眼觉得“可以去发布了”。

### 17.4 字体与排版

移动端 UI：

- 中文系统字体优先，避免奇怪 webfont。
- 标题短、密度适中。
- 按钮文字不超过 6 个汉字。
- 列表项高度稳定，避免动态内容撑乱页面。

画布模板：

- 闲鱼风：真实、清楚、少装饰。
- 小红书风：标题强，但不做廉价爆款风。
- 商品主图：干净、对齐、留白。

### 17.5 交互动效

动效克制：

- 生成方案时用进度步骤，不用夸张 loading。
- AI 应用编辑命令时，高亮变化的图层 0.6 秒。
- 导出成功用轻量 toast。
- 手势拖拽必须顺滑，优先级高于花哨转场。

## 18. 模板系统

### 18.1 平台 preset

```text
xianyu
  cover: 1080x1080
  detail: 1080x1440
  tone: authentic, clear, not over-designed

xiaohongshu
  cover: 1080x1440
  tone: expressive, title-driven, lifestyle

shop_main
  cover: 1080x1080
  tone: clean, product-first

wechat
  long_image: 1080x1920
  tone: promotional, readable
```

### 18.2 模板类型

- 单品大图 + 标题。
- 主图 + 细节九宫格。
- 左主图右卖点。
- 瑕疵标注图。
- 小红书标题封面。
- 朋友圈促销长图。

## 19. 封面评分

AI 给当前封面 0-100 分，并解释原因：

```text
主体突出度：88
标题可读性：76
真实可信度：91
平台匹配度：84
点击吸引力：80
```

改进建议：

- 标题稍大一点。
- 主体右侧留白过多。
- 可以增加“配件齐全”标签。

这个功能很适合面试演示，因为它把 AI 从“生成器”变成“产品顾问”。

## 20. 真实模式

闲鱼场景默认开启真实模式。

真实模式规则：

- 不改变商品本体颜色。
- 不隐藏明显瑕疵。
- 不生成不存在的配件。
- 不虚构品牌、型号、成色。
- 允许优化背景、亮度、裁剪和排版。
- 瑕疵应被标注，而不是被抹掉。

这会让产品显得更成熟，也避免“AI 修图导致买卖纠纷”的风险。

## 21. 面试演示脚本

### 21.1 演示目标

用 2-3 分钟证明：

- 这是一个真实移动端 App。
- AI 能理解商品和平台场景。
- AI 能驱动画布，而不是只聊天。
- 用户能导出可发布图片和文案。

### 21.2 推荐演示

商品：耳机、包、鞋、键盘任选一个。

步骤：

1. 打开 App，选择“闲鱼卖货”。
2. 上传 4 张商品图。
3. AI 诊断：
   - 识别商品。
   - 给出卖点。
   - 提醒缺少细节图。
4. 展示 3 套方案：
   - 真实闲鱼风。
   - 干净商品图。
   - 小红书种草风。
5. 选择“真实闲鱼风”。
6. 对 AI 说：
   - `标题短一点，背景别太商业，瑕疵说明更明显`
7. 画布自动变化。
8. 手动拖动一张图。
9. 导出封面图、详情拼图、标题和描述。

### 21.3 面试话术

> 我最开始没有选择做一个泛拼图工具，因为泛拼图的刚需不强。真正强需求是移动端卖家需要快速把随手拍的商品图变成可发布资产。这个 Demo 的核心是自然语言驱动画布：AI 不是单纯聊天，也不是生成一张死图，而是生成结构化编辑指令，移动端把它变成可编辑的图片、文案和平台尺寸。

## 22. MVP 开发范围

### 22.1 5 天面试版

Day 1：

- Expo 项目。
- 首页、场景选择、上传页。
- 基础图片选择。

Day 2：

- 商品诊断页。
- Mock ProductAnalysis。
- 方案选择页。

Day 3：

- Skia 画布。
- 3 个模板。
- 文字、图片、背景图层。

Day 4：

- AI 对话面板。
- EditCommand 协议。
- OpenAI/Grok API 接入。
- Mock fallback。

Day 5：

- 导出页。
- 保存图片。
- 文案复制。
- 视觉 polish。
- 准备演示素材和 30 秒录屏。

### 22.2 稳定演示底线

即使所有外部 API 挂掉，App 也必须能：

- 上传图片。
- 展示 mock 诊断。
- 生成 mock 三套方案。
- 对话触发 mock 编辑命令。
- 导出图片。

## 23. 风险与对策

### 风险 1：功能太多，主线不清

对策：面试只演示“闲鱼卖货”一条主链路，小红书作为第二场景点到为止。

### 风险 2：图片 AI 不稳定

对策：P0 不依赖真实生成式图片，先用模板、裁剪、背景、文字、贴纸完成效果。生成背景作为加分项。

### 风险 3：画布编辑实现复杂

对策：首版限制图层类型：image、text、label、callout、background。先不做复杂滤镜。

### 风险 4：AI 输出不稳定

对策：所有 AI 输出必须走 Zod 校验，失败 fallback 到预设模板。

### 风险 5：商品真实性争议

对策：闲鱼场景默认真实模式，强调标注瑕疵而不是隐藏瑕疵。

## 24. 成功标准

### 产品成功

- 用户上传几张图后，1 分钟内拿到可发布资产包。
- 用户不需要理解模板和设计术语。
- 输出结果比随手拍图更清楚、更可信、更适合平台。

### 面试成功

- 面试官能在 30 秒内理解产品价值。
- 2-3 分钟内完成完整演示。
- 能讲清楚为什么不是普通拼图，也不是普通聊天。
- 技术上体现移动端、AI、图像编辑、结构化输出、API 编排。

## 25. 推荐开工版本

最终建议做：

```text
P0 + 部分 P1

主线：
闲鱼卖货资产包

加分：
小红书封面
封面评分
瑕疵标注
真实模式
```

不建议第一版做：

- 平台自动发布。
- 复杂电商 API。
- 价格比价。
- 多用户团队协作。
- 高复杂滤镜和专业修图。

这些可以讲成未来路线，但不要影响面试 demo 稳定性。

## 26. 下一步

1. 确认产品名和主场景。
2. 画页面 wireframe。
3. 定义 shared Zod schema。
4. 搭 Expo + Next.js 项目。
5. 先用 mock 数据跑完整链路。
6. 再逐步接 OpenAI/Grok/图像 API。
