import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { generateCode, createSession, sessionExists } from "../lib/session";
import { auth } from "../lib/firebaseConfig";
import { signInAnonymously } from "firebase/auth";

export default function LandingScreen({ navigation }) {
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function ensureAuth() {
    if (!auth.currentUser) {
      const cred = await signInAnonymously(auth);
      return cred.user.uid;
    }
    return auth.currentUser.uid;
  }

  async function handleStart() {
    setBusy(true);
    try {
      const uid = await ensureAuth();
      const code = generateCode();
      await createSession(code, uid);
      navigation.navigate("Protected", { code });
    } catch (e) {
      Alert.alert("Couldn't start session", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    setBusy(true);
    try {
      await ensureAuth();
      const exists = await sessionExists(code);
      if (!exists) {
        Alert.alert("Session not found", "Check the code and try again.");
        return;
      }
      navigation.navigate("Guardian", { code });
    } catch (e) {
      Alert.alert("Couldn't join session", e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Safety Pryde</Text>
      <Text style={styles.subtitle}>
        Live location, SOS, and safety photos/video — shared only with the
        contact you choose.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>I want to be tracked & protected</Text>
        <Pressable style={styles.primaryBtn} onPress={handleStart} disabled={busy}>
          <Text style={styles.primaryBtnText}>Start a safety session</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>I'm someone's trusted contact</Text>
        <TextInput
          style={styles.input}
          placeholder="ENTER CODE"
          autoCapitalize="characters"
          maxLength={5}
          value={joinCode}
          onChangeText={setJoinCode}
        />
        <Pressable style={styles.secondaryBtn} onPress={handleJoin} disabled={busy}>
          <Text style={styles.secondaryBtnText}>Follow this session</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#f7f5f2" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: "#6b6b70", marginBottom: 24, lineHeight: 20 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#e4e0da" },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  primaryBtn: { backgroundColor: "#b5473f", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { backgroundColor: "transparent", padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#e4e0da" },
  secondaryBtnText: { color: "#1c1c1e", fontWeight: "700", fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#e4e0da", borderRadius: 10, padding: 12, fontSize: 18, letterSpacing: 3, marginBottom: 12, textTransform: "uppercase" },
});
