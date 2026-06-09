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

export function formatPublishCopy(pack: PublishPack): string {
  return [
    pack.copy.titles[0],
    "",
    pack.copy.description,
    "",
    pack.copy.tags.map((tag) => `#${tag}`).join(" ")
  ].join("\n");
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
