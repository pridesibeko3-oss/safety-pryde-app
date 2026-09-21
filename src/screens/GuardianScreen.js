import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Linking, Image, ScrollView } from "react-native";
import { subscribeToSession, registerPushToken } from "../lib/session";
import { registerForPushNotifications } from "../lib/notifications";

export default function GuardianScreen({ route, navigation }) {
  const { code } = route.params;
  const [data, setData] = useState(null);

  useEffect(() => {
    const unsub = subscribeToSession(code, setData);
    registerForPushNotifications().then((token) => {
      if (token) registerPushToken(code, "guardian", token);
    });
    return unsub;
  }, [code]);

  const loc = data?.location;
  const sos = data?.sos;
  const media = data?.media || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>🛡️ Following: {code}</Text>

      {sos?.active && (
        <View style={styles.sosBanner}>
          <Text style={styles.sosBannerText}>
            🚨 SOS ACTIVE — sent {new Date(sos.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        {data?.locationActive && loc ? (
          <>
            <Text style={styles.note}>Last updated {new Date(loc.timestamp).toLocaleTimeString()}</Text>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() =>
                Linking.openURL(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`)
              }
            >
              <Text style={styles.secondaryBtnText}>Open in Maps →</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.note}>Not currently sharing</Text>
        )}
      </View>

      {media.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shared photos & video</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {media.slice().reverse().map((m, i) => (
              <Image key={i} source={{ uri: m.url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f5f2" },
  back: { color: "#6b6b70", marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#e4e0da" },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  note: { color: "#6b6b70", fontSize: 13, marginBottom: 10 },
  secondaryBtn: { backgroundColor: "transparent", padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#e4e0da" },
  secondaryBtnText: { color: "#b5473f", fontWeight: "700", fontSize: 15 },
  sosBanner: { backgroundColor: "#fdeceb", borderColor: "#b5473f", borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  sosBannerText: { color: "#b5473f", fontWeight: "700", textAlign: "center" },
});
