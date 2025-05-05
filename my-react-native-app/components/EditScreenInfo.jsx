// filepath: c:\Users\ASUS\Desktop\react native\AgudaAzrieli\components\EditScreenInfo.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EditScreenInfo = ({ path }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit this screen to change the content.</Text>
      <Text style={styles.path}>Path: {path}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  path: {
    fontSize: 14,
    color: 'gray',
  },
});

export default EditScreenInfo;