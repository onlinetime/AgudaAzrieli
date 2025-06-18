import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";

export default function AdminAddStore() {
  const { colors } = useTheme();

  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
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

  const handleSubmit = async () => {
    if (!storeName.trim()) {
      alert("Please fill in the store name.");
      return;
    }
    if (!discount.trim()) {
      alert("Please fill in the discount.");
      return;
    }
    try {
      await addDoc(collection(db, "stores"), {
        name: storeName,
        picture: imageUri || "",
        address,
        description,
        phoneNumber,
        category,
        discount,
      });
      alert("Store added successfully!");
      setStoreName("");
      setAddress("");
      setDescription("");
      setPhoneNumber("");
      setCategory("");
      setDiscount("");
      setImageUri(null);
    } catch (error) {
      console.error("Error adding store:", error);
      alert("Failed to add store. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Add New Store
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Store Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Enter store name"
          placeholderTextColor={colors.border}
          value={storeName}
          onChangeText={setStoreName}
        />

        <Text style={[styles.label, { color: colors.text }]}>Picture</Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.border }}>No image selected</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={pickImage}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Pick an Image
          </Text>
        </TouchableOpacity>

        {[
          { label: "Address", value: address, setter: setAddress },
          { label: "Description", value: description, setter: setDescription, multiline: true, height: 100 },
          { label: "Phone Number", value: phoneNumber, setter: setPhoneNumber, keyboardType: "phone-pad" },
          { label: "Category", value: category, setter: setCategory },
          { label: "Discount", value: discount, setter: setDiscount, keyboardType: "numeric" },
        ].map((f, i) => (
          <View key={i}>
            <Text style={[styles.label, { color: colors.text }]}>{f.label}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                  height: f.height || 48,
                },
              ]}
              placeholder={`Enter ${f.label.toLowerCase()}`}
              placeholderTextColor={colors.border}
              value={f.value}
              onChangeText={f.setter}
              keyboardType={(f as any).keyboardType}
              multiline={f.multiline}
            />
          </View>
        ))}

        <View style={styles.submitContainer}>
          <Button
            title="Add Store"
            onPress={handleSubmit}
            color={colors.primary}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    paddingTop: 40,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
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
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  submitContainer: {
    marginTop: 20,
  },
});
