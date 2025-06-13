import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadGift() {
  const [giftName, setGiftName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gifts, setGifts] = useState([]);

  // Fetch gifts from Firestore
  const fetchGifts = async () => {
    const snapshot = await getDocs(collection(db, "gifts"));
    setGifts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
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

  const uploadImageAsync = async (uri: string) => {
    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a unique path
    const storage = getStorage();
    const imageRef = ref(storage, `gifts/${Date.now()}.jpg`);

    // Upload
    await uploadBytes(imageRef, blob);

    // Get download URL
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async () => {
    if (!giftName.trim()) {
      alert("Please fill in the gift name.");
      return;
    }
    setUploading(true);
    try {
      let pictureUrl = imageUri || "";

      const newGift = {
        name: giftName,
        description,
        picture: pictureUrl,
      };

      await addDoc(collection(db, "gifts"), newGift);

      alert("Gift added successfully!");
      setGiftName("");
      setDescription("");
      setImageUri(null);
      fetchGifts(); // Refresh the list
    } catch (error) {
      console.error("Error adding gift: ", error);
      alert("Failed to add gift. Please try again.");
    }
    setUploading(false);
  };

  // Delete gift
  const handleDelete = async (id) => {
    Alert.alert("Delete Gift", "Are you sure you want to delete this gift?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "gifts", id));
          Alert.alert("Gift deleted");
          fetchGifts();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Add New Gift</Text>

        <Text style={styles.label}>Gift Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter gift name"
          value={giftName}
          onChangeText={setGiftName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Picture</Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>No image selected</Text>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>

        <View style={styles.submitContainer}>
          <Button
            title={uploading ? "Uploading..." : "Add Gift"}
            onPress={handleSubmit}
            disabled={uploading}
          />
        </View>

        <Text style={[styles.title, { marginTop: 30 }]}>Open Gifts</Text>
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                marginVertical: 10,
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>{item.description}</Text>

              <Button
                title="Delete"
                color="#d11a2a"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={<Text>No open gifts.</Text>}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
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
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
  button: {
    backgroundColor: "#4f6cf7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  submitContainer: {
    marginTop: 20,
  },
});
