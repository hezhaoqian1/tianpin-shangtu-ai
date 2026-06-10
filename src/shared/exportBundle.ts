import { type CanvasAsset, type Platform, type PublishPack } from "./productPipeline";
import { getLoginPromptCopy, shouldPromptForLogin, type LoginPromptCopy, type UserSession } from "./session";

export type ExportAction = "standard" | "copy" | "high_res";

export type ExportBundleItem = {
  id: string;
  label: string;
  detail: string;
  sizeLabel: string;
  formatLabel: string;
};

export type ExportBundle = {
  platformLabel: string;
  summary: string;
  items: ExportBundleItem[];
  publishCopy: string;
  standardUnlocked: true;
  highResUnlocked: boolean;
};

export type ExportManifestFile = {
  id: string;
  kind: "image" | "copy" | "tags";
  fileName: string;
  label: string;
  detail: string;
  format: "PNG" | "TXT";
};

export type ExportManifest = {
  exportId: string;
  platformLabel: string;
  summary: string;
  files: ExportManifestFile[];
  publishCopy: string;
  checklist: string[];
};

export type ExportActionResult =
  | {
      status: "ready";
      message: string;
    }
  | {
      status: "login_required";
      prompt: LoginPromptCopy;
    };

export function createExportBundle(pack: PublishPack, session: UserSession): ExportBundle {
  const imageItems = pack.canvases.map(canvasToExportItem);
  const copyItems: ExportBundleItem[] = [
    {
      id: "publish_copy",
      label: "发布文案",
      detail: `${pack.copy.titles.length} 个标题候选，可直接粘贴到平台。`,
      sizeLabel: `${pack.copy.titles.length} 版`,
      formatLabel: "文本"
    },
    {
      id: "publish_tags",
      label: "平台标签",
      detail: pack.copy.tags.map((tag) => `#${tag}`).join(" "),
      sizeLabel: `${pack.copy.tags.length} 个`,
      formatLabel: "标签"
    }
  ];

  return {
    platformLabel: getPlatformLabel(pack.platform),
    summary: `${imageItems.length} 张图片 / ${pack.copy.titles.length} 个标题 / ${pack.copy.tags.length} 个标签`,
    items: [...imageItems, ...copyItems],
    publishCopy: formatPublishCopy(pack),
    standardUnlocked: true,
    highResUnlocked: !shouldPromptForLogin("high_res_export", session)
  };
}

export function createExportManifest(pack: PublishPack, session: UserSession, exportId = createLocalExportId()): ExportManifest {
  const bundle = createExportBundle(pack, session);
  const imageFiles: ExportManifestFile[] = pack.canvases.map((canvas, index) => ({
    id: canvas.id,
    kind: "image",
    fileName: `${String(index + 1).padStart(2, "0")}-${canvas.type}.png`,
    label: getCanvasLabel(canvas.type),
    detail: `${canvas.width}x${canvas.height} PNG`,
    format: "PNG"
  }));

  return {
    exportId,
    platformLabel: bundle.platformLabel,
    summary: bundle.summary,
    files: [
      ...imageFiles,
      {
        id: "publish_copy",
        kind: "copy",
        fileName: "publish-copy.txt",
        label: "发布文案",
        detail: `${pack.copy.titles.length} 个标题候选和 1 段描述`,
        format: "TXT"
      },
      {
        id: "publish_tags",
        kind: "tags",
        fileName: "publish-tags.txt",
        label: "平台标签",
        detail: `${pack.copy.tags.length} 个标签`,
        format: "TXT"
      }
    ],
    publishCopy: bundle.publishCopy,
    checklist: getPlatformChecklist(pack.platform)
  };
}

export function formatPublishCopy(pack: PublishPack): string {
  return [
    pack.copy.titles[0],
    "",
    pack.copy.description,
    "",
    pack.copy.tags.map((tag) => `#${tag}`).join(" ")
  ].join("\n");
}

function createLocalExportId() {
  return `export_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function evaluateExportAction(action: ExportAction, session: UserSession, pack?: PublishPack): ExportActionResult {
  if (action === "high_res" && shouldPromptForLogin("high_res_export", session)) {
    return {
      status: "login_required",
      prompt: getLoginPromptCopy("high_res_export")
    };
  }

  const imageCount = pack?.canvases.length ?? 0;
  const tagCount = pack?.copy.tags.length ?? 0;

  if (action === "copy") {
    return {
      status: "ready",
      message: `发布文案已复制：1 个标题、1 段描述、${tagCount} 个标签。`
    };
  }

  if (action === "standard") {
    return {
      status: "ready",
      message: `标准导出已准备：${imageCount} 张图片和 1 份文案。`
    };
  }

  return {
    status: "ready",
    message: `高清导出已加入任务记录：${imageCount} 张 PNG。`
  };
}

function canvasToExportItem(canvas: CanvasAsset): ExportBundleItem {
  return {
    id: canvas.id,
    label: getCanvasLabel(canvas.type),
    detail: getCanvasDetail(canvas.type),
    sizeLabel: `${canvas.width}×${canvas.height}`,
    formatLabel: "PNG"
  };
}

function getCanvasLabel(type: CanvasAsset["type"]): string {
  const labels: Record<CanvasAsset["type"], string> = {
    cover: "封面图",
    detail: "详情拼图",
    flaw_callout: "瑕疵说明图"
  };

  return labels[type];
}

function getCanvasDetail(type: CanvasAsset["type"]): string {
  const details: Record<CanvasAsset["type"], string> = {
    cover: "用于第一张主图，优先保证点击和真实感。",
    detail: "用于详情页或长图，集中展示细节和配件。",
    flaw_callout: "用于主动说明瑕疵，降低售后沟通成本。"
  };

  return details[type];
}

function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    xianyu: "闲鱼卖货",
    xiaohongshu: "小红书种草",
    shop_main: "商品主图",
    wechat: "朋友圈小店"
  };

  return labels[platform];
}

function getPlatformChecklist(platform: Platform): string[] {
  const common = ["上传封面图并确认第一屏主体清晰", "粘贴发布文案并检查成色描述", "确认标签和价格不夸大"];
  const platformSteps: Record<Platform, string[]> = {
    xianyu: ["补充瑕疵说明图，降低售后沟通成本", "确认交易方式和自提/邮寄说明"],
    xiaohongshu: ["把生活方式图放在第二张，避免首图过度营销", "检查种草语气是否真实克制"],
    shop_main: ["确认主图背景干净，主体占比适合货架流", "检查规格、配件和售后说明"],
    wechat: ["把价格和交易方式写在前两行", "确认朋友圈语气自然可信"]
  };

  return [...common, ...platformSteps[platform]];
}
