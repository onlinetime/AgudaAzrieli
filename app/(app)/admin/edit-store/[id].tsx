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
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AdminEditStore() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "stores", id!);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert("שגיאה", "החנות לא נמצאה");
          router.back();
          return;
        }
        const data = snap.data() as any;
        setStoreName(data.name || "");
        setAddress(data.address || "");
        setDescription(data.description || "");
        setPhoneNumber(data.phoneNumber || "");
        setCategory(data.category || "");
        setDiscount(data.discount || "");
        setImageUri(data.picture || null);
      } catch (e) {
        console.error(e);
        Alert.alert("שגיאה", "לא ניתן לטעון את פרטי החנות");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("נדרש אישור", "אין הרשאה לגישה לתמונות");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!storeName.trim() || !discount.trim()) {
      Alert.alert("שגיאה", "יש למלא שם ותיאור הנחה");
      return;
    }
    try {
      setLoading(true);
      const ref = doc(db, "stores", id!);
      await updateDoc(ref, {
        name: storeName,
        address,
        description,
        phoneNumber,
        category,
        discount,
        picture: imageUri || "",
      });
      Alert.alert("בוצע", "החנות עודכנה בהצלחה");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("שגיאה", "עדכון נכשל, נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.primary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerText}>ערוך חנות</Text>
      </LinearGradient>

      {/* Image */}
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#BBB" />
          </View>
        )}
        <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
          <Text style={styles.pickBtnText}>בחר תמונה</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      {[
        { label: "שם החנות", value: storeName, setter: setStoreName },
        { label: "כתובת", value: address, setter: setAddress },
        { label: "תיאור", value: description, setter: setDescription, multiline: true },
        { label: "טלפון", value: phoneNumber, setter: setPhoneNumber, keyboard: "phone-pad" },
        { label: "קטגוריה", value: category, setter: setCategory },
        { label: "הנחה", value: discount, setter: setDiscount, keyboard: "numeric" },
      ].map(({ label, value, setter, multiline, keyboard }, idx) => (
        <View key={idx} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[styles.input, multiline && { height: 80 }]}
            value={value}
            onChangeText={setter}
            placeholder={label}
            placeholderTextColor="#888"
            multiline={!!multiline}
            keyboardType={keyboard as any}
          />
        </View>
      ))}

      <View style={styles.saveBtnWrapper}>
        <Button title="שמור שינויים" onPress={handleSave} color={colors.primary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 16,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  pickBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#3C7DE5",
    borderRadius: 12,
  },
  pickBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  saveBtnWrapper: {
    marginTop: 24,
  },
});
