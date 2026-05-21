import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { DancingScript_400Regular, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';

import BrowserEngine from './components/BrowserEngine';
import DevHub from './screens/DevHub';
import MiniGame from './screens/MiniGame';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { executeBurnMode } from './utils/BurnMode';

const { width } = Dimensions.get('window');

export default function App() {
  // Navigation / Tab configurations
  const [tabs, setTabs] = useState([
    { id: 'tab1', title: 'WINDSORE Dev Home', url: 'https://duckduckgo.com' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab1');
  
  // Custom overlay toggle controls
  const [showDevHub, setShowDevHub] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showTabList, setShowTabList] = useState(false);
  
  // Always-On security states (Brave/Via shields)
  const [alwaysOnActive, setAlwaysOnActive] = useState(true);
  const [pcModeActive, setPcModeActive] = useState(false);
  
  // Helper UI Tooltip states
  const [tooltipTitle, setTooltipTitle] = useState('');
  const [tooltipDesc, setTooltipDesc] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Logo tapping Easter Egg tracker
  const [logoTapCount, setLogoTapCount] = useState(0);

  // Modals & States
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState([]); // { url, title, timestamp }

  // Password Manager Script inject pipeline
  const [passwordScript, setPasswordScript] = useState('');

  // Fonts
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'PlayfairDisplay': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'DancingScript': DancingScript_400Regular,
    'DancingScript-Bold': DancingScript_700Bold,
  });

  // Physical Keyboard listener setup wrapper
  useEffect(() => {
    // If running in a simulator or Dex, we handle keyboard binding setups
    console.log('[Keyboard] Initializing binding registers...');
    
    // In React Native, physical keyboard listener requires native linking
    // We add a mock representation showing standard keydown mapping for key chords
    const mockKeyboardHook = (event) => {
      // Examples:
      // Ctrl+T: New Tab
      // Ctrl+W: Close Tab
      // Ctrl+R: Reload
    };
    
    return () => {
      // Cleanup hooks
    };
  }, []);

  const getActiveTab = () => {
    return tabs.find(t => t.id === activeTabId) || tabs[0];
  };

  const updateActiveTabUrl = (url) => {
    setTabs(prev =>
      prev.map(t => (t.id === activeTabId ? { ...t, url } : t))
    );
  };

  // Easter Egg count tracker
  const handleLogoTap = () => {
    const nextCount = logoTapCount + 1;
    if (nextCount >= 7) {
      setLogoTapCount(0);
      setShowMiniGame(true);
    } else {
      setLogoTapCount(nextCount);
      // Automatically reset if user doesn't keep tapping within 3 seconds
      setTimeout(() => setLogoTapCount(0), 3000);
    }
  };

  // Burn Mode wipe trigger
  const handleBurnTrigger = () => {
    Alert.alert(
      'BURN PROTOCOL ACTIVATED',
      'This will instantly delete cache, storage, vaults, passwords, and close WINDSORE. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'BURN DATA',
          style: 'destructive',
          onPress: () => {
            executeBurnMode([
              () => setTabs([{ id: 'tab1', title: 'Home', url: 'about:blank' }]),
              () => setActiveTabId('tab1'),
              () => setAlwaysOnActive(false),
            ]);
          }
        }
      ]
    );
  };

  // Helper Tooltip builder
  const handleTriggerTooltip = (title, desc) => {
    setTooltipTitle(title);
    setTooltipDesc(desc);
    setShowTooltip(true);
  };

  const handleAddNewTab = () => {
    const newId = `tab_${Date.now()}`;
    const newTab = { id: newId, title: 'New Tab', url: 'https://duckduckgo.com' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setShowTabList(false);
  };

  const handleCloseTab = (id) => {
    if (tabs.length === 1) {
      Alert.alert('Access Error', 'At least one active browser tab is required.');
      return;
    }
    const filtered = tabs.filter(t => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
  };

  const handleAddToHistory = (url, title) => {
    if (url && !url.includes('duckduckgo.com/?q=')) {
      setHistory(prev => {
        const newItem = { url, title: title || url, timestamp: Date.now() };
        // avoid immediate duplicates
        if (prev.length > 0 && prev[0].url === url) return prev;
        return [newItem, ...prev].slice(0, 100);
      });
    }
  };

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0A0E17' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />
      
      {/* Top Banner Control Dock */}
      <View style={styles.topControlDock}>
        <TouchableOpacity onPress={handleLogoTap} style={styles.logoGroup}>
          <Text style={styles.logoText}>WINDSORE</Text>
          <Text style={styles.logoSub}>by PHEONIX14</Text>
        </TouchableOpacity>

        <View style={styles.topIcons}>
          {/* Always ON Proxy state toggle */}
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => setAlwaysOnActive(!alwaysOnActive)}
            onLongPress={() => handleTriggerTooltip('Always-ON Proxy Shield', 'Enforce secure VPN proxy routing, tracking shields, and HTTPS tunnel filters.')}
            delayLongPress={500}
          >
            <Feather
              name={alwaysOnActive ? "shield" : "shield-off"}
              size={18}
              color={alwaysOnActive ? "#10B981" : "#EF4444"}
            />
          </TouchableOpacity>

          {/* Tab overlay toggle */}
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => setShowTabList(true)}
            onLongPress={() => handleTriggerTooltip('Tab Deck Switcher', 'Manage, create, or discard browser tab contexts.')}
            delayLongPress={500}
          >
            <View style={styles.badgeWrapper}>
              <Feather name="copy" size={18} color="#94A3B8" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tabs.length}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Burn Mode Trigger */}
          <TouchableOpacity
            style={[styles.topBtn, styles.burnBtn]}
            onPress={handleBurnTrigger}
            onLongPress={() => handleTriggerTooltip('Burn Protocol Toggle', 'Instant cache purge, cookies wipe, secure storage erase, and application termination.')}
            delayLongPress={500}
          >
            <Feather name="alert-circle" size={18} color="#FF5A5A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Browser View Area */}
      <View style={styles.browserFrame}>
        <BrowserEngine
          key={activeTabId}
          url={getActiveTab().url}
          onUrlChange={updateActiveTabUrl}
          alwaysOnActive={alwaysOnActive}
          onShowHelperTooltip={handleTriggerTooltip}
          onOpenDevHub={() => setShowDevHub(true)}
          onOpenHistory={() => setShowHistory(true)}
          onOpenSettings={() => setShowSettings(true)}
          passwordAutofillTrigger={passwordScript}
          onClearAutofill={() => setPasswordScript('')}
          selectedTabId={activeTabId}
          onAddToHistory={handleAddToHistory}
        />
      </View>

      {/* Tab Deck Manager Drawer */}
      <Modal visible={showTabList} animationType="slide" transparent>
        <View style={styles.tabOverlay}>
          <View style={styles.tabSheet}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabSheetTitle}>ACTIVE TABS DECK</Text>
              <TouchableOpacity onPress={() => handleAddNewTab()} style={styles.newTabBtn}>
                <Feather name="plus" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.newTabBtnText}>New Tab</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tabScroll}>
              {tabs.map(tab => (
                <View key={tab.id} style={[styles.tabCard, tab.id === activeTabId && styles.tabCardActive]}>
                  <TouchableOpacity
                    style={styles.tabCardClick}
                    onPress={() => {
                      setActiveTabId(tab.id);
                      setShowTabList(false);
                    }}
                  >
                    <Feather name="globe" size={14} color="#94A3B8" style={{ marginRight: 10 }} />
                    <Text style={styles.tabCardTitle} numberOfLines={1}>{tab.title || tab.url}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCloseTab(tab.id)} style={styles.tabCloseBtn}>
                    <Feather name="trash-2" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setShowTabList(false)} style={styles.tabCloseSheetBtn}>
              <Text style={styles.tabCloseSheetText}>Close Deck</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Developer Hub Sheet */}
      <DevHub
        isVisible={showDevHub}
        onClose={() => setShowDevHub(false)}
        onInjectScript={(code) => setPasswordScript(code)}
        currentTabUrl={getActiveTab().url}
      />

      {/* History Sheet */}
      <HistoryScreen
        isVisible={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onNavigate={(url) => {
          updateActiveTabUrl(url);
        }}
      />

      {/* Settings Sheet */}
      <SettingsScreen
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Hidden Easter Egg Modal Deck */}
      <MiniGame
        isVisible={showMiniGame}
        onClose={() => setShowMiniGame(false)}
      />

      {/* Dynamic Context Tooltip (Best Helper UI) */}
      <Modal visible={showTooltip} transparent animationType="fade">
        <View style={styles.tooltipOverlay}>
          <View style={styles.tooltipCard}>
            <View style={styles.tooltipHeader}>
              <Feather name="info" size={16} color="#A855F7" />
              <Text style={styles.tooltipTitle}>{tooltipTitle}</Text>
            </View>
            <Text style={styles.tooltipDesc}>{tooltipDesc}</Text>
            <TouchableOpacity onPress={() => setShowTooltip(false)} style={styles.tooltipClose}>
              <Text style={styles.tooltipCloseText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  topControlDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0A0E17',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoGroup: {
    justifyContent: 'center',
  },
  logoText: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk-Bold',
    letterSpacing: 1.5,
  },
  logoSub: {
    color: '#8F9CAE',
    fontSize: 11,
    fontFamily: 'DancingScript-Bold',
    marginTop: -4,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBtn: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  burnBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  browserFrame: {
    flex: 1,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipCard: {
    width: width * 0.8,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipTitle: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  tooltipDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  tooltipClose: {
    backgroundColor: '#A855F7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tooltipCloseText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  tabOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  tabSheet: {
    height: '60%',
    backgroundColor: '#0A0E17',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabSheetTitle: {
    color: '#A855F7',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  newTabBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  newTabBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabScroll: {
    flex: 1,
  },
  tabCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabCardActive: {
    borderColor: '#3B82F6',
  },
  tabCardClick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabCardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    flex: 1,
  },
  tabCloseBtn: {
    padding: 4,
    marginLeft: 12,
  },
  tabCloseSheetBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  tabCloseSheetText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
});
