import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * SafariUI_BottomBar Component
 * Rendered at the footer of the screen, mimicking the Apple Safari control dock.
 * Built with glassmorphism styles, fine lines, custom HSL highlight colors, and interactive hooks.
 */
export default function SafariUI_BottomBar({
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onOpenShare,
  onOpenTabs,
  onOpenDevHub,
  onOpenHistory,
  onOpenSettings,
  alwaysOnActive,
  onShowHelperTooltip,
}) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onGoBack}
        disabled={!canGoBack}
        onLongPress={() => onShowHelperTooltip('Back Button', 'Navigate to the previous page in history.')}
        delayLongPress={500}
      >
        <Feather
          name="chevron-left"
          size={24}
          color={canGoBack ? '#007AFF' : '#4E5A70'}
        />
      </TouchableOpacity>

      {/* Forward Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onGoForward}
        disabled={!canGoForward}
        onLongPress={() => onShowHelperTooltip('Forward Button', 'Navigate to the next page in history.')}
        delayLongPress={500}
      >
        <Feather
          name="chevron-right"
          size={24}
          color={canGoForward ? '#007AFF' : '#4E5A70'}
        />
      </TouchableOpacity>

      {/* Share / Actions Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onOpenShare}
        onLongPress={() => onShowHelperTooltip('Action Panel', 'Share page URL or launch customizable quick-actions.')}
        delayLongPress={500}
      >
        <Feather name="share" size={22} color="#007AFF" />
      </TouchableOpacity>

      {/* History Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onOpenHistory}
        onLongPress={() => onShowHelperTooltip('History', 'View your recent browsing history.')}
        delayLongPress={500}
      >
        <Feather name="clock" size={20} color="#007AFF" />
      </TouchableOpacity>

      {/* Tabs Manager / Tabs Overlay Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onOpenTabs}
        onLongPress={() => onShowHelperTooltip('Tabs Manager', 'Open multi-tab screen overview or switch active tab sessions.')}
        delayLongPress={500}
      >
        <Feather name="layers" size={20} color="#007AFF" />
      </TouchableOpacity>

      {/* Dev Hub / Bookmarks Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onOpenDevHub}
        onLongPress={() => onShowHelperTooltip('Dev Hub & Snippets', 'Access Vercel/GitHub/Render dashboards, console snippets, and passwords.')}
        delayLongPress={500}
      >
        <View style={styles.devHubWrapper}>
          <Feather name="terminal" size={20} color="#A855F7" />
          {/* Always-On proxy status badge */}
          <View style={[styles.statusDot, { backgroundColor: alwaysOnActive ? '#10B981' : '#EF4444' }]} />
        </View>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onOpenSettings}
        onLongPress={() => onShowHelperTooltip('Settings', 'Browser configuration, privacy shields, and data management.')}
        delayLongPress={500}
      >
        <Feather name="settings" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // Semi-transparent glass slate
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: width,
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  button: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devHubWrapper: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0F172A',
  },
});
