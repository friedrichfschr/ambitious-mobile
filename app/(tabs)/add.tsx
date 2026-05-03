import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Divider, HelperText, Menu, Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AuthBanner } from '@/src/components/AuthBanner';
import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';
import { feedApi } from '@/src/lib/feed-api';

type PostType = 'feed' | 'opportunity';

const POST_TYPE_OPTIONS: { value: PostType; label: string; icon: string; description: string }[] = [
  {
    value: 'feed',
    label: 'Feed post',
    icon: 'text-box-outline',
    description: 'Share an update with the community',
  },
  {
    value: 'opportunity',
    label: 'Opportunity',
    icon: 'briefcase-outline',
    description: 'Post a job, grant, or program',
  },
];

const MAX_IMAGES = 4;
const MAX_CHARS = 3000;

type PickedImage = { uri: string; type: string; name: string };

export default function AddScreen() {
  const { user, accessToken } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const [postType, setPostType] = useState<PostType>('feed');
  const [menuOpen, setMenuOpen] = useState(false);
  const [text, setText] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedOption = POST_TYPE_OPTIONS.find((o) => o.value === postType)!;
  const charsLeft = MAX_CHARS - text.length;
  const canSubmit = text.trim().length > 0 && !loading;

  async function pickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Photo library access is required to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.85,
      orderedSelection: true,
    });

    if (result.canceled) return;

    const picked: PickedImage[] = result.assets.map((a) => ({
      uri: a.uri,
      type: a.mimeType ?? 'image/jpeg',
      name: a.fileName ?? `photo_${Date.now()}.jpg`,
    }));

    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    setError(null);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!accessToken || !canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      if (postType === 'feed') {
        const form = new FormData();
        form.append('text', text.trim());
        images.forEach((img) => {
          form.append('files', {
            uri: img.uri,
            type: img.type,
            name: img.name,
          } as any);
        });
        await feedApi.createPost(form, accessToken);
        setText('');
        setImages([]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <AuthBanner />
        <View style={styles.unauthBody}>
          <MaterialCommunityIcons name="pencil-plus-outline" size={48} color={c.onSurfaceVariant} style={{ opacity: 0.4 }} />
          <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
            Sign in to create posts and share opportunities with the community.
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">

        {/* ── Post type selector ─────────────────────────────────────────── */}
        <Text variant="labelMedium" style={[styles.sectionLabel, { color: c.onSurfaceVariant }]}>
          POST TYPE
        </Text>

        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.8}
              style={[styles.typeSelector, { backgroundColor: c.surface, borderColor: c.outlineVariant }]}>
              <MaterialCommunityIcons name={selectedOption.icon as any} size={20} color={c.primary} />
              <Text variant="bodyMedium" style={{ color: c.onSurface, flex: 1, marginLeft: 10 }}>
                {selectedOption.label}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={c.onSurfaceVariant} />
            </TouchableOpacity>
          }
          contentStyle={{ backgroundColor: c.surface }}>
          {POST_TYPE_OPTIONS.map((opt, i) => (
            <View key={opt.value}>
              <TouchableOpacity
                onPress={() => { setPostType(opt.value); setMenuOpen(false); }}
                style={styles.menuItem}
                activeOpacity={0.7}>
                <View style={[styles.menuIconWrap, {
                  backgroundColor: opt.value === postType ? c.primaryContainer : c.surfaceVariant,
                }]}>
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={18}
                    color={opt.value === postType ? c.primary : c.onSurfaceVariant}
                  />
                </View>
                <View style={styles.menuText}>
                  <Text variant="bodyMedium" style={{ color: c.onSurface, fontWeight: '600' }}>{opt.label}</Text>
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{opt.description}</Text>
                </View>
                {opt.value === postType && (
                  <MaterialCommunityIcons name="check" size={18} color={c.primary} />
                )}
              </TouchableOpacity>
              {i < POST_TYPE_OPTIONS.length - 1 && <Divider />}
            </View>
          ))}
        </Menu>

        {/* ── Opportunity coming soon ────────────────────────────────────── */}
        {postType === 'opportunity' && (
          <View style={[styles.comingSoon, { backgroundColor: c.surfaceVariant, borderColor: c.outlineVariant }]}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={c.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginLeft: 8, flex: 1 }}>
              Opportunity posting is coming soon. Use feed posts for now.
            </Text>
          </View>
        )}

        {/* ── Feed post composer ─────────────────────────────────────────── */}
        {postType === 'feed' && (
          <>
            <Text variant="labelMedium" style={[styles.sectionLabel, { color: c.onSurfaceVariant, marginTop: 24 }]}>
              CONTENT
            </Text>

            <TextInput
              value={text}
              onChangeText={(v) => { setText(v.slice(0, MAX_CHARS)); setError(null); setSuccess(false); }}
              placeholder="What's on your mind?"
              multiline
              numberOfLines={6}
              style={[styles.textInput, { backgroundColor: c.surface }]}
              contentStyle={styles.textInputContent}
              mode="outlined"
              outlineColor={c.outlineVariant}
              activeOutlineColor={c.primary}
            />
            <View style={styles.charRow}>
              <Text variant="bodySmall" style={{ color: charsLeft < 100 ? c.error : c.onSurfaceVariant }}>
                {charsLeft} characters left
              </Text>
            </View>

            {/* ── Images ──────────────────────────────────────────────────── */}
            <Text variant="labelMedium" style={[styles.sectionLabel, { color: c.onSurfaceVariant, marginTop: 20 }]}>
              IMAGES <Text style={{ fontWeight: '400' }}>({images.length}/{MAX_IMAGES})</Text>
            </Text>

            <View style={styles.imageGrid}>
              {images.map((img, i) => (
                <View key={i} style={[styles.imageThumb, { backgroundColor: c.surfaceVariant }]}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumbImg} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => removeImage(i)}
                    style={[styles.removeBtn, { backgroundColor: c.error }]}
                    activeOpacity={0.8}>
                    <MaterialCommunityIcons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < MAX_IMAGES && (
                <TouchableOpacity
                  onPress={pickImages}
                  activeOpacity={0.7}
                  style={[styles.addImageBtn, { backgroundColor: c.surfaceVariant, borderColor: c.outlineVariant }]}>
                  <MaterialCommunityIcons name="image-plus" size={24} color={c.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 4 }}>
                    Add photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {error ? (
              <HelperText type="error" visible style={styles.helperText}>{error}</HelperText>
            ) : null}

            {success ? (
              <View style={[styles.successBanner, { backgroundColor: c.primaryContainer }]}>
                <MaterialCommunityIcons name="check-circle" size={16} color={c.primary} />
                <Text variant="bodySmall" style={{ color: c.primary, marginLeft: 8 }}>
                  Post published successfully!
                </Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={loading}
              style={styles.submitBtn}
              contentStyle={styles.submitBtnContent}
              icon="send">
              Publish post
            </Button>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const THUMB_SIZE = 88;

const styles = StyleSheet.create({
  root:             { flex: 1 },
  unauthBody:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  scroll:           { padding: 16 },

  sectionLabel:     { letterSpacing: 0.6, marginBottom: 8 },

  typeSelector:     {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  menuItem:         { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIconWrap:     { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuText:         { flex: 1, gap: 2 },

  comingSoon:       {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  textInput:        { minHeight: 150 },
  textInputContent: { paddingTop: 12, textAlignVertical: 'top' },
  charRow:          { alignItems: 'flex-end', marginTop: 4 },

  imageGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageThumb:       { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 10, overflow: 'hidden' },
  imageThumbImg:    { width: '100%', height: '100%' },
  removeBtn:        {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn:      {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  helperText:       { marginTop: 4 },
  successBanner:    {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  submitBtn:        { marginTop: 20 },
  submitBtnContent: { height: 50 },
});
