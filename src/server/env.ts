export type StorageProvider = "mock" | "s3";
export type BackgroundRemovalProvider = "mock" | "removebg" | "photoroom";

export type ServerIntegrationConfig = {
  publicBaseUrl?: string;
  databaseUrl?: string;
  storage: {
    provider: StorageProvider;
    bucket?: string;
    region: string;
    endpoint?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    publicBaseUrl?: string;
  };
  imageGeneration: {
    model: string;
  };
  backgroundRemoval: {
    provider: BackgroundRemovalProvider;
    removeBgApiKey?: string;
    photoroomApiKey?: string;
  };
};

export function createServerIntegrationConfig(
  overrides: Partial<ServerIntegrationConfig> = {}
): ServerIntegrationConfig {
  const storageOverride: Partial<ServerIntegrationConfig["storage"]> = overrides.storage ?? {};
  const imageGenerationOverride: Partial<ServerIntegrationConfig["imageGeneration"]> = overrides.imageGeneration ?? {};
  const backgroundRemovalOverride: Partial<ServerIntegrationConfig["backgroundRemoval"]> =
    overrides.backgroundRemoval ?? {};

  return {
    publicBaseUrl: overrides.publicBaseUrl ?? readEnv("PUBLIC_API_BASE_URL"),
    databaseUrl: overrides.databaseUrl ?? readEnv("DATABASE_URL"),
    storage: {
      provider: storageOverride.provider ?? readStorageProvider(),
      bucket: storageOverride.bucket ?? readEnv("STORAGE_BUCKET"),
      region: storageOverride.region ?? readEnv("STORAGE_REGION") ?? "auto",
      endpoint: storageOverride.endpoint ?? readEnv("STORAGE_ENDPOINT"),
      accessKeyId: storageOverride.accessKeyId ?? readEnv("STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: storageOverride.secretAccessKey ?? readEnv("STORAGE_SECRET_ACCESS_KEY"),
      publicBaseUrl: storageOverride.publicBaseUrl ?? readEnv("STORAGE_PUBLIC_BASE_URL")
    },
    imageGeneration: {
      model: imageGenerationOverride.model ?? readEnv("OPENAI_IMAGE_MODEL") ?? "gpt-image-2"
    },
    backgroundRemoval: {
      provider: backgroundRemovalOverride.provider ?? readBackgroundRemovalProvider(),
      removeBgApiKey: backgroundRemovalOverride.removeBgApiKey ?? readEnv("REMOVEBG_API_KEY"),
      photoroomApiKey: backgroundRemovalOverride.photoroomApiKey ?? readEnv("PHOTOROOM_API_KEY")
    }
  };
}

function readStorageProvider(): StorageProvider {
  const value = readEnv("STORAGE_PROVIDER");
  return value === "s3" ? "s3" : "mock";
}

function readBackgroundRemovalProvider(): BackgroundRemovalProvider {
  const value = readEnv("BACKGROUND_REMOVAL_PROVIDER");
  if (value === "removebg" || value === "photoroom") {
    return value;
  }

  return "mock";
}

function readEnv(name: string): string | undefined {
  const env = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  const value = env.process?.env?.[name]?.trim();
  return value ? value : undefined;
}
