import { type AppAnalysisSource } from "./analysisClient";

export type AnalysisStatusParams = {
  source: AppAnalysisSource;
  endpointConfigured: boolean;
  fallbackReason?: string;
};

export type AnalysisStatus = {
  label: string;
  title: string;
  detail: string;
  securityNote: string;
};

export function getAnalysisStatus({
  source,
  endpointConfigured,
  fallbackReason
}: AnalysisStatusParams): AnalysisStatus {
  const securityNote = "移动端不保存 OpenAI/Grok API Key。";

  if (source === "remote") {
    return {
      label: "远端 AI",
      title: "服务端模型路由",
      detail: "图片元数据会发到 /api/analyze，由服务端选择 OpenAI、Grok 或其他模型。",
      securityNote
    };
  }

  if (endpointConfigured && fallbackReason) {
    return {
      label: "快速模式",
      title: "远端暂不可用，已自动兜底",
      detail: "网络或服务端密钥不可用时，会回到稳定诊断模式，保证用户仍能完成发布包流程。",
      securityNote
    };
  }

  return {
    label: "快速模式",
    title: endpointConfigured ? "服务端快速诊断" : "本机快速诊断",
    detail: endpointConfigured
      ? "当前服务端使用快速诊断 provider，适合无密钥场景下保持流程稳定。"
      : "当前不依赖网络和模型密钥，直接使用本机诊断策略。",
    securityNote
  };
}
