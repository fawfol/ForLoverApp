//Duogram/src/screens/Tabs/ChatScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, ActivityIndicator, Platform } from 'react-native';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase';
import moment from 'moment';

const db = getFirestore();

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [pairCode, setPairCode] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const flatListRef = useRef(null);

  //load the user's pair code from Firestore (only once)
  useEffect(() => {
    let mounted = true;
    async function getPairCode() {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (mounted && userDoc.exists()) setPairCode(userDoc.data().pairCode);
      } catch (err) {}
    }
    getPairCode();
    return () => { mounted = false };
  }, [user]);

  //real-time listener on messages for this pair
  useEffect(() => {
    if (!pairCode) return;
    setLoading(true);
    const q = query(collection(db, 'pairs', pairCode, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      setLoading(false);
      //scroll to bottom on new message
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsubscribe;
  }, [pairCode]);

  //send new message
  const sendMessage = async () => {
    if (!input.trim() || !pairCode || !user?.uid) return;
    await addDoc(collection(db, 'pairs', pairCode, 'messages'), {
      text: input.trim(),
      sender: user.uid,
      timestamp: new Date()
    });
    setInput('');
  };

  //render each message bubble
  const renderItem = ({ item }) => {
    const isMine = item.sender === user.uid;
    let timeString = '';
    if (item.timestamp?.toDate) {
      timeString = moment(item.timestamp.toDate()).format('HH:mm');
    } else if (item.timestamp) {
      timeString = moment(item.timestamp).format('HH:mm');
    }
    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.partnerBubble]}>
        <Text style={styles.msgText}>{item.text}</Text>
        <Text style={styles.meta}>
          {isMine ? 'You' : 'Partner'} • {timeString}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 180: 130}
    >
      <View style={{ flex: 1 }}>
        {loading ? (
  <ActivityIndicator style={{ flex: 1, alignSelf: 'center', marginTop: 40 }} size="large" color="#007AFF" />
) : messages.length === 0 ? (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>No messages yet</Text>
    <Text style={styles.emptyText}>Say hi 👋 and start the conversation!</Text>
  </View>
) : (
  <FlatList
    ref={flatListRef}
    data={messages}
    renderItem={renderItem}
    keyExtractor={item => item.id}
    style={{ flex: 1, padding: 16 }}
    contentContainerStyle={{ paddingBottom: 10 }}
    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
    keyboardShouldPersistTaps="handled"
  />
)}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            editable={!!pairCode}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn} disabled={!input.trim() || !pairCode}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10, borderRadius: 12, marginBottom: 10, maxWidth: '80%',
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7ff',
  },
  partnerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6',
  },
  msgText: { fontSize: 16 },
  meta: { fontSize: 11, color: '#888', marginTop: 2 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: { flex: 1, height: 40, borderColor: '#aaa', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12 },
  sendBtn: { marginLeft: 8, backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, opacity: 1 },
  sendText: { color: '#fff', fontWeight: 'bold' }
});
