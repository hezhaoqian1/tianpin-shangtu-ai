import { type AppEditSource } from "./editClient";

export type EditStatusParams = {
  source?: AppEditSource;
  hasHistory: boolean;
  endpointConfigured: boolean;
  fallbackReason?: string;
};

export type EditStatus = {
  label: string;
  title: string;
  detail: string;
  securityNote: string;
};

export function getEditStatus({
  source,
  hasHistory,
  endpointConfigured,
  fallbackReason
}: EditStatusParams): EditStatus {
  const securityNote = "移动端只发送画布状态和用户指令，不保存模型密钥。";

  if (!hasHistory) {
    return {
      label: "待改图",
      title: "输入修改要求",
      detail: "AI 会返回可应用到画布的编辑指令，而不是直接生成不可编辑死图。",
      securityNote
    };
  }

  if (source === "remote") {
    return {
      label: "远端改图",
      title: "服务端编辑指令",
      detail: "用户指令和当前发布包会发送到 /api/edit，由服务端模型路由生成结构化编辑命令。",
      securityNote
    };
  }

  if (endpointConfigured && fallbackReason) {
    return {
      label: "降级改图",
      title: "远端失败，已使用稳定编辑指令",
      detail: "远端编辑不可用时自动使用稳定编辑指令，确保画布仍能继续修改。",
      securityNote
    };
  }

  return {
    label: "快速改图",
    title: endpointConfigured ? "服务端快速编辑" : "本机快速编辑",
    detail: endpointConfigured
      ? "当前编辑路由使用快速 provider，适合无密钥场景保持流程稳定。"
      : "当前不依赖网络，直接使用本机编辑命令更新画布和文案。",
    securityNote
  };
}
