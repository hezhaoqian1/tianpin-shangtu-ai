import { type CapabilityItem, type CapabilitySnapshot } from "../shared/capabilityClient";
import { createServerIntegrationConfig, type ServerIntegrationConfig } from "./env";
import { createModelRouterConfig, type ModelRouterConfig } from "./modelRouter";

export type CapabilityRouteResponse = {
  status: 200;
  body: CapabilitySnapshot;
};

export function handleGetCapabilitiesRequest(
  modelOverrides: Partial<ModelRouterConfig> = {},
  integrationOverrides: Partial<ServerIntegrationConfig> = {}
): CapabilityRouteResponse {
  const modelConfig = createModelRouterConfig(modelOverrides);
  const integrationConfig = createServerIntegrationConfig(integrationOverrides);

  return {
    status: 200,
    body: {
      generatedAt: new Date().toISOString(),
      items: createCapabilityItems(modelConfig, integrationConfig)
    }
  };
}

function createCapabilityItems(modelConfig: ModelRouterConfig, integrationConfig: ServerIntegrationConfig): CapabilityItem[] {
  const hasOpenAiKey = Boolean(modelConfig.openaiApiKey);
  const providerLabel =
    modelConfig.provider === "openai"
      ? `OpenAI-compatible / ${modelConfig.openaiModel}`
      : modelConfig.provider === "grok"
        ? `Grok / ${modelConfig.xaiModel}`
        : "Mock provider";

  return [
    {
      id: "api",
      label: "服务端 API",
      status: "ready",
      detail: "Railway API 已响应，移动端不会保存模型密钥。"
    },
    {
      id: "text_edit",
      label: "AI 对话编辑",
      status: modelConfig.provider === "mock" ? "mock" : hasOpenAiKey || modelConfig.xaiApiKey ? "configured" : "needs_config",
      detail: `${providerLabel}。用于根据用户指令修改标题、画布和发布文案。`
    },
    {
      id: "vision_analysis",
      label: "商品视觉诊断",
      status: modelConfig.provider === "mock" ? "mock" : hasOpenAiKey || modelConfig.xaiApiKey ? "configured" : "needs_config",
      detail: "需要模型网关支持图片输入；线上 smoke test 仍应确认是否真实返回 remote。"
    },
    {
      id: "image_generation",
      label: "AI 封面生图",
      status: hasOpenAiKey ? "configured" : "needs_config",
      detail: `图片模型：${integrationConfig.imageGeneration.model}。需要网关支持 /images/generations。`
    },
    {
      id: "storage",
      label: "图片存储",
      status: getStorageStatus(integrationConfig.storage),
      detail:
        integrationConfig.storage.provider === "s3"
          ? "S3/R2 上传已配置，生成图可落到公开 URL。"
          : "当前为 mock 存储，适合本地开发但不适合真实用户。"
    },
    {
      id: "projects",
      label: "作品库",
      status: integrationConfig.databaseUrl ? "configured" : "mock",
      detail: integrationConfig.databaseUrl ? "已配置 DATABASE_URL；不可用时会临时回退到内存存储。" : "未配置 DATABASE_URL，作品库仅临时保存在服务内存。"
    },
    {
      id: "background_removal",
      label: "去背景",
      status: getBackgroundRemovalStatus(integrationConfig.backgroundRemoval),
      detail:
        integrationConfig.backgroundRemoval.provider === "mock"
          ? "当前为 mock，占位展示；接入 remove.bg 或 Photoroom 后可变为真实去背景。"
          : `${integrationConfig.backgroundRemoval.provider} provider 已配置。`
    }
  ];
}

function getStorageStatus(storage: ServerIntegrationConfig["storage"]): CapabilityItem["status"] {
  if (storage.provider !== "s3") {
    return "mock";
  }

  return storage.bucket && storage.accessKeyId && storage.secretAccessKey && storage.publicBaseUrl ? "ready" : "needs_config";
}

function getBackgroundRemovalStatus(
  backgroundRemoval: ServerIntegrationConfig["backgroundRemoval"]
): CapabilityItem["status"] {
  if (backgroundRemoval.provider === "mock") {
    return "mock";
  }

  if (backgroundRemoval.provider === "removebg") {
    return backgroundRemoval.removeBgApiKey ? "configured" : "needs_config";
  }

  return backgroundRemoval.photoroomApiKey ? "configured" : "needs_config";
}
