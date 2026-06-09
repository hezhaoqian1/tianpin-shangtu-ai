export type Platform = "xianyu" | "xiaohongshu" | "shop_main" | "wechat";
export type ProductKind = "headphones" | "bag" | "shoes" | "keyboard";

export type UploadedAsset = {
  id: string;
  uri: string;
  remoteUrl?: string;
  mimeType?: string;
  label: string;
  width: number;
  height: number;
};

export type ProductAnalysis = {
  productType: string;
  productName: string;
  category: string;
  condition: {
    label: string;
    confidence: number;
    visibleIssues: {
      imageId: string;
      description: string;
      bbox: [number, number, number, number];
    }[];
  };
  sellingPoints: string[];
  missingShots: string[];
  truthfulnessWarnings: string[];
};

export type CanvasLayer =
  | {
      id: string;
      type: "image";
      imageId: string;
      x: number;
      y: number;
      width: number;
      height: number;
      cornerRadius?: number;
      rotation?: number;
    }
  | {
      id: string;
      type: "text";
      text: string;
      x: number;
      y: number;
      fontSize: number;
      fontWeight?: "regular" | "medium" | "bold";
      color: string;
    }
  | {
      id: string;
      type: "label";
      text: string;
      x: number;
      y: number;
      color: string;
      backgroundColor: string;
    }
  | {
      id: string;
      type: "callout";
      imageId: string;
      label: string;
      bbox: [number, number, number, number];
    };

export type CanvasAsset = {
  id: string;
  type: "cover" | "detail" | "flaw_callout";
  width: number;
  height: number;
  background: {
    type: "color";
    value: string;
  };
  layers: CanvasLayer[];
};

export type PublishPack = {
  id: string;
  platform: Platform;
  style: "authentic_resale" | "clean_product" | "xiaohongshu_seed";
  platformFitLabel: "首推" | "备选";
  title: string;
  summary: string;
  canvases: CanvasAsset[];
  copy: {
    titles: string[];
    description: string;
    tags: string[];
  };
  history: EditCommand[];
};

export type EditOperation =
  | {
      type: "updateText";
      layerId: string;
      text: string;
    }
  | {
      type: "updateBackground";
      assetId: string;
      background: CanvasAsset["background"];
    }
  | {
      type: "addCallout";
      assetId: string;
      imageId: string;
      label: string;
      bbox: [number, number, number, number];
    };

export type EditCommand = {
  intent: string;
  operations: EditOperation[];
  copy?: {
    primaryTitle?: string;
  };
  explanation: string;
};

export function createSampleUploads(_kind: ProductKind): UploadedAsset[] {
  return [
    {
      id: "img_01",
      uri: "sample://headphones/front",
      label: "正面主图",
      width: 1200,
      height: 1200
    },
    {
      id: "img_02",
      uri: "sample://headphones/case",
      label: "包装配件",
      width: 1200,
      height: 900
    },
    {
      id: "img_03",
      uri: "sample://headphones/wear",
      label: "耳罩细节",
      width: 1000,
      height: 1000
    },
    {
      id: "img_04",
      uri: "sample://headphones/side",
      label: "侧面角度",
      width: 1000,
      height: 1200
    }
  ];
}

export function createMockProductAnalysis(
  uploads: UploadedAsset[],
  platform: Platform
): ProductAnalysis {
  const visibleIssueImage = uploads.find((asset) => asset.id === "img_03") ?? uploads[0];

  return {
    productType: "headphones",
    productName: "Sony WH-1000XM5 头戴降噪耳机",
    category: platform === "xiaohongshu" ? "种草数码" : "闲置数码",
    condition: {
      label: "95 新",
      confidence: 0.74,
      visibleIssues: [
        {
          imageId: visibleIssueImage.id,
          description: "耳罩有轻微使用痕迹",
          bbox: [0.32, 0.41, 0.22, 0.18]
        }
      ]
    },
    sellingPoints: ["降噪通勤", "配件齐全", "自用闲置", "续航稳定"],
    missingShots: ["充电口细节", "耳罩内侧近景"],
    truthfulnessWarnings: ["不要隐藏耳罩轻微使用痕迹，建议在详情图中标注。"]
  };
}

