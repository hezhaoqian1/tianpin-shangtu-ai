import { type Platform } from "./productPipeline";

export type TemplateCategory = "platform" | "category" | "goal" | "style";

export type SellerTemplate = {
  id: string;
  title: string;
  subtitle: string;
  platform: Platform;
  category: string;
  goal: string;
  style: string;
  requiredShots: string[];
  outputs: string[];
  accentColor: string;
  backgroundColor: string;
  pro?: boolean;
};

export const sellerTemplates: SellerTemplate[] = [
  {
    id: "xianyu-authentic-digital",
    title: "真实闲鱼数码",
    subtitle: "保留瑕疵，突出成色和配件",
    platform: "xianyu",
    category: "闲置数码",
    goal: "快速出闲置",
    style: "真实可信",
    requiredShots: ["正面", "细节", "瑕疵", "配件"],
    outputs: ["封面", "详情拼图", "瑕疵说明", "闲鱼文案"],
    accentColor: "#2E5A48",
    backgroundColor: "#E7F0EA"
  },
  {
    id: "xiaohongshu-seed-cover",
    title: "小红书种草封面",
    subtitle: "强标题和 3:4 封面，适合种草笔记",
    platform: "xiaohongshu",
    category: "数码好物",
    goal: "提高点击",
    style: "种草封面",
    requiredShots: ["主图", "场景", "细节"],
    outputs: ["3:4 封面", "标题贴纸", "话题文案"],
    accentColor: "#B44B5D",
    backgroundColor: "#F7E7EB"
  },
  {
    id: "shop-clean-main",
    title: "干净商品主图",
    subtitle: "主体清楚，适合小店和商品橱窗",
    platform: "shop_main",
    category: "小商家",
    goal: "商品上新",
    style: "干净主图",
    requiredShots: ["正面", "规格", "包装"],
    outputs: ["主图", "规格图", "卖点图"],
    accentColor: "#275673",
    backgroundColor: "#E4EEF3",
    pro: true
  },
  {
    id: "wechat-nine-grid",
    title: "朋友圈九宫格",
    subtitle: "一次生成封面、细节和价格说明",
    platform: "wechat",
    category: "朋友圈小店",
    goal: "今日上新",
    style: "清爽上新",
    requiredShots: ["主图", "细节", "库存"],
    outputs: ["九宫格", "长图", "朋友圈文案"],
    accentColor: "#8B5A2B",
    backgroundColor: "#F0E8DD"
  }
];

export function getFeaturedTemplates(): SellerTemplate[] {
  return sellerTemplates.slice(0, 3);
}

export function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    xianyu: "闲鱼",
    xiaohongshu: "小红书",
    shop_main: "商品主图",
    wechat: "朋友圈"
  };

  return labels[platform];
}
