# 甜拼商图 AI 设计规格

用户可读版本见：`outputs/tianpin-shangtu-ai-prd.md`

本规格以输出目录中的 PRD 为当前权威设计稿。后续实现计划应从该 PRD 的 P0/P1 范围、AI JSON 协议、技术架构和演示脚本展开。

## TaskIntentDraft

目标：设计一个用于面试展示的移动端 AI 卖货图助手，用自然语言把随手拍商品图转换为可发布的封面、详情拼图、瑕疵说明图和平台文案。

范围：产品设计、页面结构、AI 能力、外部 API、技术架构、MVP 范围、面试演示脚本。

风险：泛拼图刚需不足；图像 AI 不稳定；功能过多导致主线不清；AI 可能过度美化商品造成真实性问题。

## BaselineReadSetHint

- 量子堆栈公开信息：工具类 App、SDK 聚合、AIGC/ComfyUI/图像生成岗位方向。
- 市场信号：Canva、Photoroom、闲鱼 AI 发布与 AI 托管相关公开报道。
- 技术倾向：Expo React Native + TypeScript + Skia + Next.js API + Zod structured outputs。

## ImpactStatementDraft

影响层：

- 移动端用户流程：首页、上传、商品诊断、方案选择、编辑器、导出。
- AI 协议：ProductAnalysis、PublishPack、EditCommand。
- 图像编辑：模板、图层、手势、导出。
- 服务端：模型路由、图片上传、结构化输出校验、fallback。

非目标：

- 第一版不做平台自动发布。
- 第一版不做复杂电商 API。
- 第一版不依赖真实图像生成作为演示主链路。
- 第一版不做专业级 Photoshop 式编辑器。

