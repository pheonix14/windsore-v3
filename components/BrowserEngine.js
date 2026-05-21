import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import SafariUI_BottomBar from './SafariUI_BottomBar';

// Custom PC / Desktop User Agent
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
// Mobile User Agent fallback
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export default function BrowserEngine({
  url,
  onUrlChange,
  alwaysOnActive,
  onShowHelperTooltip,
  onOpenDevHub,
  onOpenHistory,
  onOpenSettings,
  passwordAutofillTrigger,
  onClearAutofill,
  selectedTabId,
  onAddToHistory,
  settings,
}) {
  const {
    selectedEngine = 0,
    selectedZoom = 3,
    selectedAgent = 0,
    privacyShields = true,
    doNotTrack = true,
    httpsUpgrade = true,
    blockThirdPartyCookies = false,
    blockPopups = true,
    safetyWarning = true,
    preventCrossSiteTracking = true,
    darkMode = true,
    forceDarkOnSites = false,
    nightFilter = false,
    showImages = true,
    readerMode = false,
    enableJS = true,
    cookiesEnabled = true,
    mediaAutoplay = false,
    webRTC = true,
    locationAccess = false,
    cameraAccess = false,
    micAccess = false,
    textBold = false,
    highContrast = false,
  } = settings || {};

  const [currentUrl, setCurrentUrl] = useState(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isPcMode, setIsPcMode] = useState(false);
  
  // Console state
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleInput, setConsoleInput] = useState('');
  
  const webViewRef = useRef(null);

  // Sync with prop-passed URL changes
  useEffect(() => {
    setCurrentUrl(url);
    setInputUrl(url);
  }, [url]);

  // Handle biometric/saved credentials autofill injection
  useEffect(() => {
    if (passwordAutofillTrigger && webViewRef.current) {
      console.log('[Autofill] Injecting credentials...');
      webViewRef.current.injectJavaScript(passwordAutofillTrigger);
      if (onClearAutofill) onClearAutofill();
    }
  }, [passwordAutofillTrigger]);

  // Navigate to target URL or search Query
  const navigateToUrl = (target) => {
    let cleanUrl = target.trim();
    if (!cleanUrl) return;

    if (cleanUrl.match(/^https?:\/\//i)) {
      // Force HTTPS if Always-On mode or HTTPS Upgrade is active
      if ((alwaysOnActive || httpsUpgrade) && cleanUrl.startsWith('http://')) {
        cleanUrl = cleanUrl.replace('http://', 'https://');
      }
    } else if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
      // Direct domain input
      cleanUrl = `https://${cleanUrl}`;
    } else {
      // Search query based on selected engine
      const engines = [
        'https://duckduckgo.com/?q=',
        'https://google.com/search?q=',
        'https://bing.com/search?q=',
        'https://search.yahoo.com/search?p=',
        'https://search.brave.com/search?q=',
        'https://www.ecosia.org/search?q=',
        'https://www.startpage.com/search?q='
      ];
      const engineUrl = engines[selectedEngine] || engines[0];
      cleanUrl = `${engineUrl}${encodeURIComponent(cleanUrl)}`;
    }
    
    setCurrentUrl(cleanUrl);
    setInputUrl(cleanUrl);
  };

  // Brave ad-blocker injection code
  const adBlockerScript = `
    (function() {
      const adSelectors = [
        'iframe[src*="doubleclick"]', 'iframe[src*="ad"]', 'div[class*="sponsored"]',
        'div[id*="sponsor"]', 'div[class*="ad-"]', 'div[id*="ad-"]', '.ad-box',
        'a[href*="/adclick"]', 'img[src*="adsense"]', '.google-ads', '#google-ads'
      ];
      const purge = () => {
        adSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
            el.remove();
          });
        });
      };
      purge();
      // Periodically scan for dynamic scripts (Via speed optimization)
      setInterval(purge, 1500);
    })();
  `;

  // Kiwi Console logging + window error hooks to bubble logs to native app
  const consoleOverrideScript = `
    (function() {
      const hookConsole = (method) => {
        const original = console[method];
        console[method] = function() {
          const args = Array.from(arguments).map(arg => {
            try {
              return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch(e) {
              return String(arg);
            }
          });
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CONSOLE',
            level: method,
            message: args.join(' ')
          }));
          if (original) original.apply(console, arguments);
        };
      };
      
      hookConsole('log');
      hookConsole('info');
      hookConsole('warn');
      hookConsole('error');

      window.onerror = function(message, source, lineno, colno, error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CONSOLE',
          level: 'error',
          message: message + ' (' + source + ':' + lineno + ')'
        }));
        return false;
      };
    })();
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CONSOLE') {
        const newLog = {
          id: Date.now() + Math.random().toString(),
          level: data.level,
          text: data.message,
          time: new Date().toLocaleTimeString(),
        };
        setConsoleLogs(prev => [newLog, ...prev].slice(0, 100)); // Cap logs at 100
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleExecuteJS = () => {
    if (!consoleInput.trim() || !webViewRef.current) return;
    const command = consoleInput.trim();
    webViewRef.current.injectJavaScript(`
      try {
        const result = eval(${JSON.stringify(command)});
        console.log("Evaluation Result: " + result);
      } catch (err) {
        console.error("Evaluation Error: " + err.message);
      }
    `);
    setConsoleLogs(prev => [
      {
        id: Date.now().toString(),
        level: 'eval',
        text: `> ${command}`,
        time: new Date().toLocaleTimeString(),
      },
      ...prev
    ]);
    setConsoleInput('');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: currentUrl,
        title: 'WINDSORE Web Browser',
      });
    } catch (error) {
      console.warn('Share error:', error.message);
    }
  };

  const getActiveUserAgent = () => {
    if (isPcMode) return DESKTOP_UA;
    const userAgents = [
      '',
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    ];
    return userAgents[selectedAgent] || MOBILE_UA;
  };

  const getRunAfterLoadScript = () => {
    let script = '';
    if (alwaysOnActive || privacyShields) {
      script += adBlockerScript + '\n';
    }
    
    let cssRules = '';
    if (forceDarkOnSites) {
      cssRules += 'html { filter: invert(1) hue-rotate(180deg) !important; } img, video, iframe { filter: invert(1) hue-rotate(180deg) !important; } ';
    }
    if (!showImages) {
      cssRules += 'img, image, [style*="background-image"] { display: none !important; content-visibility: hidden !important; } ';
    }
    if (textBold) {
      cssRules += '* { font-weight: 700 !important; } ';
    }
    if (highContrast) {
      cssRules += '* { text-shadow: none !important; } ';
    }

    if (cssRules) {
      script += `
        (function() {
          const style = document.createElement('style');
          style.id = 'windsore-custom-style';
          style.innerHTML = ${JSON.stringify(cssRules)};
          document.head.appendChild(style);
        })();
      `;
    }
    return script;
  };

  const zoomPercentages = [50, 75, 90, 100, 110, 125, 150, 200];
  const activeZoom = zoomPercentages[selectedZoom] || 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Navigation / Address Dock */}
        <View style={styles.headerDock}>
          <TextInput
            style={styles.addressBar}
            value={inputUrl}
            onChangeText={setInputUrl}
            onSubmitEditing={() => navigateToUrl(inputUrl)}
            placeholder="Search or enter URL"
            placeholderTextColor="#8F9CAE"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
          />

          <View style={styles.headerActions}>
            {/* PC Mode Switcher */}
            <TouchableOpacity
              style={[styles.headerButton, isPcMode && styles.headerButtonActive]}
              onPress={() => setIsPcMode(!isPcMode)}
              onLongPress={() => onShowHelperTooltip('PC Mode', 'Toggle between Desktop User-Agent/Viewport and Mobile format.')}
              delayLongPress={500}
            >
              <Feather name="monitor" size={18} color={isPcMode ? '#A855F7' : '#94A3B8'} />
            </TouchableOpacity>

            {/* Reload Button */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => webViewRef.current?.reload()}
              onLongPress={() => onShowHelperTooltip('Reload', 'Refresh current webpage.')}
              delayLongPress={500}
            >
              <Feather name="rotate-cw" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Core WebView container */}
        <View style={styles.webContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            userAgent={getActiveUserAgent()}
            injectedJavaScriptBeforeContentLoaded={consoleOverrideScript}
            injectedJavaScript={getRunAfterLoadScript()}
            onMessage={handleMessage}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
              setCanGoForward(navState.canGoForward);
              setCurrentUrl(navState.url);
              setInputUrl(navState.url);
              if (onUrlChange) onUrlChange(navState.url);
              if (onAddToHistory && navState.url) onAddToHistory(navState.url, navState.title);
            }}
            style={styles.webview}
            scalesPageToFit={isPcMode}
            domStorageEnabled={cookiesEnabled}
            javaScriptEnabled={enableJS}
            allowsFullscreenVideo
            geolocationEnabled={locationAccess}
            mixedContentMode="always"
            textZoom={activeZoom}
            thirdPartyCookiesEnabled={cookiesEnabled && !blockThirdPartyCookies}
            mediaPlaybackRequiresUserAction={!mediaAutoplay}
          />

          {/* Night Filter Orange Tint Overlay */}
          {nightFilter && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: 'rgba(230, 120, 0, 0.12)', zIndex: 100 }
              ]}
            />
          )}

          {/* Interactive sliding Web Developer Console Drawer */}
          {showConsole && (
            <View style={styles.consoleContainer}>
              <View style={styles.consoleHeader}>
                <Text style={styles.consoleTitle}>DEVELOPER CONSOLE</Text>
                <View style={styles.consoleControls}>
                  <TouchableOpacity onPress={() => setConsoleLogs([])} style={styles.consoleIconBtn}>
                    <Feather name="trash-2" size={14} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowConsole(false)} style={styles.consoleIconBtn}>
                    <Feather name="x" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.consoleLogsScroll} contentContainerStyle={styles.consoleLogsContent}>
                {consoleLogs.length === 0 ? (
                  <Text style={styles.emptyLogText}>No console inputs. Execute js expressions below.</Text>
                ) : (
                  consoleLogs.map((log) => {
                    let logColor = '#E2E8F0';
                    if (log.level === 'error') logColor = '#EF4444';
                    if (log.level === 'warn') logColor = '#F59E0B';
                    if (log.level === 'eval') logColor = '#3B82F6';
                    return (
                      <View key={log.id} style={styles.logLine}>
                        <Text style={styles.logTime}>[{log.time}]</Text>
                        <Text style={[styles.logText, { color: logColor }]}>{log.text}</Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.consoleInputRow}>
                <TextInput
                  style={styles.consoleInput}
                  value={consoleInput}
                  onChangeText={setConsoleInput}
                  onSubmitEditing={handleExecuteJS}
                  placeholder="document.title"
                  placeholderTextColor="#4E5A70"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={handleExecuteJS} style={styles.consoleSendBtn}>
                  <Feather name="corner-down-left" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Custom Safari UI Dock */}
        <SafariUI_BottomBar
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onGoBack={() => webViewRef.current?.goBack()}
          onGoForward={() => webViewRef.current?.goForward()}
          onOpenShare={handleShare}
          onOpenTabs={() => setShowConsole(!showConsole)} // Overload Safari tab key to toggle the dev console
          onOpenDevHub={onOpenDevHub}
          onOpenHistory={onOpenHistory}
          onOpenSettings={onOpenSettings}
          alwaysOnActive={alwaysOnActive}
          onShowHelperTooltip={onShowHelperTooltip}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  keyboardContainer: {
    flex: 1,
  },
  headerDock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  addressBar: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 4,
    backgroundColor: '#1E293B',
  },
  headerButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  webContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: 55, // Account for Safari bottom bar
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  consoleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(5, 8, 16, 0.95)',
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    zIndex: 99,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0B111E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  consoleTitle: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  consoleControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consoleIconBtn: {
    marginLeft: 12,
    padding: 4,
  },
  consoleLogsScroll: {
    flex: 1,
  },
  consoleLogsContent: {
    padding: 10,
  },
  emptyLogText: {
    color: '#4E5A70',
    fontFamily: 'monospace',
    fontSize: 11,
    fontStyle: 'italic',
  },
  logLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  logTime: {
    color: '#3B82F6',
    fontFamily: 'monospace',
    fontSize: 10,
    marginRight: 6,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 11,
    flex: 1,
    flexWrap: 'wrap',
  },
  consoleInputRow: {
    flexDirection: 'row',
    backgroundColor: '#0A0E17',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  consoleInput: {
    flex: 1,
    color: '#10B981',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  consoleSendBtn: {
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    padding: 6,
    borderRadius: 6,
  },
});
