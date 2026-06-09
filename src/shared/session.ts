export type AuthAction = "start_flow" | "standard_export" | "save_history" | "high_res_export" | "batch_generate";

export type LoginPromptCopy = {
  title: string;
  body: string;
  benefits: string[];
  primaryAction: string;
};

export type UserSession =
  | {
      kind: "guest";
      id: string;
      remainingFreePacks: number;
      canExportStandard: true;
      canSaveHistory: false;
    }
  | {
      kind: "user";
      id: string;
      remainingFreePacks: number;
      canExportStandard: true;
      canSaveHistory: true;
    };

export function createGuestSession(): UserSession {
  return {
    kind: "guest",
    id: "guest_local_demo",
    remainingFreePacks: 1,
    canExportStandard: true,
    canSaveHistory: false
  };
}

export function createDemoUserSession(): UserSession {
  return {
    kind: "user",
    id: "seller_account_local",
    remainingFreePacks: 12,
    canExportStandard: true,
    canSaveHistory: true
  };
}

export function shouldPromptForLogin(action: AuthAction, session: UserSession): boolean {
  if (session.kind === "user") {
    return false;
  }

  return action === "save_history" || action === "high_res_export" || action === "batch_generate";
}

export function getLoginPromptCopy(action: AuthAction): LoginPromptCopy {
  const commonBenefits = ["保存历史作品", "复用卖货风格", "高清导出和跨设备找回"];

  if (action === "batch_generate") {
    return {
      title: "登录后批量生成",
      body: "适合一次处理多件商品，记录每次生成和导出结果。",
      benefits: [...commonBenefits, "批量任务进度管理"],
      primaryAction: "登录 / 注册"
    };
  }

  if (action === "high_res_export") {
    return {
      title: "登录后高清导出",
      body: "标准图可先体验，高清图会占用生成额度，需要绑定账号保存记录。",
      benefits: commonBenefits,
      primaryAction: "登录 / 注册"
    };
  }

  return {
    title: "登录后保存作品",
    body: "这套发布包会保存到你的历史作品，下次可以继续改图或套用同款风格。",
    benefits: commonBenefits,
    primaryAction: "登录 / 注册"
  };
}
