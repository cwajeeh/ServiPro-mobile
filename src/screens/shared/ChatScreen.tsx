import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthPalette, Spacing } from '@/constants/theme';
import type { CustomerTabParamList, TaskerStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { useChatSocketStore } from '@/store/chatSocketStore';

const { NAVY, GRAY, PRIMARY_TEXT } = AuthPalette;

type ChatRoute =
  | RouteProp<TaskerStackParamList, 'TaskerChat'>
  | RouteProp<CustomerTabParamList, 'CustomerChat'>;

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRoute>();
  const { taskId, receiverId, title } = route.params;
  const userId = useAuthStore((s) => s.user?.id);
  const [draft, setDraft] = useState('');

  const connect = useChatSocketStore((s) => s.connect);
  const joinChat = useChatSocketStore((s) => s.joinChat);
  const sendMessage = useChatSocketStore((s) => s.sendMessage);
  const clearMessages = useChatSocketStore((s) => s.clearMessages);
  const messages = useChatSocketStore((s) => s.messages);
  const isConnected = useChatSocketStore((s) => s.isConnected);

  useEffect(() => {
    clearMessages();
    connect();
    if (userId) joinChat(Number(userId));
    joinChat(Number(receiverId));
    return () => {
      clearMessages();
    };
  }, [clearMessages, connect, joinChat, receiverId, userId]);

  const filtered = useMemo(
    () =>
      messages.filter((m) => {
        if (m.taskId == null) return true;
        return Number(m.taskId) === Number(taskId);
      }),
    [messages, taskId],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Chat'}
            </Text>
            <Text style={styles.sub}>{isConnected ? 'Online' : 'Connecting…'}</Text>
          </View>
          <View style={{ width: 48 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, item.mine && { color: '#FFF' }]}>
                  {item.message}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No messages yet. Say hello.</Text>
            }
          />

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message"
              placeholderTextColor="#94A3B8"
              multiline
            />
            <Pressable
              style={styles.sendBtn}
              onPress={() => {
                const text = draft.trim();
                if (!text) return;
                sendMessage({ receiverId, taskId, message: text });
                setDraft('');
              }}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  back: { color: NAVY, fontWeight: '600', width: 48 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: PRIMARY_TEXT },
  sub: { fontSize: 12, color: GRAY, marginTop: 2 },
  list: { padding: Spacing.four, flexGrow: 1 },
  empty: { textAlign: 'center', color: GRAY, marginTop: Spacing.six },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: Spacing.two,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: NAVY },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  bubbleText: { color: PRIMARY_TEXT, fontSize: 15, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: PRIMARY_TEXT,
  },
  sendBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendText: { color: '#FFF', fontWeight: '700' },
});
