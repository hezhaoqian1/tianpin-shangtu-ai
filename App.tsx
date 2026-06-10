import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { AccountScreen } from "./src/screens/AccountScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { CreateScreen } from "./src/screens/CreateScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { DiagnosisScreen } from "./src/screens/DiagnosisScreen";
import { EditorScreen } from "./src/screens/EditorScreen";
import { ExportScreen } from "./src/screens/ExportScreen";
import { LaunchScreen } from "./src/screens/LaunchScreen";
import { PackSelectScreen } from "./src/screens/PackSelectScreen";
import { TemplateGalleryScreen } from "./src/screens/TemplateGalleryScreen";
import { UploadScreen } from "./src/screens/UploadScreen";
import { WorksScreen } from "./src/screens/WorksScreen";
import { analyzeUploadsForApp, type AppAnalysisSource } from "./src/shared/analysisClient";
import { normalizeEditPrompt } from "./src/shared/editConversation";
import { createEditCommandForApp, type AppEditSource } from "./src/shared/editClient";
import {
  createCoverImageJobForApp,
  getCoverImageJobForApp,
  type AppGeneratedImageFallbackReason,
  type AppGeneratedImageJobStatus,
  type AppGeneratedImageSource
} from "./src/shared/generatedImageClient";
import { mapPickedImagesToUploads } from "./src/shared/imagePicker";
import {
  applyGeneratedCoverImage,
  applyEditCommand,
  createPublishPacks,
  createSampleUploads,
  type Platform,
  type ProductAnalysis,
  type PublishPack,
  type UploadedAsset
} from "./src/shared/productPipeline";
import { uploadAssetsForAnalysis } from "./src/shared/remoteUploadClient";
import { createDemoUserSession, createGuestSession, type UserSession } from "./src/shared/session";
import { type SellerTemplate } from "./src/shared/templateStrategy";
import { createSavedProjectFromPack, type SavedProject } from "./src/shared/workspace";
import { AppShell, type MainTab } from "./src/ui/AppShell";
import { palette } from "./src/ui/theme";

type FlowStep = "idle" | "upload" | "diagnosis" | "packs" | "editor" | "export";

const analyzeEndpoint = process.env.EXPO_PUBLIC_ANALYZE_ENDPOINT ?? "";
const editEndpoint = process.env.EXPO_PUBLIC_EDIT_ENDPOINT ?? "";
const uploadEndpoint = process.env.EXPO_PUBLIC_UPLOAD_ENDPOINT ?? "";
const imageGenerateEndpoint = process.env.EXPO_PUBLIC_IMAGE_GENERATE_ENDPOINT ?? "";

