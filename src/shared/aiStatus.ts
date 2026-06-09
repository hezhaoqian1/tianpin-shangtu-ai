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
      label: "降级演示",
      title: "远端失败，已自动兜底",
      detail: "面试现场即使网络或密钥不可用，也会回到稳定 mock 诊断，保证完整流程可演示。",
      securityNote
    };
  }

  return {
    label: "本地演示",
    title: endpointConfigured ? "服务端 mock 流程" : "稳定 mock 流程",
    detail: endpointConfigured
      ? "当前服务端使用 mock provider，适合无密钥场景下稳定演示。"
      : "当前不依赖网络和模型密钥，直接使用本地 mock 诊断。",
    securityNote
  };
}
