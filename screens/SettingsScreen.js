import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen({ isVisible, onClose }) {
  const [searchEngine, setSearchEngine] = useState('DuckDuckGo');
  const [privacyShield, setPrivacyShield] = useState(true);
  const [jsEnabled, setJsEnabled] = useState(true);
  const [doNotTrack, setDoNotTrack] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SETTINGS</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* Search Engine Section */}
            <Text style={styles.sectionTitle}>SEARCH ENGINE</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.optionRow} onPress={() => setSearchEngine('DuckDuckGo')}>
                <Text style={styles.optionText}>DuckDuckGo (Recommended)</Text>
                {searchEngine === 'DuckDuckGo' && <Feather name="check" size={18} color="#10B981" />}
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.optionRow} onPress={() => setSearchEngine('Google')}>
                <Text style={styles.optionText}>Google</Text>
                {searchEngine === 'Google' && <Feather name="check" size={18} color="#10B981" />}
              </TouchableOpacity>
            </View>

            {/* Privacy Section */}
            <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
            <View style={styles.card}>
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionText}>Privacy Shields</Text>
                  <Text style={styles.optionSub}>Block ads and tracking scripts</Text>
                </View>
                <Switch
                  value={privacyShield}
                  onValueChange={setPrivacyShield}
                  trackColor={{ false: '#4E5A70', true: '#A855F7' }}
                  thumbColor="#FFF"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionText}>Do Not Track</Text>
                  <Text style={styles.optionSub}>Send DNT headers</Text>
                </View>
                <Switch
                  value={doNotTrack}
                  onValueChange={setDoNotTrack}
                  trackColor={{ false: '#4E5A70', true: '#A855F7' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>

            {/* Advanced Section */}
            <Text style={styles.sectionTitle}>ADVANCED</Text>
            <View style={styles.card}>
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionText}>Enable JavaScript</Text>
                  <Text style={styles.optionSub}>Allow sites to run interactive scripts</Text>
                </View>
                <Switch
                  value={jsEnabled}
                  onValueChange={setJsEnabled}
                  trackColor={{ false: '#4E5A70', true: '#A855F7' }}
                  thumbColor="#FFF"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.optionRow}>
                <View>
                  <Text style={styles.optionText}>Dark Mode App Theme</Text>
                  <Text style={styles.optionSub}>Toggle Windsore interface theme</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#4E5A70', true: '#A855F7' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>

            {/* Clear Data */}
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
            <TouchableOpacity style={styles.dangerBtn}>
              <Feather name="trash-2" size={16} color="#FFF" />
              <Text style={styles.dangerBtnText}>Clear Cache and Cookies</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Windsore Browser V3.0.0</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    backgroundColor: '#0A0E17',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Space Grotesk' : 'sans-serif',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#8F9CAE',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  optionText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
  },
  optionSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginLeft: 14,
  },
  dangerBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  dangerBtnText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  versionText: {
    color: '#4E5A70',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
