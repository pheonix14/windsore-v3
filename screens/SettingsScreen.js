import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const SEARCH_ENGINES = [
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { name: 'Google', url: 'https://google.com/search?q=' },
  { name: 'Bing', url: 'https://bing.com/search?q=' },
  { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=' },
  { name: 'Brave Search', url: 'https://search.brave.com/search?q=' },
  { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=' },
  { name: 'StartPage', url: 'https://www.startpage.com/search?q=' },
];

const ZOOM_LEVELS = ['50%', '75%', '90%', '100%', '110%', '125%', '150%', '200%'];

const USER_AGENTS = [
  { name: 'Auto (Default)', value: '' },
  { name: 'Mobile (Android)', value: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { name: 'Desktop (Chrome/Mac)', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Desktop (Firefox/Win)', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0' },
  { name: 'iPad (Safari)', value: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'Googlebot', value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
];

export default function SettingsScreen({ isVisible, onClose }) {
  // --- General ---
  const [homepage, setHomepage] = useState('https://duckduckgo.com');
  const [selectedEngine, setSelectedEngine] = useState(0);
  const [selectedZoom, setSelectedZoom] = useState(3); // 100%
  const [selectedAgent, setSelectedAgent] = useState(0);

  // --- Privacy & Security ---
  const [privacyShields, setPrivacyShields] = useState(true);
  const [doNotTrack, setDoNotTrack] = useState(true);
  const [httpsUpgrade, setHttpsUpgrade] = useState(true);
  const [blockThirdPartyCookies, setBlockThirdPartyCookies] = useState(false);
  const [blockPopups, setBlockPopups] = useState(true);
  const [safetyWarning, setSafetyWarning] = useState(true);
  const [preventCrossSiteTracking, setPreventCrossSiteTracking] = useState(true);

  // --- Display ---
  const [darkMode, setDarkMode] = useState(true);
  const [forceDarkOnSites, setForceDarkOnSites] = useState(false);
  const [nightFilter, setNightFilter] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [readerMode, setReaderMode] = useState(false);

  // --- Content ---
  const [enableJS, setEnableJS] = useState(true);
  const [mediaAutoplay, setMediaAutoplay] = useState(false);
  const [webRTC, setWebRTC] = useState(true);
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [micAccess, setMicAccess] = useState(false);

  // --- Accessibility ---
  const [textBold, setTextBold] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // UI accordion state
  const [openSection, setOpenSection] = useState('general');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const clearData = (type) => {
    Alert.alert(
      `Clear ${type}`,
      `Are you sure you want to clear ${type.toLowerCase()}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Done', `${type} cleared successfully.`) },
      ]
    );
  };

  const SectionHeader = ({ title, icon, section }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section)}>
      <View style={styles.sectionHeaderLeft}>
        <Feather name={icon} size={16} color="#A855F7" style={{ marginRight: 10 }} />
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
      <Feather name={openSection === section ? 'chevron-up' : 'chevron-down'} size={16} color="#8F9CAE" />
    </TouchableOpacity>
  );

  const SettingRow = ({ label, subtitle, value, onValueChange, icon }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        {icon && <Feather name={icon} size={14} color="#8F9CAE" style={{ marginRight: 10 }} />}
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2D3748', true: '#7C3AED' }}
        thumbColor={value ? '#A855F7' : '#8F9CAE'}
      />
    </View>
  );

  const SelectRow = ({ label, items, selectedIndex, onSelect }) => (
    <View style={styles.selectContainer}>
      <Text style={styles.selectLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, selectedIndex === i && styles.chipSelected]}
            onPress={() => onSelect(i)}
          >
            <Text style={[styles.chipText, selectedIndex === i && styles.chipTextSelected]}>
              {item.name || item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Feather name="settings" size={20} color="#A855F7" style={{ marginRight: 10 }} />
            <Text style={styles.headerTitle}>SETTINGS</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── GENERAL ── */}
          <SectionHeader title="General" icon="home" section="general" />
          {openSection === 'general' && (
            <View style={styles.sectionBody}>
              <Text style={styles.fieldLabel}>Homepage</Text>
              <TextInput
                style={styles.textInput}
                value={homepage}
                onChangeText={setHomepage}
                placeholder="https://..."
                placeholderTextColor="#4E5A70"
                keyboardType="url"
                autoCapitalize="none"
              />
              <SelectRow
                label="Search Engine"
                items={SEARCH_ENGINES}
                selectedIndex={selectedEngine}
                onSelect={setSelectedEngine}
              />
              <SelectRow
                label="Default Zoom"
                items={ZOOM_LEVELS}
                selectedIndex={selectedZoom}
                onSelect={setSelectedZoom}
              />
              <SelectRow
                label="User Agent"
                items={USER_AGENTS}
                selectedIndex={selectedAgent}
                onSelect={setSelectedAgent}
              />
            </View>
          )}

          {/* ── PRIVACY & SECURITY ── */}
          <SectionHeader title="Privacy & Security" icon="shield" section="privacy" />
          {openSection === 'privacy' && (
            <View style={styles.sectionBody}>
              <SettingRow label="Privacy Shields" subtitle="Block ads & tracking scripts" icon="zap" value={privacyShields} onValueChange={setPrivacyShields} />
              <SettingRow label="Prevent Cross-Site Tracking" subtitle="Isolate cookies per site" icon="link" value={preventCrossSiteTracking} onValueChange={setPreventCrossSiteTracking} />
              <SettingRow label="Do Not Track" subtitle="Send DNT headers to sites" icon="eye-off" value={doNotTrack} onValueChange={setDoNotTrack} />
              <SettingRow label="HTTPS Upgrade" subtitle="Force HTTPS on all connections" icon="lock" value={httpsUpgrade} onValueChange={setHttpsUpgrade} />
              <SettingRow label="Block 3rd Party Cookies" subtitle="Kiwi-style cookie isolation" icon="slash" value={blockThirdPartyCookies} onValueChange={setBlockThirdPartyCookies} />
              <SettingRow label="Block Pop-ups" subtitle="Suppress pop-up windows" icon="x-square" value={blockPopups} onValueChange={setBlockPopups} />
              <SettingRow label="Safety Warning" subtitle="Warn on dangerous sites" icon="alert-triangle" value={safetyWarning} onValueChange={setSafetyWarning} />
            </View>
          )}

          {/* ── DISPLAY ── */}
          <SectionHeader title="Display" icon="monitor" section="display" />
          {openSection === 'display' && (
            <View style={styles.sectionBody}>
              <SettingRow label="Dark Mode Theme" subtitle="Toggle Windsore UI theme" icon="moon" value={darkMode} onValueChange={setDarkMode} />
              <SettingRow label="Force Dark on Websites" subtitle="Invert page colours (Via-style)" icon="sun" value={forceDarkOnSites} onValueChange={setForceDarkOnSites} />
              <SettingRow label="Night Filter" subtitle="Warm tint overlay for night use" icon="sunset" value={nightFilter} onValueChange={setNightFilter} />
              <SettingRow label="Load Images" subtitle="Uncheck to save data (Via-style)" icon="image" value={showImages} onValueChange={setShowImages} />
              <SettingRow label="Reader Mode" subtitle="Strip page to pure article text" icon="book-open" value={readerMode} onValueChange={setReaderMode} />
            </View>
          )}

          {/* ── CONTENT ── */}
          <SectionHeader title="Content & Site Permissions" icon="globe" section="content" />
          {openSection === 'content' && (
            <View style={styles.sectionBody}>
              <SettingRow label="Enable JavaScript" subtitle="Allow sites to run scripts" icon="code" value={enableJS} onValueChange={setEnableJS} />
              <SettingRow label="Cookies" subtitle="Allow websites to store cookies" icon="archive" value={cookiesEnabled} onValueChange={setCookiesEnabled} />
              <SettingRow label="Media Autoplay" subtitle="Allow videos to auto-start" icon="play" value={mediaAutoplay} onValueChange={setMediaAutoplay} />
              <SettingRow label="WebRTC" subtitle="Allow peer-to-peer connections" icon="radio" value={webRTC} onValueChange={setWebRTC} />
              <SettingRow label="Allow Location" subtitle="Grant GPS access to sites" icon="map-pin" value={locationAccess} onValueChange={setLocationAccess} />
              <SettingRow label="Allow Camera" subtitle="Grant camera access to sites" icon="camera" value={cameraAccess} onValueChange={setCameraAccess} />
              <SettingRow label="Allow Microphone" subtitle="Grant mic access to sites" icon="mic" value={micAccess} onValueChange={setMicAccess} />
            </View>
          )}

          {/* ── ACCESSIBILITY ── */}
          <SectionHeader title="Accessibility" icon="type" section="accessibility" />
          {openSection === 'accessibility' && (
            <View style={styles.sectionBody}>
              <SettingRow label="Bold Text" subtitle="Increase font weight across the app" icon="bold" value={textBold} onValueChange={setTextBold} />
              <SettingRow label="High Contrast" subtitle="Improve readability in bright light" icon="contrast" value={highContrast} onValueChange={setHighContrast} />
            </View>
          )}

          {/* ── DATA MANAGEMENT ── */}
          <SectionHeader title="Data Management" icon="trash-2" section="data" />
          {openSection === 'data' && (
            <View style={styles.sectionBody}>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => clearData('Cache')}>
                <Feather name="hard-drive" size={14} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.dangerBtnText}>Clear Cache</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => clearData('Cookies')}>
                <Feather name="archive" size={14} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.dangerBtnText}>Clear Cookies</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => clearData('History')}>
                <Feather name="clock" size={14} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.dangerBtnText}>Clear History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dangerBtn, { backgroundColor: '#7F1D1D', borderColor: '#EF4444' }]} onPress={() => clearData('All Browsing Data')}>
                <Feather name="trash-2" size={14} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.dangerBtnText}>Clear All Data</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── ABOUT ── */}
          <SectionHeader title="About" icon="info" section="about" />
          {openSection === 'about' && (
            <View style={styles.sectionBody}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>App</Text>
                <Text style={styles.aboutValue}>Windsore Browser</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>V3.0.0</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Author</Text>
                <Text style={styles.aboutValue}>PHEONIX14</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Engine</Text>
                <Text style={styles.aboutValue}>WebKit (react-native-webview)</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>GitHub</Text>
                <Text style={[styles.aboutValue, { color: '#A855F7' }]}>pheonix14/windsore-v3</Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E17' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15,23,42,0.95)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  closeBtn: { padding: 6 },
  scroll: { flex: 1 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginTop: 2,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  sectionHeaderText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  sectionBody: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  settingLabel: { color: '#E2E8F0', fontSize: 14 },
  settingSubtitle: { color: '#64748B', fontSize: 11, marginTop: 2 },

  fieldLabel: { color: '#94A3B8', fontSize: 11, letterSpacing: 1, marginBottom: 6, marginTop: 8 },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    color: '#E2E8F0', fontSize: 13, marginBottom: 12,
  },

  selectContainer: { marginVertical: 10 },
  selectLabel: { color: '#94A3B8', fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  chipSelected: { backgroundColor: 'rgba(168,85,247,0.2)', borderColor: '#A855F7' },
  chipText: { color: '#94A3B8', fontSize: 12 },
  chipTextSelected: { color: '#A855F7', fontWeight: '600' },

  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#EF4444',
    borderRadius: 10, paddingVertical: 12, marginVertical: 5,
  },
  dangerBtnText: { color: '#FCA5A5', fontSize: 13, fontWeight: '600' },

  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  aboutLabel: { color: '#64748B', fontSize: 13 },
  aboutValue: { color: '#E2E8F0', fontSize: 13 },
});
