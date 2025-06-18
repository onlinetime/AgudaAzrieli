import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";

export default function UploadGift() {
  const { colors } = useTheme();

  const [giftName, setGiftName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);

  const fetchGifts = async () => {
    const snap = await getDocs(collection(db, "gifts"));
    setGifts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Error", "Permission to access media library is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!giftName.trim()) {
      Alert.alert("Error", "Please fill in the gift name.");
      return;
    }
    setUploading(true);
    try {
      await addDoc(collection(db, "gifts"), {
        name: giftName,
        description,
        picture: imageUri || "",
      });
      Alert.alert("Success", "Gift added successfully!");
      setGiftName("");
      setDescription("");
      setImageUri(null);
      fetchGifts();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add gift. Please try again.");
    }
    setUploading(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Gift", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "gifts", id));
          Alert.alert("Deleted", "Gift deleted");
          fetchGifts();
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>
        Add New Gift
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>
        Gift Name
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Enter gift name"
        placeholderTextColor={colors.border}
        value={giftName}
        onChangeText={setGiftName}
      />

      <Text style={[styles.label, { color: colors.text }]}>
        Description
      </Text>
      <TextInput
        style={[
          styles.input,
          { height: 100 },
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        placeholder="Enter description"
        placeholderTextColor={colors.border}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={[styles.label, { color: colors.text }]}>Picture</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      ) : (
        <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text }}>No image selected</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={pickImage}
      >
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      <View style={styles.submitContainer}>
        <Button
          title={uploading ? "Uploading..." : "Add Gift"}
          onPress={handleSubmit}
          disabled={uploading}
          color={colors.primary}
        />
      </View>

      <Text style={[styles.title, { marginTop: 30, color: colors.text }]}>
        Open Gifts
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View
              style={[
                styles.giftItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.giftName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={{ color: colors.text }}>
                {item.description}
              </Text>
              <Button
                title="Delete"
                color={colors.notification}
                onPress={() => handleDelete(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={[{ textAlign: "center", margin: 16, color: colors.text }]}>
              No open gifts.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  imagePreview: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  submitContainer: { marginTop: 20 },
  giftItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  giftName: { fontWeight: "bold", marginBottom: 4 },
});