export default function App() {
  const [launchComplete, setLaunchComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("dashboard");
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [platform, setPlatform] = useState<Platform>("xianyu");
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [packs, setPacks] = useState<PublishPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<PublishPack | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisSource, setAnalysisSource] = useState<AppAnalysisSource>("mock");
  const [analysisFallbackReason, setAnalysisFallbackReason] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSource, setEditSource] = useState<AppEditSource | undefined>(undefined);
  const [editFallbackReason, setEditFallbackReason] = useState<string | undefined>(undefined);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedImageJobId, setGeneratedImageJobId] = useState<string | undefined>(undefined);
  const [generatedImageJobStatus, setGeneratedImageJobStatus] = useState<AppGeneratedImageJobStatus | undefined>(undefined);
  const [generatedImageSource, setGeneratedImageSource] = useState<AppGeneratedImageSource | undefined>(undefined);
  const [generatedImageFallbackReason, setGeneratedImageFallbackReason] = useState<AppGeneratedImageFallbackReason | undefined>(undefined);
  const [session, setSession] = useState<UserSession>(() => createGuestSession());
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [exportSaveMessage, setExportSaveMessage] = useState<string | null>(null);

  const flowProgress = useMemo(() => {
    if (flowStep === "idle") {
      return 0;
    }

    const order: FlowStep[] = ["upload", "diagnosis", "packs", "editor", "export"];
    return order.indexOf(flowStep) / (order.length - 1);
  }, [flowStep]);

  function completeAuth() {
    setSession(createDemoUserSession());
    setIsAuthenticated(true);
    setActiveTab("dashboard");
    setFlowStep("idle");
  }

  function resetDraft() {
    setUploads([]);
    setAnalysis(null);
    setPacks([]);
    setSelectedPack(null);
    setUploadError(null);
    setAnalysisSource("mock");
    setAnalysisFallbackReason(undefined);
    setIsAnalyzing(false);
    setIsEditing(false);
    setEditSource(undefined);
    setEditFallbackReason(undefined);
    setIsGeneratingCover(false);
    setGeneratedImageJobId(undefined);
    setGeneratedImageJobStatus(undefined);
    setGeneratedImageSource(undefined);
    setGeneratedImageFallbackReason(undefined);
    setExportSaveMessage(null);
  }

  function startFlow(nextPlatform: Platform) {
    setPlatform(nextPlatform);
    resetDraft();
    setActiveTab("create");
    setFlowStep("upload");
  }

  function useTemplate(template: SellerTemplate) {
    startFlow(template.platform);
  }

  function returnToMain(nextTab: MainTab = "dashboard") {
    setFlowStep("idle");
    setActiveTab(nextTab);
  }

  async function runAnalysis(nextUploads: UploadedAsset[]) {
    setIsAnalyzing(true);
    const result = await analyzeUploadsForApp({
      uploads: nextUploads,
      platform,
      apiEndpoint: analyzeEndpoint
    });
    const nextAnalysis = result.analysis;
    const nextPacks = createPublishPacks(nextAnalysis, nextUploads, platform);
    setUploads(nextUploads);
    setAnalysis(nextAnalysis);
    setPacks(nextPacks);
    setSelectedPack(null);
    setUploadError(null);
    setAnalysisSource(result.source);
    setAnalysisFallbackReason(result.fallbackReason);
    setIsAnalyzing(false);
    setFlowStep("diagnosis");
  }

  async function analyzeSampleUploads() {
    await runAnalysis(createSampleUploads("headphones"));
  }

  async function pickGalleryImages() {
    try {
      setUploadError(null);
      setIsAnalyzing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 8,
        quality: 0.9
      });

      if (result.canceled) {
        setIsAnalyzing(false);
        return;
      }

      const pickedUploads = mapPickedImagesToUploads(result.assets).slice(0, 8);
      const uploadResults = await uploadAssetsForAnalysis({
        assets: pickedUploads,
        endpoint: uploadEndpoint,
        ownerId: session.id
      });
      const remoteUploads = uploadResults.map((item) => item.asset);
      const failedUploads = uploadResults.filter((item) => !item.uploaded);

      if (failedUploads.length > 0 && uploadEndpoint) {
        setUploadError("部分图片没有上传到云端，AI 会先用本地信息兜底诊断。");
      }

      await runAnalysis(remoteUploads);
    } catch {
      setUploadError("相册选择暂时不可用，可以先用样例图跑完整链路。");
      setIsAnalyzing(false);
    }
  }

  function choosePack(pack: PublishPack) {
    setSelectedPack(pack);
    setEditSource(undefined);
    setEditFallbackReason(undefined);
    setIsGeneratingCover(false);
    setGeneratedImageJobId(undefined);
    setGeneratedImageJobStatus(undefined);
    setGeneratedImageSource(undefined);
    setGeneratedImageFallbackReason(undefined);
    setExportSaveMessage(null);
    setFlowStep("editor");
  }

  async function applyDemoEdit(userMessage: string) {
    if (!selectedPack) {
      return;
    }

    const nextMessage = normalizeEditPrompt(userMessage);
    if (!nextMessage) {
      return;
    }

    setIsEditing(true);
    const result = await createEditCommandForApp({
      pack: selectedPack,
      userMessage: nextMessage,
      apiEndpoint: editEndpoint
    });
    const command = result.command;
    setSelectedPack(applyEditCommand(selectedPack, command));
    setEditSource(result.source);
    setEditFallbackReason(result.fallbackReason);
    setIsEditing(false);
  }

  useEffect(() => {
    if (!generatedImageJobId || !selectedPack || !isGeneratingCover) {
      return undefined;
    }

    let canceled = false;
    const poll = async () => {
      const result = await getCoverImageJobForApp({
        pack: selectedPack,
        jobId: generatedImageJobId,
        endpoint: imageGenerateEndpoint
      });

      if (canceled) {
        return;
      }

      setGeneratedImageJobStatus(result.status);

      if (result.status === "succeeded" && result.asset) {
        const generatedAsset = result.asset;
        setUploads((currentUploads) => [
          generatedAsset,
          ...currentUploads.filter((asset) => asset.id !== generatedAsset.id)
        ]);
        setSelectedPack((currentPack) => (currentPack ? applyGeneratedCoverImage(currentPack, generatedAsset) : currentPack));
        setGeneratedImageSource("remote");
        setGeneratedImageFallbackReason(undefined);
        setIsGeneratingCover(false);
      }

      if (result.status === "failed") {
        setGeneratedImageSource("mock");
        setGeneratedImageFallbackReason(result.fallbackReason ?? "remote_failed");
        setIsGeneratingCover(false);
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [generatedImageJobId, isGeneratingCover, selectedPack]);

  async function generateCoverImage() {
    if (!selectedPack || isGeneratingCover) {
      return;
    }

    setIsGeneratingCover(true);
    setGeneratedImageJobId(undefined);
    setGeneratedImageJobStatus("queued");
    setGeneratedImageSource(undefined);
    setGeneratedImageFallbackReason(undefined);
    const result = await createCoverImageJobForApp({
      pack: selectedPack,
      uploads,
      endpoint: imageGenerateEndpoint,
      ownerId: session.id
    });

    if (result.source === "remote") {
      setGeneratedImageJobId(result.jobId);
      setGeneratedImageJobStatus(result.status);
      setGeneratedImageSource(result.source);
      setGeneratedImageFallbackReason(undefined);
    } else {
      setIsGeneratingCover(false);
      setGeneratedImageJobStatus("failed");
      setGeneratedImageSource(result.source);
      setGeneratedImageFallbackReason(result.fallbackReason);
    }
  }

  function saveCurrentProject() {
    if (!selectedPack || !analysis) {
      return;
    }

    const result = createSavedProjectFromPack({
      session,
      pack: selectedPack,
      analysis,
      uploads
    });

    if (result.status === "login_required") {
      setExportSaveMessage(result.prompt.body);
      return;
    }

    setSavedProjects((projects) => [
      result.project,
      ...projects.filter((project) => project.item.id !== result.project.item.id)
    ]);
    setExportSaveMessage("已保存到作品库，后续可以继续编辑或复用风格。");
  }

  function openSavedProject(projectId: string) {
    const project = savedProjects.find((item) => item.item.id === projectId);
    if (!project) {
      return;
    }

    setPlatform(project.pack.platform);
    setUploads(project.uploads);
    setAnalysis(project.analysis);
    setPacks(createPublishPacks(project.analysis, project.uploads, project.pack.platform));
    setSelectedPack(project.pack);
    setUploadError(null);
    setAnalysisSource("mock");
    setEditSource(project.pack.history.length > 0 ? "mock" : undefined);
    setEditFallbackReason(undefined);
    setExportSaveMessage("已打开历史作品，可以继续编辑或重新导出。");
    setActiveTab("works");
    setFlowStep("export");
  }

  function logout() {
    resetDraft();
    setSavedProjects([]);
    setSession(createGuestSession());
    setIsAuthenticated(false);
    setActiveTab("dashboard");
    setFlowStep("idle");
  }

  function renderFlow() {
    return (
      <View style={styles.flowShell}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(8, flowProgress * 100)}%` }]} />
        </View>
        {flowStep === "upload" ? (
          <UploadScreen
            platform={platform}
            uploadError={uploadError}
            isAnalyzing={isAnalyzing}
            onBack={() => returnToMain("create")}
            onPickGallery={pickGalleryImages}
            onUseSample={analyzeSampleUploads}
          />
        ) : null}
        {flowStep === "diagnosis" && analysis ? (
          <DiagnosisScreen
            analysis={analysis}
            analysisSource={analysisSource}
            analysisFallbackReason={analysisFallbackReason}
            endpointConfigured={Boolean(analyzeEndpoint)}
            uploads={uploads}
            onBack={() => setFlowStep("upload")}
            onContinue={() => setFlowStep("packs")}
          />
        ) : null}
        {flowStep === "packs" ? (
          <PackSelectScreen packs={packs} uploads={uploads} onBack={() => setFlowStep("diagnosis")} onSelect={choosePack} />
        ) : null}
        {flowStep === "editor" && selectedPack ? (
          <EditorScreen
            pack={selectedPack}
            uploads={uploads}
            onBack={() => setFlowStep("packs")}
            isEditing={isEditing}
            editSource={editSource}
            editFallbackReason={editFallbackReason}
            editEndpointConfigured={Boolean(editEndpoint)}
            isGeneratingCover={isGeneratingCover}
            generatedImageJobStatus={generatedImageJobStatus}
            generatedImageSource={generatedImageSource}
            generatedImageFallbackReason={generatedImageFallbackReason}
            imageGenerateEndpointConfigured={Boolean(imageGenerateEndpoint)}
            onApplyEdit={applyDemoEdit}
            onGenerateCover={generateCoverImage}
            onExport={() => setFlowStep("export")}
          />
        ) : null}
        {flowStep === "export" && selectedPack ? (
          <ExportScreen
            pack={selectedPack}
            uploads={uploads}
            session={session}
            saveMessage={exportSaveMessage}
            onLogin={completeAuth}
            onSaveProject={saveCurrentProject}
            onBack={() => setFlowStep("editor")}
            onRestart={() => returnToMain("dashboard")}
          />
        ) : null}
      </View>
    );
  }

  function renderTab() {
    if (activeTab === "templates") {
      return <TemplateGalleryScreen onUseTemplate={useTemplate} />;
    }

    if (activeTab === "create") {
      return <CreateScreen onStart={startFlow} onUseTemplate={useTemplate} />;
    }

    if (activeTab === "works") {
      return <WorksScreen historyItems={savedProjects.map((project) => project.item)} onOpenHistory={openSavedProject} onStart={startFlow} />;
    }

    if (activeTab === "account") {
      return <AccountScreen session={session} onLogout={logout} />;
    }

    return (
      <DashboardScreen
        session={session}
        historyItems={savedProjects.map((project) => project.item)}
        onOpenHistory={openSavedProject}
        onStart={startFlow}
        onUseTemplate={useTemplate}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.phoneFrame}>
        {!launchComplete ? <LaunchScreen onDone={() => setLaunchComplete(true)} /> : null}
        {launchComplete && !isAuthenticated ? <AuthScreen onComplete={completeAuth} /> : null}
        {launchComplete && isAuthenticated && flowStep !== "idle" ? renderFlow() : null}
        {launchComplete && isAuthenticated && flowStep === "idle" ? (
          <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
            {renderTab()}
          </AppShell>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#151714"
  },
  phoneFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: palette.paper
  },
  flowShell: {
    flex: 1,
    backgroundColor: palette.paper
  },
  progressTrack: {
    height: 3,
    backgroundColor: palette.line
  },
  progressFill: {
    height: 3,
    backgroundColor: palette.ink
  }
});
