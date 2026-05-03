import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Divider, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { usePreferences } from '../src/contexts/preferences-context';
import { type ChatMessage, mockConversations } from '../src/data/opportunities';

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const initial = mockConversations[id] ?? [];
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    // Scroll to end when keyboard opens or messages change
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text,
      fromMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
  }

  const initials = (name ?? '?').slice(0, 2).toUpperCase();

  function renderMessage({ item, index }: { item: ChatMessage; index: number }) {
    const prev = messages[index - 1];
    const showAvatar = !item.fromMe && (index === 0 || prev?.fromMe);
    const grouped = prev && prev.fromMe === item.fromMe;

    return (
      <View style={[styles.msgRow, item.fromMe ? styles.msgRowMe : styles.msgRowThem]}>
        {/* Avatar placeholder to keep alignment on grouped messages */}
        {!item.fromMe && (
          <View style={styles.avatarSlot}>
            {showAvatar
              ? <Avatar.Text size={32} label={initials} style={{ backgroundColor: c.primaryContainer }} labelStyle={{ color: c.onPrimaryContainer, fontSize: 12 }} />
              : null
            }
          </View>
        )}

        <View style={[
          styles.bubble,
          item.fromMe
            ? [styles.bubbleMe, { backgroundColor: c.primary }]
            : [styles.bubbleThem, { backgroundColor: c.surfaceVariant }],
          grouped && (item.fromMe ? styles.bubbleMeGrouped : styles.bubbleThemGrouped),
        ]}>
          <Text style={[styles.bubbleText, { color: item.fromMe ? c.onPrimary : c.onSurface }]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, { color: item.fromMe ? c.onPrimary : c.onSurfaceVariant, opacity: 0.65 }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />

      <Divider />

      {/* Composer */}
      <View style={[styles.composer, { backgroundColor: c.surface }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={c.onSurfaceVariant}
          multiline
          style={[styles.input, { color: c.onSurface, backgroundColor: c.surfaceVariant }]}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!draft.trim()}
          style={[styles.sendBtn, { backgroundColor: draft.trim() ? c.primary : c.surfaceVariant }]}
          activeOpacity={0.75}>
          <MaterialCommunityIcons name="send" size={18} color={draft.trim() ? c.onPrimary : c.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1 },
  list:               { paddingHorizontal: 12, paddingVertical: 16 },
  sep:                { height: 4 },

  msgRow:             { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe:           { justifyContent: 'flex-end' },
  msgRowThem:         { justifyContent: 'flex-start' },

  avatarSlot:         { width: 32 },

  bubble:             { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  bubbleMe:           { borderBottomRightRadius: 4 },
  bubbleThem:         { borderBottomLeftRadius: 4 },
  bubbleMeGrouped:    { borderBottomRightRadius: 18, borderTopRightRadius: 4 },
  bubbleThemGrouped:  { borderBottomLeftRadius: 18, borderTopLeftRadius: 4 },

  bubbleText:         { fontSize: 15, lineHeight: 21 },
  timestamp:          { fontSize: 11, alignSelf: 'flex-end' },

  composer:           { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn:            { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
