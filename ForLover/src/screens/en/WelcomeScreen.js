import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native'; // Import Alert

export default function WelcomeEN({ navigation }) {
  const [username, setUsername] = useState('');

  const handleStart = () => {
    // Validate username length
    if (username.trim().length < 4) {
      Alert.alert('Error', 'Please enter your name with at least 4 characters.');
      return;
    }
    if (username.trim().length > 15) {
      Alert.alert('Error', 'Please enter your name within 20 characters.');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your name.'); 
      return;
    }

    navigation.replace('MainEN', { username });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💖 FOR LOVER 💖</Text>
      <Text style={styles.subtitle}>Built For Two Souls And One Love</Text>

      {/* Username Input */}
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="ENTER YOUR NAME"
        textAlign="center"
        placeholderTextColor="#999"
        style={styles.input}
        maxLength={20}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#00a86b' }]}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>START</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#aa336a', marginTop: 20 }]}
          onPress={() => navigation.replace('WelcomeJA')}
        >
          <Text style={styles.buttonText}>日本語</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECC5C0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 37,
    fontWeight: 'bold',
    color: '#aa336a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  // Updated input style
  input: {
    width: '70%', // Matches button width
    paddingVertical: 10,
    fontSize: 18,
    color: '#333',
    backgroundColor: 'white', // White background
    borderBottomWidth: 2, // Pink bottom border
    borderBottomColor: '#FF69B4',
    marginBottom: 20, // Space below the input
    borderRadius: 5, // Slight rounding for the input field
    paddingHorizontal: 10, // Horizontal padding for text
  },
  buttonContainer: {
    marginTop: 20,
    width: '70%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
