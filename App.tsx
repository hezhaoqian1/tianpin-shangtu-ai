import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { DiagnosisScreen } from "./src/screens/DiagnosisScreen";
import { EditorScreen } from "./src/screens/EditorScreen";
import { ExportScreen } from "./src/screens/ExportScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PackSelectScreen } from "./src/screens/PackSelectScreen";
import { UploadScreen } from "./src/screens/UploadScreen";
import { analyzeUploadsForApp, type AppAnalysisSource } from "./src/shared/analysisClient";
import { normalizeEditPrompt } from "./src/shared/editConversation";
import { createEditCommandForApp, type AppEditSource } from "./src/shared/editClient";
import { mapPickedImagesToUploads } from "./src/shared/imagePicker";
import {
  applyEditCommand,
  createPublishPacks,
  createSampleUploads,
  type Platform,
  type ProductAnalysis,
  type PublishPack,
  type UploadedAsset
} from "./src/shared/productPipeline";
import { createDemoUserSession, createGuestSession, type UserSession } from "./src/shared/session";
import { createSavedProjectFromPack, type SavedProject } from "./src/shared/workspace";
import { palette } from "./src/ui/theme";

type Step = "home" | "upload" | "diagnosis" | "packs" | "editor" | "export";
const analyzeEndpoint = process.env.EXPO_PUBLIC_ANALYZE_ENDPOINT ?? "";
const editEndpoint = process.env.EXPO_PUBLIC_EDIT_ENDPOINT ?? "";

export default function App() {
  const [step, setStep] = useState<Step>("home");
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
  const [session, setSession] = useState<UserSession>(() => createGuestSession());
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [exportSaveMessage, setExportSaveMessage] = useState<string | null>(null);

  const progress = useMemo(() => {
    const order: Step[] = ["home", "upload", "diagnosis", "packs", "editor", "export"];
    return order.indexOf(step) / (order.length - 1);
  }, [step]);

  function startFlow(nextPlatform: Platform) {
    setPlatform(nextPlatform);
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
    setExportSaveMessage(null);
    setStep("upload");
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
    setStep("diagnosis");
  }

  async function analyzeSampleUploads() {
    await runAnalysis(createSampleUploads("headphones"));
  }

  async function pickGalleryImages() {
    try {
      setUploadError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 8,
        quality: 0.9
      });

      if (result.canceled) {
        return;
      }

      await runAnalysis(mapPickedImagesToUploads(result.assets).slice(0, 8));
    } catch {
      setUploadError("相册选择暂时不可用，可以先用样例图跑完整演示。");
      setIsAnalyzing(false);
    }
  }

  function choosePack(pack: PublishPack) {
    setSelectedPack(pack);
    setEditSource(undefined);
    setEditFallbackReason(undefined);
    setExportSaveMessage(null);
    setStep("editor");
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

  function signInDemoAccount() {
    setSession(createDemoUserSession());
    setExportSaveMessage("已进入 demo 账号，可以保存历史、高清导出和复用风格。");
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
    setExportSaveMessage("已保存到历史作品，回到首页可以看到它。");
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
    setStep("export");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(8, progress * 100)}%` }]} />
      </View>
      {step === "home" ? (
        <HomeScreen
          session={session}
          historyItems={savedProjects.map((project) => project.item)}
          onLogin={signInDemoAccount}
          onOpenHistory={openSavedProject}
          onStart={startFlow}
        />
      ) : null}
      {step === "upload" ? (
        <UploadScreen
          platform={platform}
          uploadError={uploadError}
          isAnalyzing={isAnalyzing}
          onBack={() => setStep("home")}
          onPickGallery={pickGalleryImages}
          onUseSample={analyzeSampleUploads}
        />
      ) : null}
      {step === "diagnosis" && analysis ? (
        <DiagnosisScreen
          analysis={analysis}
          analysisSource={analysisSource}
          analysisFallbackReason={analysisFallbackReason}
          endpointConfigured={Boolean(analyzeEndpoint)}
          uploads={uploads}
          onBack={() => setStep("upload")}
          onContinue={() => setStep("packs")}
        />
      ) : null}
      {step === "packs" ? (
        <PackSelectScreen packs={packs} uploads={uploads} onBack={() => setStep("diagnosis")} onSelect={choosePack} />
      ) : null}
      {step === "editor" && selectedPack ? (
        <EditorScreen
          pack={selectedPack}
          uploads={uploads}
          onBack={() => setStep("packs")}
          isEditing={isEditing}
          editSource={editSource}
          editFallbackReason={editFallbackReason}
          editEndpointConfigured={Boolean(editEndpoint)}
          onApplyEdit={applyDemoEdit}
          onExport={() => setStep("export")}
        />
      ) : null}
      {step === "export" && selectedPack ? (
        <ExportScreen
          pack={selectedPack}
          uploads={uploads}
          session={session}
          saveMessage={exportSaveMessage}
          onLogin={signInDemoAccount}
          onSaveProject={saveCurrentProject}
          onBack={() => setStep("editor")}
          onRestart={() => setStep("home")}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