export function createPublishPacks(
  analysis: ProductAnalysis,
  uploads: UploadedAsset[],
  targetPlatform: Platform = "xianyu"
): PublishPack[] {
  const [mainImage, accessoryImage, flawImage] = uploads;

  const platformCopy = createPlatformCopy(analysis, targetPlatform);

  const packs: PublishPack[] = [
    {
      id: "pack_authentic",
      platform: targetPlatform,
      style: "authentic_resale",
      platformFitLabel: getPreferredStyle(targetPlatform) === "authentic_resale" ? "首推" : "备选",
      title: "真实闲鱼风",
      summary: "强调自用、成色和细节，避免过度商业感。",
      canvases: [
        {
          id: "cover_01",
          type: "cover",
          width: 1080,
          height: 1080,
          background: { type: "color", value: "#F4F1EA" },
          layers: [
            imageLayer("product_main", mainImage.id, 72, 112, 936, 650, 28),
            textLayer("title", `${analysis.productName.replace("头戴降噪耳机", "")} 95 新`, 72, 824, 48, "#20201D"),
            labelLayer("condition", "自用闲置 / 配件齐", 72, 904, "#245142", "#DCEADF")
          ]
        },
        {
          id: "detail_01",
          type: "detail",
          width: 1080,
          height: 1440,
          background: { type: "color", value: "#F9F7F2" },
          layers: [
            textLayer("detail_title", "细节实拍", 72, 88, 44, "#20201D"),
            imageLayer("detail_main", mainImage.id, 72, 160, 444, 444, 24),
            imageLayer("detail_accessory", accessoryImage.id, 564, 160, 444, 444, 24),
            imageLayer("detail_flaw", flawImage.id, 72, 652, 936, 520, 24),
            labelLayer("flaw_note", "耳罩轻微使用痕迹", 96, 1112, "#6E3C2F", "#F1DDD5")
          ]
        }
      ],
      copy: {
        titles: platformCopy.authenticTitles,
        description: platformCopy.description,
        tags: platformCopy.tags
      },
      history: []
    },
    {
      id: "pack_clean",
      platform: targetPlatform,
      style: "clean_product",
      platformFitLabel: getPreferredStyle(targetPlatform) === "clean_product" ? "首推" : "备选",
      title: "干净商品图",
      summary: "主体更突出，适合主图或朋友圈单品展示。",
      canvases: [
        {
          id: "cover_clean",
          type: "cover",
          width: 1080,
          height: 1080,
          background: { type: "color", value: "#EEF2EF" },
          layers: [
            imageLayer("product_main", mainImage.id, 118, 130, 844, 690, 20),
            textLayer("title", "Sony 降噪耳机", 104, 858, 52, "#17201B"),
            textLayer("subtitle", "通勤 / 自用 / 配件齐", 104, 930, 28, "#59625C")
          ]
        }
      ],
      copy: {
        titles: platformCopy.cleanTitles,
        description: platformCopy.description,
        tags: platformCopy.tags
      },
      history: []
    },
    {
      id: "pack_seed",
      platform: targetPlatform,
      style: "xiaohongshu_seed",
      platformFitLabel: getPreferredStyle(targetPlatform) === "xiaohongshu_seed" ? "首推" : "备选",
      title: "小红书种草风",
      summary: "标题更强，适合种草笔记和生活方式封面。",
      canvases: [
        {
          id: "cover_seed",
          type: "cover",
          width: 1080,
          height: 1440,
          background: { type: "color", value: "#F7E8E4" },
          layers: [
            imageLayer("product_main", mainImage.id, 84, 178, 912, 820, 34),
            textLayer("title", "通勤降噪感拉满", 76, 1072, 60, "#251C1A"),
            labelLayer("tag", "Sony WH-1000XM5", 76, 1182, "#FFFFFF", "#D95E4F")
          ]
        }
      ],
      copy: {
        titles: platformCopy.seedTitles,
        description: platformCopy.description,
        tags: platformCopy.tags
      },
      history: []
    }
  ];

  return packs.sort((first, second) => {
    if (first.platformFitLabel === second.platformFitLabel) {
      return 0;
    }

    return first.platformFitLabel === "首推" ? -1 : 1;
  });
}

