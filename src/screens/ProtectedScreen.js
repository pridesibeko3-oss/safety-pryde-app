import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Clipboard,
  ScrollView,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import {
  subscribeToSession,
  setSOS,
  uploadMedia,
} from "../lib/session";
import {
  startBackgroundLocation,
  stopBackgroundLocation,
} from "../tasks/locationTask";
import { registerForPushNotifications } from "../lib/notifications";
import { registerPushToken } from "../lib/session";

export default function ProtectedScreen({ route, navigation }) {
  const { code } = route.params;
  const [locationOn, setLocationOn] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [media, setMedia] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [decoyVisible, setDecoyVisible] = useState(false);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToSession(code, (data) => {
      if (!data) return;
      setSosActive(!!data.sos?.active);
      setMedia(data.media || []);
    });

    registerForPushNotifications().then((token) => {
      if (token) registerPushToken(code, "protected", token);
    });

    return () => {
      unsub();
      stopBackgroundLocation();
    };
  }, [code]);

  async function toggleLocation() {
    try {
      if (!locationOn) {
        await startBackgroundLocation(code);
        setLocationOn(true);
      } else {
        await stopBackgroundLocation();
        setLocationOn(false);
      }
    } catch (e) {
      Alert.alert("Location error", e.message);
    }
  }

  async function toggleSosBtn() {
    await setSOS(code, !sosActive);
  }

  async function ensureCameraReady() {
    if (!camPerm?.granted) {
      const r = await requestCamPerm();
      if (!r.granted) return false;
    }
    if (!micPerm?.granted) {
      const r = await requestMicPerm();
      if (!r.granted) return false;
    }
    return true;
  }

  async function openCamera() {
    if (await ensureCameraReady()) setCameraOpen(true);
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    const blob = await uriToBlob(photo.uri);
    await uploadMedia(code, blob, "photo");
  }

  async function toggleRecordVideo() {
    if (!cameraRef.current) return;
    if (!recording) {
      setRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
      const blob = await uriToBlob(video.uri);
      await uploadMedia(code, blob, "video");
      setRecording(false);
    } else {
      cameraRef.current.stopRecording();
    }
  }

  async function activateDecoy() {
    const ready = await ensureCameraReady();
    if (!ready) return;
    setCameraOpen(true);
    setDecoyVisible(true);
    // Give the camera a beat to mount before we start recording.
    setTimeout(async () => {
      if (cameraRef.current && !recording) {
        setRecording(true);
        try {
          const video = await cameraRef.current.recordAsync({ maxDuration: 120 });
          const blob = await uriToBlob(video.uri);
          await uploadMedia(code, blob, "video");
        } catch (e) {
          console.error("Decoy recording failed:", e);
        }
        setRecording(false);
      }
    }, 800);
  }

  function exitDecoy() {
    setDecoyVisible(false);
    if (recording && cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← End session & go back</Text>
      </Pressable>
      <Text style={styles.title}>🛡️ Your Safety Session</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Share this code with your trusted contact:</Text>
        <Text style={styles.code}>{code}</Text>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => {
            Clipboard.setString(code);
            Alert.alert("Copied", "Code copied to clipboard.");
          }}
        >
          <Text style={styles.secondaryBtnText}>Copy code</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live location</Text>
        <Text style={styles.note}>
          {locationOn ? "Sharing your live location — a notification stays visible while this runs, as required by Android." : "Not sharing"}
        </Text>
        <Pressable style={locationOn ? styles.secondaryBtn : styles.safeBtn} onPress={toggleLocation}>
          <Text style={locationOn ? styles.secondaryBtnText : styles.safeBtnText}>
            {locationOn ? "Stop sharing location" : "Start sharing my location"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Pressable style={styles.primaryBtn} onPress={toggleSosBtn}>
          <Text style={styles.primaryBtnText}>{sosActive ? "✅ Cancel SOS" : "🚨 Send SOS"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Safety photo / video</Text>
        <Text style={styles.note}>Visible to you and shared with your contact — nothing hidden from you.</Text>
        {!cameraOpen ? (
          <Pressable style={styles.secondaryBtn} onPress={openCamera}>
            <Text style={styles.secondaryBtnText}>Open camera</Text>
          </Pressable>
        ) : (
          <>
            <View style={{ height: 240, borderRadius: 12, overflow: "hidden", marginBottom: 10, opacity: decoyVisible ? 0 : 1, position: decoyVisible ? "absolute" : "relative" }}>
              <CameraView ref={cameraRef} style={{ flex: 1 }} mode="video" facing="back" />
            </View>
            {!decoyVisible && (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={takePhoto}>
                  <Text style={styles.secondaryBtnText}>📷 Photo</Text>
                </Pressable>
                <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={toggleRecordVideo}>
                  <Text style={styles.secondaryBtnText}>{recording ? "⏹ Stop" : "⏺ Record"}</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Discreet mode</Text>
        <Text style={styles.note}>
          Shows a screen that looks like your phone powered off, while quietly
          recording video that goes to your contact. Tap the top-right corner
          of the black screen to exit it.
        </Text>
        <Pressable style={styles.secondaryBtn} onPress={activateDecoy}>
          <Text style={styles.secondaryBtnText}>Activate discreet mode</Text>
        </Pressable>
      </View>

      {media.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shared media</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {media.slice().reverse().map((m, i) => (
              <Image key={i} source={{ uri: m.url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
            ))}
          </View>
        </View>
      )}

      {decoyVisible && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.decoy}>
            <Pressable style={styles.decoyExitZone} onPress={exitDecoy} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

async function uriToBlob(uri) {
  const response = await fetch(uri);
  return await response.blob();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f5f2" },
  back: { color: "#6b6b70", marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#e4e0da" },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  label: { color: "#6b6b70", marginBottom: 8 },
  code: { fontSize: 32, fontWeight: "700", letterSpacing: 4, textAlign: "center", marginBottom: 12 },
  note: { color: "#6b6b70", fontSize: 13, marginBottom: 10, lineHeight: 18 },
  primaryBtn: { backgroundColor: "#b5473f", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { backgroundColor: "transparent", padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#e4e0da" },
  secondaryBtnText: { color: "#1c1c1e", fontWeight: "700", fontSize: 15 },
  safeBtn: { backgroundColor: "#2f7a4f", padding: 14, borderRadius: 12, alignItems: "center" },
  safeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  decoy: { flex: 1, backgroundColor: "#000" },
  decoyExitZone: { position: "absolute", top: 0, right: 0, width: 70, height: 70 },
});
