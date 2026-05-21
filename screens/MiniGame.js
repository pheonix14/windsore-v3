import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MiniGame({ isVisible, onClose }) {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'terminal', 'runner'
  
  // Hacking Terminal states
  const [terminalHistory, setTerminalHistory] = useState([
    'WINDSORE SECURE V2.0.0 CORE INITIALIZED...',
    'TYPE "help" TO SEE AVAILABLE COMMANDS.',
    'PHEONIX14 DECRYPTION DECK ONLINE.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Phoenix Runner game states
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phoenixY, setPhoenixY] = useState(150);
  const [obstacleX, setObstacleX] = useState(width - 50);
  const [obstacleHeight, setObstacleHeight] = useState(80);
  
  const gameLoopRef = useRef(null);
  const phoenixVelocity = useRef(0);

  // Terminal Hacking input parser
  const handleTerminalSubmit = () => {
    const cmd = terminalInput.trim().toLowerCase();
    let response = '';
    
    if (cmd === 'help') {
      response = [
        'Available Commands:',
        '  sysinfo  - Display Awake Folder system state.',
        '  decrypt  - Start firewall codebreaker sequence.',
        '  clear    - Clear terminal logs.',
        '  runner   - Switch to Phoenix Runner game.',
        '  exit     - Close hacker console.'
      ].join('\n');
    } else if (cmd === 'sysinfo') {
      response = [
        '--- SYSTEM OVERVIEW ---',
        'Model: WINDSORE Android',
        'Kernel: Xtreeme Project Core v2.4.1',
        'Network Proxy: ALWAYS-ON SecureTunnel',
        'Integrations: Vercel, Render, GitHub APIs Connected',
        'Owner: PHEONIX14'
      ].join('\n');
    } else if (cmd === 'decrypt') {
      const code = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
      response = `[BREAKER] Scanning firewalls... Code Hash: [${code}]. System unlocked. ACCESS GRANTED.`;
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (cmd === 'runner') {
      setGameMode('runner');
      setTerminalInput('');
      return;
    } else if (cmd === 'exit') {
      onClose();
      setTerminalInput('');
      return;
    } else {
      response = `Command "${cmd}" not recognized. Type "help" for a list of deck instructions.`;
    }

    setTerminalHistory(prev => [...prev, `> ${terminalInput}`, response]);
    setTerminalInput('');
  };

  // Phoenix Runner Physics
  useEffect(() => {
    if (gameMode === 'runner' && isPlaying) {
      gameLoopRef.current = setInterval(() => {
        // Gravity
        phoenixVelocity.current += 1.5;
        setPhoenixY(y => {
          const nextY = y + phoenixVelocity.current;
          // Collide with ground (220)
          if (nextY > 220) {
            phoenixVelocity.current = 0;
            return 220;
          }
          // Collide with roof (20)
          if (nextY < 20) {
            phoenixVelocity.current = 0;
            return 20;
          }
          return nextY;
        });

        // Obstacle movement
        setObstacleX(x => {
          const nextX = x - 8;
          if (nextX < -30) {
            setScore(s => s + 1);
            setObstacleHeight(50 + Math.random() * 80);
            return width - 50;
          }
          return nextX;
        });
      }, 30);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameMode, isPlaying]);

  // Phoenix jump
  const handleJump = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setScore(0);
      setObstacleX(width - 50);
      setPhoenixY(150);
      phoenixVelocity.current = -12;
    } else {
      phoenixVelocity.current = -12;
    }
  };

  // Collision detection
  useEffect(() => {
    if (gameMode === 'runner' && isPlaying) {
      // Phoenix is around X: 60, width: 30, height: 30
      // Obstacle is around obstacleX, width: 25, height: obstacleHeight, starts from bottom (250 - obstacleHeight)
      const phoenixBottom = phoenixY + 30;
      const obstacleTop = 250 - obstacleHeight;
      
      if (obstacleX < 90 && obstacleX > 30) {
        if (phoenixBottom >= obstacleTop) {
          // Hit! Game over
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
          }
          Alert.alert('System Crash', `Phoenix fell! Score: ${score}`);
        }
      }
    }
  }, [phoenixY, obstacleX, isPlaying]);

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Feather name="command" size={18} color="#10B981" />
              <Text style={styles.titleText}>WINDSORE ACCESS DECK</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* 1. MAIN MENU */}
          {gameMode === 'menu' && (
            <View style={styles.menuContainer}>
              <Text style={styles.menuHeadline}>CHOOSE INTERFACE</Text>
              
              <TouchableOpacity style={styles.menuBtn} onPress={() => setGameMode('terminal')}>
                <Feather name="terminal" size={18} color="#10B981" style={{ marginRight: 10 }} />
                <Text style={styles.menuBtnText}>Hacker Terminal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => setGameMode('runner')}>
                <Feather name="wind" size={18} color="#A855F7" style={{ marginRight: 10 }} />
                <Text style={styles.menuBtnText}>Phoenix Cyber Runner</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 2. TERMINAL HACK */}
          {gameMode === 'terminal' && (
            <View style={styles.terminalContainer}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setGameMode('menu')}>
                <Feather name="arrow-left" size={14} color="#10B981" />
                <Text style={styles.backBtnText}>Menu</Text>
              </TouchableOpacity>
              
              <ScrollView style={styles.terminalLog}>
                {terminalHistory.map((line, idx) => (
                  <Text key={idx} style={styles.terminalText}>{line}</Text>
                ))}
              </ScrollView>

              <View style={styles.inputContainer}>
                <Text style={styles.prompt}>$</Text>
                <TextInput
                  style={styles.terminalInput}
                  value={terminalInput}
                  onChangeText={setTerminalInput}
                  onSubmitEditing={handleTerminalSubmit}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter command..."
                  placeholderTextColor="#065F46"
                />
              </View>
            </View>
          )}

          {/* 3. PHOENIX RUNNER */}
          {gameMode === 'runner' && (
            <View style={styles.runnerContainer}>
              <View style={styles.runnerHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setGameMode('menu')}>
                  <Feather name="arrow-left" size={14} color="#A855F7" />
                  <Text style={[styles.backBtnText, { color: '#A855F7' }]}>Menu</Text>
                </TouchableOpacity>
                <Text style={styles.scoreText}>SCORE: {score} | BEST: {highScore}</Text>
              </View>

              {/* Game Area */}
              <TouchableOpacity activeOpacity={0.9} style={styles.gameArea} onPress={handleJump}>
                {/* Sky / Phoenix */}
                <View style={[styles.phoenix, { top: phoenixY }]}>
                  <Feather name="zap" size={24} color="#A855F7" />
                </View>

                {/* Obstacle */}
                <View style={[
                  styles.obstacle,
                  { left: obstacleX, height: obstacleHeight, top: 250 - obstacleHeight }
                ]} />

                {/* Ground */}
                <View style={styles.ground} />
                
                {!isPlaying && (
                  <View style={styles.startOverlay}>
                    <Text style={styles.startText}>TAP SCREEN TO FLY</Text>
                    <Text style={styles.subStartText}>Avoid cyber wall blockers</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '90%',
    height: '60%',
    backgroundColor: '#05080E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B111E',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
    fontSize: 12,
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuHeadline: {
    color: '#8F9CAE',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    width: '80%',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuBtnText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  terminalContainer: {
    flex: 1,
    padding: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtnText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 6,
  },
  terminalLog: {
    flex: 1,
    backgroundColor: '#020408',
    borderRadius: 6,
    padding: 8,
  },
  terminalText: {
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020408',
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  prompt: {
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: 14,
    marginRight: 6,
  },
  terminalInput: {
    flex: 1,
    color: '#34D399',
    fontFamily: 'monospace',
    fontSize: 13,
    paddingVertical: 6,
  },
  runnerContainer: {
    flex: 1,
    padding: 12,
  },
  runnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    color: '#A855F7',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#0A0714',
    borderWidth: 1,
    borderColor: '#A855F7',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  phoenix: {
    position: 'absolute',
    left: 60,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obstacle: {
    position: 'absolute',
    width: 25,
    backgroundColor: '#E11D48',
    borderRadius: 4,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#A855F7',
  },
  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,7,20,0.7)',
  },
  startText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 2,
  },
  subStartText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
});