function createPlatformCopy(analysis: ProductAnalysis, platform: Platform) {
  const issue = analysis.condition.visibleIssues[0]?.description ?? "轻微使用痕迹";
  const sellingPoints = analysis.sellingPoints.slice(0, 2).join("、");

  if (platform === "xiaohongshu") {
    return {
      authenticTitles: ["自用 Sony 耳机出闲置啦", "Sony 降噪耳机真实使用感", "通勤耳机 95 新分享"],
      cleanTitles: ["Sony 降噪耳机实拍", "通勤降噪耳机，状态在线"],
      seedTitles: ["通勤降噪体验真的省心", "这副 Sony 耳机通勤很稳"],
      description: `通勤降噪体验很稳，${sellingPoints}。实拍里保留了${issue}，适合想看真实状态的姐妹参考。`,
      tags: ["小红书数码", "通勤耳机", "降噪耳机", "数码好物"]
    };
  }

  if (platform === "shop_main") {
    return {
      authenticTitles: ["Sony WH-1000XM5 实拍成色", "Sony 降噪耳机 95 新", "配件齐全实拍展示"],
      cleanTitles: ["Sony 降噪耳机，干净实拍", "主体清楚，配件齐全"],
      seedTitles: ["通勤降噪耳机卖点图", "Sony 耳机主图展示"],
      description: `主体清楚，功能正常，${sellingPoints}。${issue} 已单独标注，适合作为商品主图和详情图展示。`,
      tags: ["商品主图", "数码商品", "降噪耳机", "详情图"]
    };
  }

  if (platform === "wechat") {
    return {
      authenticTitles: ["自用 Sony 耳机今日可出", "Sony 降噪耳机 95 新", "通勤耳机配件齐"],
      cleanTitles: ["Sony 降噪耳机今日可出", "通勤降噪耳机，配件齐"],
      seedTitles: ["通勤降噪好物可出", "Sony 耳机闲置出"],
      description: `今日可出，自用 ${analysis.productName}，${sellingPoints}。${issue} 已拍清楚，想要细节图可以继续问。`,
      tags: ["朋友圈小店", "今日可出", "数码闲置", "通勤耳机"]
    };
  }

  return {
    authenticTitles: [
      "Sony WH-1000XM5 降噪耳机 95 新",
      "自用索尼降噪耳机，通勤很稳",
      "Sony 头戴耳机，配件齐全"
    ],
    cleanTitles: ["Sony 降噪耳机，干净实拍", "通勤降噪耳机，自用出"],
    seedTitles: ["通勤降噪耳机真的省心", "自用 Sony 耳机出闲置啦"],
    description: `自用 ${analysis.productName}，功能正常，${sellingPoints}。${issue}，已在图片中标出，介意勿拍。`,
    tags: ["索尼耳机", "降噪耳机", "通勤耳机", "闲置数码"]
  };
}

export function createTitleShorteningCommand(pack: PublishPack): EditCommand {
  return {
    intent: "make_title_shorter_and_more_authentic",
    operations: [
      {
        type: "updateText",
        layerId: "title",
        text: "自用 Sony 耳机，95 新"
      },
      {
        type: "updateBackground",
        assetId: pack.canvases[0].id,
        background: { type: "color", value: "#F7F3EC" }
      },
      {
        type: "addCallout",
        assetId: pack.canvases[1]?.id ?? pack.canvases[0].id,
        imageId: "img_03",
        label: "耳罩轻微使用痕迹",
        bbox: [0.32, 0.41, 0.22, 0.18]
      }
    ],
    copy: {
      primaryTitle: "自用 Sony 耳机，95 新"
    },
    explanation: "已降低营销感，突出自用和真实成色。"
  };
}

export function applyEditCommand(pack: PublishPack, command: EditCommand): PublishPack {
  const canvases = pack.canvases.map((canvas) => {
    let nextCanvas = {
      ...canvas,
      background: { ...canvas.background },
      layers: canvas.layers.map((layer) => ({ ...layer }))
    };

    command.operations.forEach((operation) => {
      if (operation.type === "updateText") {
        nextCanvas = {
          ...nextCanvas,
          layers: nextCanvas.layers.map((layer) =>
            layer.id === operation.layerId && layer.type === "text" ? { ...layer, text: operation.text } : layer
          )
        };
      }

      if (operation.type === "updateBackground" && operation.assetId === canvas.id) {
        nextCanvas = {
          ...nextCanvas,
          background: operation.background
        };
      }

      if (operation.type === "addCallout" && operation.assetId === canvas.id) {
        nextCanvas = {
          ...nextCanvas,
          layers: [
            ...nextCanvas.layers,
            {
              id: `callout_${nextCanvas.layers.length + 1}`,
              type: "callout",
              imageId: operation.imageId,
              label: operation.label,
              bbox: operation.bbox
            }
          ]
        };
      }
    });

    return nextCanvas;
  });

  return {
    ...pack,
    canvases,
    copy: {
      ...pack.copy,
      titles: command.copy?.primaryTitle
        ? [command.copy.primaryTitle, ...pack.copy.titles.filter((title) => title !== command.copy?.primaryTitle)]
        : pack.copy.titles
    },
    history: [...pack.history, command]
  };
}

function imageLayer(
  id: string,
  imageId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadius: number
): CanvasLayer {
  return {
    id,
    type: "image",
    imageId,
    x,
    y,
    width,
    height,
    cornerRadius
  };
}

function textLayer(
  id: string,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string
): CanvasLayer {
  return {
    id,
    type: "text",
    text,
    x,
    y,
    fontSize,
    fontWeight: "bold",
    color
  };
}

function getPreferredStyle(platform: Platform): PublishPack["style"] {
  const preferredStyles: Record<Platform, PublishPack["style"]> = {
    xianyu: "authentic_resale",
    xiaohongshu: "xiaohongshu_seed",
    shop_main: "clean_product",
    wechat: "clean_product"
  };

  return preferredStyles[platform];
}

function labelLayer(
  id: string,
  text: string,
  x: number,
  y: number,
  color: string,
  backgroundColor: string
): CanvasLayer {
  return {
    id,
    type: "label",
    text,
    x,
    y,
    color,
    backgroundColor
  };
}
