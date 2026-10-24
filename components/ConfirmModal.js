import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { colors, fonts } from '../theme';
import PrimaryButton from './PrimaryButton';
import DarkButton from './DarkButton';

export default function ConfirmModal({
  visible,
  title = 'EXIT',
  message = 'Are you sure you want to exit?',
  confirmLabel = 'YES',
  cancelLabel = 'NO',
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Centered Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons: NO (Cancel) and YES (Confirm) */}
          <View style={styles.buttonRow}>
            <DarkButton
              label={cancelLabel}
              onPress={onCancel}
              style={styles.actionBtn}
            />
            <PrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 4, 2, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#4A2E1C',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontFamily: fonts.display800,
    fontSize: 26,
    letterSpacing: 1.5,
    color: colors.flameLight,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body800,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textOnDark,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
});
