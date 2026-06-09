import { type ProductAnalysis, type PublishPack, type Platform, type UploadedAsset } from "./productPipeline";
import { getLoginPromptCopy, type LoginPromptCopy, type UserSession } from "./session";

export type HistoryItem = {
  id: string;
  title: string;
  platform: Platform;
  platformLabel: string;
  styleLabel: string;
  assetSummary: string;
  coverCanvasId: string;
  updatedAtLabel: string;
};

export type CreateHistoryItemParams = {
  session: UserSession;
  pack: PublishPack;
  analysis: ProductAnalysis;
  uploadsCount: number;
};

export type CreateSavedProjectParams = {
  session: UserSession;
  pack: PublishPack;
  analysis: ProductAnalysis;
  uploads: UploadedAsset[];
};

export type SavedProject = {
  item: HistoryItem;
  pack: PublishPack;
  analysis: ProductAnalysis;
  uploads: UploadedAsset[];
};

export type CreateHistoryItemResult =
  | {
      status: "saved";
      item: HistoryItem;
    }
  | {
      status: "login_required";
      prompt: LoginPromptCopy;
    };

export type CreateSavedProjectResult =
  | {
      status: "saved";
      project: SavedProject;
    }
  | {
      status: "login_required";
      prompt: LoginPromptCopy;
    };

export type WorkspaceSummary = {
  heading: string;
  recentCountLabel: string;
  loginHint?: string;
};

export function createHistoryItemFromPack({
  session,
  pack,
  analysis,
  uploadsCount
}: CreateHistoryItemParams): CreateHistoryItemResult {
  if (session.kind === "guest") {
    return {
      status: "login_required",
      prompt: getLoginPromptCopy("save_history")
    };
  }

  return {
    status: "saved",
    item: {
      id: `${session.id}_${pack.id}`,
      title: analysis.productName,
      platform: pack.platform,
      platformLabel: getPlatformLabel(pack.platform),
      styleLabel: pack.title,
      assetSummary: `${pack.canvases.length} 张画布 / ${uploadsCount} 张原图`,
      coverCanvasId: pack.canvases[0]?.id ?? "cover",
      updatedAtLabel: "刚刚"
    }
  };
}

export function createSavedProjectFromPack({
  session,
  pack,
  analysis,
  uploads
}: CreateSavedProjectParams): CreateSavedProjectResult {
  const result = createHistoryItemFromPack({
    session,
    pack,
    analysis,
    uploadsCount: uploads.length
  });

  if (result.status === "login_required") {
    return result;
  }

  return {
    status: "saved",
    project: {
      item: result.item,
      pack,
      analysis,
      uploads
    }
  };
}

export function getWorkspaceSummary({
  session,
  historyItems
}: {
  session: UserSession;
  historyItems: HistoryItem[];
}): WorkspaceSummary {
  if (session.kind === "guest") {
    return {
      heading: "游客工作台",
      recentCountLabel: historyItems.length > 0 ? `${historyItems.length} 个本地作品` : "暂未保存",
      loginHint: "登录后保留历史、风格和高清导出记录。"
    };
  }

  return {
    heading: "卖家工作台",
    recentCountLabel: historyItems.length > 0 ? `${historyItems.length} 个历史作品` : "还没有历史作品"
  };
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
