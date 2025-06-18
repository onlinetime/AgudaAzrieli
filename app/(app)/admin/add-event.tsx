import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useTheme } from "@react-navigation/native";

export default function AdminAddEvent() {
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [picture, setPicture] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [currentAttendees, setCurrentAttendees] = useState("");
  const [priority, setPriority] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");

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
      setPicture(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please fill in the event title.");
      return;
    }
    if (!startDate.trim()) {
      alert("Please fill in the start date.");
      return;
    }
    try {
      const newEvent = {
        title,
        description,
        startDate,
        endDate,
        registrationRequired,
        picture: picture || "",
        address,
        maxAttendees: parseInt(maxAttendees) || 0,
        currentAttendees: parseInt(currentAttendees) || 0,
        priority: parseInt(priority) || 0,
        phoneNumber,
        category,
      };
      await addDoc(collection(db, "events"), newEvent);
      alert("Event added successfully!");
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setRegistrationRequired(false);
      setPicture(null);
      setAddress("");
      setMaxAttendees("");
      setCurrentAttendees("");
      setPriority("");
      setPhoneNumber("");
      setCategory("");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Add New Event
        </Text>

        {/** שדות טקסט */}
        {[
          { label: "Title", value: title, setter: setTitle },
          { label: "Description", value: description, setter: setDescription, multiline: true, height: 100 },
          { label: "Start Date", value: startDate, setter: setStartDate },
          { label: "End Date", value: endDate, setter: setEndDate },
          { label: "Address", value: address, setter: setAddress },
          {
            label: "Max Attendees",
            value: maxAttendees,
            setter: setMaxAttendees,
            keyboardType: "numeric",
          },
          {
            label: "Current Attendees",
            value: currentAttendees,
            setter: setCurrentAttendees,
            keyboardType: "numeric",
          },
          { label: "Priority", value: priority, setter: setPriority, keyboardType: "numeric" },
          { label: "Phone Number", value: phoneNumber, setter: setPhoneNumber, keyboardType: "phone-pad" },
          { label: "Category", value: category, setter: setCategory },
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

        {/** רישום */}
        <Text style={[styles.label, { color: colors.text }]}>
          Registration Required
        </Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRegistrationRequired((p) => !p)}
        >
          <Ionicons
            name={registrationRequired ? "checkbox" : "square-outline"}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            {registrationRequired ? "Yes" : "No"}
          </Text>
        </TouchableOpacity>

        {/** תמונה */}
        <Text style={[styles.label, { color: colors.text }]}>Picture</Text>
        {picture ? (
          <Image source={{ uri: picture }} style={styles.imagePreview} />
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

        <View style={styles.submitContainer}>
          <Button
            title="Add Event"
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
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
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  submitContainer: {
    marginTop: 20,
  },
});
