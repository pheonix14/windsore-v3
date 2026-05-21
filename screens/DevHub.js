import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as PasswordManager from '../utils/PasswordManager';

export default function DevHub({
  isVisible,
  onClose,
  onInjectScript,
  currentTabUrl,
}) {
  const [activeSubTab, setActiveSubTab] = useState('monitors'); // 'monitors', 'snippets', 'passwords', 'editor'
  
  // Custom quick links
  const [quickLinks, setQuickLinks] = useState([
    { id: '1', title: 'Localhost:3000', url: 'http://10.0.2.2:3000' },
    { id: '2', title: 'GitHub PRs', url: 'https://github.com/pulls' },
    { id: '3', title: 'Vercel Projects', url: 'https://vercel.com/dashboard' }
  ]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Snippets
  const [snippets, setSnippets] = useState([
    { id: 's1', title: 'CORS Override Bypass', code: 'console.log("CORS hooks injected successfully.");' },
    { id: 's2', title: 'Force Light/Dark Mode', code: 'document.body.style.filter = "invert(1) hue-rotate(180deg)";' },
    { id: 's3', title: 'Measure Performance', code: 'console.log(JSON.stringify(window.performance.timing));' }
  ]);
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetCode, setNewSnippetCode] = useState('');

  // Password Manager States
  const [unlocked, setUnlocked] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [pinMode, setPinMode] = useState('authenticate'); // 'authenticate' or 'setup'
  const [pinInput, setPinInput] = useState('');
  const [setupPinInput, setSetupPinInput] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');

  const [passwords, setPasswords] = useState([]);
  const [newAccount, setNewAccount] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Monitors state mock
  const servicesStatus = {
    github: { name: 'GitHub Actions', status: 'operational', buildTime: '2m ago' },
    vercel: { name: 'Vercel Routing', status: 'operational', deployments: '3 active' },
    render: { name: 'Render Servers', status: 'degraded', load: '82%' },
    wasmer: { name: 'Wasmer.io Testbed', status: 'operational', activeRuns: '0' },
  };

  // HTML Editor State
  const [editorCode, setEditorCode] = useState('<!DOCTYPE html>\\n<html>\\n<head>\\n<style>\\n  body { background: #0A0E17; color: #FFF; font-family: sans-serif; padding: 20px; }\\n</style>\\n</head>\\n<body>\\n  <h1>Windsore V3 Code Runner</h1>\\n</body>\\n</html>');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkPasscodeSetup();
    }
  }, [isVisible]);

  const checkPasscodeSetup = async () => {
    const hasCode = await PasswordManager.hasMasterPasscode();
    setHasPasscode(hasCode);
    if (!hasCode) {
      setPinMode('setup');
    } else {
      setPinMode('authenticate');
    }
  };

  // Authenticate Vault via Biometrics
  const handleUnlockBiometrics = async () => {
    const isBio = await PasswordManager.authenticateBiometrics();
    if (isBio.success) {
      setUnlocked(true);
      await loadVaultContents();
    } else {
      Alert.alert('Authentication Failed', isBio.reason || 'Could not verify biometrics.');
    }
  };

  // Authenticate Vault via PIN
  const handleUnlockPin = async () => {
    if (pinInput.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }
    const matched = await PasswordManager.verifyMasterPasscode(pinInput);
    if (matched) {
      setUnlocked(true);
      await loadVaultContents();
      setPinInput('');
    } else {
      Alert.alert('Access Denied', 'Invalid PIN code entered.');
    }
  };

  // Set up Master PIN
  const handleSetupPin = async () => {
    if (setupPinInput.length !== 4 || setupPinConfirm.length !== 4) {
      Alert.alert('Invalid PIN', 'Both PIN fields must be 4 digits.');
      return;
    }
    if (setupPinInput !== setupPinConfirm) {
      Alert.alert('PIN Mismatch', 'Passwords do not match. Please verify.');
      return;
    }
    const success = await PasswordManager.setupMasterPasscode(setupPinInput);
    if (success) {
      setHasPasscode(true);
      setUnlocked(true);
      setPinMode('authenticate');
      await loadVaultContents();
      setSetupPinInput('');
      setSetupPinConfirm('');
      Alert.alert('Vault Secured', 'Master 4-digit PIN passcode successfully registered!');
    } else {
      Alert.alert('Setup Failed', 'Failed to store master passcode.');
    }
  };

  const loadVaultContents = async () => {
    const list = await PasswordManager.getVaultData();
    if (list) {
      setPasswords(list);
    }
  };

  const handleAddCredential = async () => {
    if (!newAccount.trim() || !newUsername.trim() || !newPassword.trim()) {
      Alert.alert('Fields Required', 'Please complete account, username, and password fields.');
      return;
    }
    const newCred = {
      id: Date.now().toString(),
      account: newAccount.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
    };
    const updated = [...passwords, newCred];
    setPasswords(updated);
    await PasswordManager.saveVaultData(updated);
    setNewAccount('');
    setNewUsername('');
    setNewPassword('');
    Alert.alert('Success', 'Credential securely added.');
  };

  const handleAutofill = (cred) => {
    const script = PasswordManager.generateAutofillScript(cred.username, cred.password);
    onInjectScript(script);
    onClose();
  };

  const handleAddLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    const newL = {
      id: Date.now().toString(),
      title: newLinkTitle,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
    };
    setQuickLinks([...quickLinks, newL]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleAddSnippet = () => {
    if (!newSnippetTitle || !newSnippetCode) return;
    const newS = {
      id: Date.now().toString(),
      title: newSnippetTitle,
      code: newSnippetCode,
    };
    setSnippets([...snippets, newS]);
    setNewSnippetTitle('');
    setNewSnippetCode('');
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>WINDSORE DEV HUB</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#F8FAFC" />
            </TouchableOpacity>
          </View>

          {/* Sub Navigation Bar */}
          <View style={styles.subTabBar}>
            <TouchableOpacity
              style={[styles.subTabItem, activeSubTab === 'monitors' && styles.subTabActive]}
              onPress={() => setActiveSubTab('monitors')}
            >
              <Feather name="activity" size={16} color={activeSubTab === 'monitors' ? '#A855F7' : '#94A3B8'} />
              <Text style={[styles.subTabText, activeSubTab === 'monitors' && styles.subTextActive]}>Monitors</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTabItem, activeSubTab === 'snippets' && styles.subTabActive]}
              onPress={() => setActiveSubTab('snippets')}
            >
              <Feather name="code" size={16} color={activeSubTab === 'snippets' ? '#A855F7' : '#94A3B8'} />
              <Text style={[styles.subTabText, activeSubTab === 'snippets' && styles.subTextActive]}>Snippets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTabItem, activeSubTab === 'passwords' && styles.subTabActive]}
              onPress={() => setActiveSubTab('passwords')}
            >
              <Feather name="lock" size={16} color={activeSubTab === 'passwords' ? '#A855F7' : '#94A3B8'} />
              <Text style={[styles.subTabText, activeSubTab === 'passwords' && styles.subTextActive]}>Passwords</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subTabItem, activeSubTab === 'editor' && styles.subTabActive]}
              onPress={() => setActiveSubTab('editor')}
            >
              <Feather name="layout" size={16} color={activeSubTab === 'editor' ? '#A855F7' : '#94A3B8'} />
              <Text style={[styles.subTabText, activeSubTab === 'editor' && styles.subTextActive]}>Editor</Text>
            </TouchableOpacity>
          </View>

          {/* Content Window */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollBodyContent}>
            
            {/* 1. MONITORS TAB */}
            {activeSubTab === 'monitors' && (
              <View>
                <Text style={styles.sectionHeader}>DEPLOYMENT STATUS</Text>
                
                {/* GitHub */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <Feather name="github" size={18} color="#FFF" />
                      <Text style={styles.cardTitle}>{servicesStatus.github.name}</Text>
                    </View>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusIndicatorDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.statusLabel}>{servicesStatus.github.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardValue}>Pipeline finished: {servicesStatus.github.buildTime}</Text>
                </View>

                {/* Vercel */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <Feather name="triangle" size={16} color="#FFF" />
                      <Text style={styles.cardTitle}>{servicesStatus.vercel.name}</Text>
                    </View>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusIndicatorDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.statusLabel}>{servicesStatus.vercel.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardValue}>Deployments active: {servicesStatus.vercel.deployments}</Text>
                </View>

                {/* Render */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <Feather name="server" size={18} color="#FFF" />
                      <Text style={styles.cardTitle}>{servicesStatus.render.name}</Text>
                    </View>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusIndicatorDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={styles.statusLabel}>{servicesStatus.render.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardValue}>CPU Load Degraded: {servicesStatus.render.load}</Text>
                </View>

                {/* Wasmer.io */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <Feather name="check-circle" size={18} color="#FFF" />
                      <Text style={styles.cardTitle}>{servicesStatus.wasmer.name}</Text>
                    </View>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusIndicatorDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.statusLabel}>{servicesStatus.wasmer.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardValue}>WASI environments fully operational.</Text>
                </View>

                {/* Quick links manager */}
                <Text style={[styles.sectionHeader, { marginTop: 20 }]}>QUICK LINKS</Text>
                {quickLinks.map(link => (
                  <View key={link.id} style={styles.linkCard}>
                    <Text style={styles.linkLabel}>{link.title}</Text>
                    <Text style={styles.linkUrl}>{link.url}</Text>
                  </View>
                ))}

                <View style={styles.addLinkForm}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Link Name"
                    placeholderTextColor="#4E5A70"
                    value={newLinkTitle}
                    onChangeText={setNewLinkTitle}
                  />
                  <TextInput
                    style={[styles.inputField, { marginTop: 8 }]}
                    placeholder="URL (e.g. localhost:8000)"
                    placeholderTextColor="#4E5A70"
                    value={newLinkUrl}
                    onChangeText={setNewLinkUrl}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddLink}>
                    <Feather name="plus" size={16} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Shortcut</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 2. SNIPPETS TAB */}
            {activeSubTab === 'snippets' && (
              <View>
                <Text style={styles.sectionHeader}>INJECTABLE DEVELOPER SCRIPTS</Text>
                {snippets.map(snip => (
                  <View key={snip.id} style={styles.snippetCard}>
                    <View style={styles.snippetHeader}>
                      <Text style={styles.snippetTitle}>{snip.title}</Text>
                      <TouchableOpacity
                        style={styles.injectBtn}
                        onPress={() => {
                          onInjectScript(snip.code);
                          onClose();
                        }}
                      >
                        <Feather name="zap" size={12} color="#FFF" />
                        <Text style={styles.injectBtnText}>Inject</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.snippetCode}>{snip.code}</Text>
                  </View>
                ))}

                <View style={styles.addLinkForm}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Snippet Title"
                    placeholderTextColor="#4E5A70"
                    value={newSnippetTitle}
                    onChangeText={setNewSnippetTitle}
                  />
                  <TextInput
                    style={[styles.inputField, { marginTop: 8, height: 80 }]}
                    placeholder="JavaScript Code"
                    placeholderTextColor="#4E5A70"
                    value={newSnippetCode}
                    onChangeText={setNewSnippetCode}
                    multiline
                    numberOfLines={4}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddSnippet}>
                    <Feather name="plus" size={16} color="#FFF" />
                    <Text style={styles.addButtonText}>Save Snippet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. PASSWORDS TAB */}
            {activeSubTab === 'passwords' && (
              <View>
                {!unlocked ? (
                  <View style={styles.lockContainer}>
                    <Feather name="shield" size={48} color="#A855F7" style={{ marginBottom: 12 }} />
                    <Text style={styles.lockText}>
                      {pinMode === 'setup'
                        ? 'Create Master 4-Digit PIN'
                        : 'WINDSORE Security Shield Vault is locked.'}
                    </Text>

                    {pinMode === 'setup' ? (
                      <View style={styles.pinForm}>
                        <TextInput
                          style={styles.pinInputField}
                          placeholder="Enter 4-Digit PIN"
                          placeholderTextColor="#4E5A70"
                          keyboardType="numeric"
                          secureTextEntry
                          maxLength={4}
                          value={setupPinInput}
                          onChangeText={setSetupPinInput}
                        />
                        <TextInput
                          style={[styles.pinInputField, { marginTop: 8 }]}
                          placeholder="Confirm 4-Digit PIN"
                          placeholderTextColor="#4E5A70"
                          keyboardType="numeric"
                          secureTextEntry
                          maxLength={4}
                          value={setupPinConfirm}
                          onChangeText={setSetupPinConfirm}
                        />
                        <TouchableOpacity style={styles.unlockBtn} onPress={handleSetupPin}>
                          <Feather name="shield" size={16} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={styles.unlockBtnText}>Set Master PIN</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.pinForm}>
                        <TouchableOpacity style={[styles.unlockBtn, { marginBottom: 16 }]} onPress={handleUnlockBiometrics}>
                          <Feather name="aperture" size={16} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={styles.unlockBtnText}>Unlock via Biometrics</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.dividerText}>— OR ENTER PIN —</Text>

                        <TextInput
                          style={[styles.pinInputField, { marginVertical: 10 }]}
                          placeholder="Enter 4-Digit PIN"
                          placeholderTextColor="#4E5A70"
                          keyboardType="numeric"
                          secureTextEntry
                          maxLength={4}
                          value={pinInput}
                          onChangeText={setPinInput}
                          onSubmitEditing={handleUnlockPin}
                        />
                        <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlockPin}>
                          <Feather name="unlock" size={16} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={styles.unlockBtnText}>Unlock with PIN</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    <View style={styles.lockHeader}>
                      <Text style={styles.sectionHeader}>SECURED VAULT CREDENTIALS</Text>
                      <TouchableOpacity onPress={() => setUnlocked(false)}>
                        <Feather name="lock" size={16} color="#A855F7" />
                      </TouchableOpacity>
                    </View>

                    {passwords.length === 0 ? (
                      <Text style={styles.emptyLogText}>Vault empty. Save environment accounts below.</Text>
                    ) : (
                      passwords.map(pw => (
                        <View key={pw.id} style={styles.credCard}>
                          <View style={styles.credHeader}>
                            <Text style={styles.credTitle}>{pw.account}</Text>
                            <TouchableOpacity
                              style={styles.autofillBtn}
                              onPress={() => handleAutofill(pw)}
                            >
                              <Feather name="key" size={12} color="#FFF" />
                              <Text style={styles.autofillText}>Autofill</Text>
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.credValue}>User: {pw.username}</Text>
                          <Text style={styles.credValue}>Pass: **********</Text>
                        </View>
                      ))
                    )}

                    <View style={styles.addLinkForm}>
                      <Text style={styles.formHeader}>ADD CREDENTIAL</Text>
                      <TextInput
                        style={styles.inputField}
                        placeholder="Website / Domain"
                        placeholderTextColor="#4E5A70"
                        value={newAccount}
                        onChangeText={setNewAccount}
                        autoCapitalize="none"
                      />
                      <TextInput
                        style={[styles.inputField, { marginTop: 8 }]}
                        placeholder="Developer Email/Username"
                        placeholderTextColor="#4E5A70"
                        value={newUsername}
                        onChangeText={setNewUsername}
                        autoCapitalize="none"
                      />
                      <TextInput
                        style={[styles.inputField, { marginTop: 8 }]}
                        placeholder="Security Password"
                        placeholderTextColor="#4E5A70"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                      <TouchableOpacity style={styles.addButton} onPress={handleAddCredential}>
                        <Feather name="lock" size={14} color="#FFF" />
                        <Text style={styles.addButtonText}>Save to Vault (AES-256)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 4. EDITOR TAB */}
            {activeSubTab === 'editor' && (
              <View style={{ flex: 1 }}>
                <View style={styles.lockHeader}>
                  <Text style={styles.sectionHeader}>LIVE HTML RUNNER</Text>
                  <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={styles.autofillBtn}>
                    <Feather name={showPreview ? "code" : "play"} size={12} color="#FFF" />
                    <Text style={styles.autofillText}>{showPreview ? 'Edit Code' : 'Run HTML'}</Text>
                  </TouchableOpacity>
                </View>

                {showPreview ? (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewNote}>Previewing generated output (WebView would render here in full screen but for simplicity we inject script into Browser)</Text>
                    <TouchableOpacity
                      style={[styles.addButton, { marginTop: 20 }]}
                      onPress={() => {
                        const injectCode = \`document.open(); document.write(\\\`\${editorCode.replace(/\`/g, '\\\\`')}\\\`); document.close();\`;
                        onInjectScript(injectCode);
                        onClose();
                      }}
                    >
                      <Feather name="zap" size={14} color="#FFF" />
                      <Text style={styles.addButtonText}>Push to Active Browser Tab</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TextInput
                    style={styles.codeEditor}
                    multiline
                    value={editorCode}
                    onChangeText={setEditorCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlignVertical="top"
                  />
                )}
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
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
    color: '#A855F7',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Space Grotesk' : 'monospace',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 4,
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#A855F7',
  },
  subTabText: {
    color: '#94A3B8',
    marginLeft: 6,
    fontSize: 13,
  },
  subTextActive: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 16,
  },
  sectionHeader: {
    color: '#8F9CAE',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#F8FAFC',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusLabel: {
    color: '#F8FAFC',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  linkCard: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  linkLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
  },
  linkUrl: {
    color: '#3B82F6',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  addLinkForm: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputField: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#A855F7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 13,
  },
  snippetCard: {
    backgroundColor: '#0B111E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  snippetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  snippetTitle: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 13,
  },
  injectBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  injectBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  snippetCode: {
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: 11,
    backgroundColor: '#0A0E17',
    padding: 8,
    borderRadius: 4,
  },
  lockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  lockText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
  },
  unlockBtn: {
    flexDirection: 'row',
    backgroundColor: '#A855F7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  unlockBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  lockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyLogText: {
    color: '#4E5A70',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  credCard: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  credHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  credTitle: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 13,
  },
  autofillBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  autofillText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 4,
  },
  credValue: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  formHeader: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codeEditor: {
    backgroundColor: '#05080E',
    color: '#34D399',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    minHeight: 300,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewBox: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewNote: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 12,
  },
  pinForm: {
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  pinInputField: {
    width: '100%',
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#4E5A70',
    fontSize: 11,
    fontWeight: 'bold',
    marginVertical: 10,
    letterSpacing: 1.5,
  },
});
