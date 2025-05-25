//add-event
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { router } from "expo-router";

export default function AdminAddEvent() {
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
      // Reset form
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
      console.error("Error adding event: ", error);
      alert("Failed to add event. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Event</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Enter event description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter start date"
        value={startDate}
        onChangeText={setStartDate}
      />

      <Text style={styles.label}>End Date</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter end date"
        value={endDate}
        onChangeText={setEndDate}
      />

      <Text style={styles.label}>Registration Required</Text>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setRegistrationRequired(!registrationRequired)}
      >
        <Ionicons
          name={registrationRequired ? "checkbox" : "square-outline"}
          size={24}
          color="#4f6cf7"
        />
        <Text style={styles.checkboxLabel}>
          {registrationRequired ? "Yes" : "No"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Picture</Text>
      {picture ? (
        <Image source={{ uri: picture }} style={styles.imagePreview} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No image selected</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Max Attendees</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter max attendees"
        keyboardType="numeric"
        value={maxAttendees}
        onChangeText={setMaxAttendees}
      />

      <Text style={styles.label}>Current Attendees</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter current attendees"
        keyboardType="numeric"
        value={currentAttendees}
        onChangeText={setCurrentAttendees}
      />

      <Text style={styles.label}>Priority</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter priority"
        keyboardType="numeric"
        value={priority}
        onChangeText={setPriority}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter category"
        value={category}
        onChangeText={setCategory}
      />

      <View style={styles.submitContainer}>
        <Button title="Add Event" onPress={handleSubmit} />
      </View>
    </ScrollView>
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#4f6cf7",
  },
  submitContainer: {
    marginTop: 20,
  },
});