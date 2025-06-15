import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

<<<<<<< HEAD
        <Link href="/user/user-home" style={styles.link}>
=======
        <Link href="/" style={styles.link}>
>>>>>>> 3126498e541a08da60489832cbc3f20c82a22fb2
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
