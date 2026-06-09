import { type Platform, type UploadedAsset } from "./productPipeline";

export type UploadGuidance = {
  title: string;
  requiredShots: string[];
  toneHint: string;
};

export type UploadReadinessStatus = "empty" | "needs_more" | "ready";

export type UploadReadiness = {
  status: UploadReadinessStatus;
  messages: string[];
};

export function getUploadGuidance(platform: Platform): UploadGuidance {
  const guidance: Record<Platform, UploadGuidance> = {
    xianyu: {
      title: "闲鱼照片清单",
      requiredShots: ["正面主图", "细节近景", "瑕疵近景", "配件/包装"],
      toneHint: "真实比精修更重要，瑕疵要主动拍清楚。"
    },
    xiaohongshu: {
      title: "小红书照片清单",
      requiredShots: ["封面主图", "生活场景图", "细节质感", "使用前后/搭配"],
      toneHint: "优先准备能做封面的竖图和生活场景图。"
    },
    shop_main: {
      title: "商品主图清单",
      requiredShots: ["正面白底", "侧面角度", "材质细节", "规格/配件"],
      toneHint: "画面干净、主体完整，适合生成标准主图。"
    },
    wechat: {
      title: "朋友圈小店清单",
      requiredShots: ["单品主图", "卖点细节", "价格/规格", "库存/套装"],
      toneHint: "适合准备统一角度，后续可批量做成长图或九宫格。"
    }
  };

  return guidance[platform];
}

export function evaluateUploadReadiness(uploads: UploadedAsset[], platform: Platform): UploadReadiness {
  if (uploads.length === 0) {
    return {
      status: "empty",
      messages: [`先上传 3-8 张图片，建议包含：${getUploadGuidance(platform).requiredShots.slice(0, 3).join("、")}。`]
    };
  }

  const messages: string[] = [];
  if (uploads.length < 3) {
    messages.push("建议至少 3 张：正面、细节、瑕疵/配件。");
  }

  const lowResolutionCount = uploads.filter((upload) => Math.min(upload.width, upload.height) < 800).length;
  if (lowResolutionCount > 0) {
    messages.push(`有 ${lowResolutionCount} 张图片低于 800px，导出高清图时可能发虚。`);
  }

  if (messages.length === 0) {
    return {
      status: "ready",
      messages: ["照片数量足够，可以生成可信发布包。"]
    };
  }

  return {
    status: "needs_more",
    messages
  };
}
