import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const MAX_RING_TIME = 59; // seconds
const PLAY_INTERVAL_HOURS = 24;

const GameScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#f5f5f5',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#fff' : '#000',
    accent: isDark ? '#00cfff' : '#1e90ff',
  };

  const [ringTime, setRingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [nextPlayIn, setNextPlayIn] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getLastPlayTime = async () => {
    const last = await AsyncStorage.getItem('lastGameTime');
    return last ? new Date(parseInt(last)) : null;
  };

  const updateNextPlayCountdown = async () => {
    const lastPlay = await getLastPlayTime();
    if (!lastPlay) {
      setCanPlay(true);
      return;
    }

    const now = new Date();
    const nextAllowed = new Date(lastPlay.getTime() + PLAY_INTERVAL_HOURS * 60 * 60 * 1000);

    if (now >= nextAllowed) {
      setCanPlay(true);
      setNextPlayIn('');
    } else {
      setCanPlay(false);
      const diff = nextAllowed.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setNextPlayIn(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  useEffect(() => {
    updateNextPlayCountdown();
    const timer = setInterval(updateNextPlayCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const startGame = async () => {
    if (!canPlay) return;

    setIsPlaying(true);
    setRingTime(0);

    intervalRef.current = setInterval(() => {
      setRingTime((prev) => {
        if (prev < MAX_RING_TIME) {
          return prev + 1;
        } else {
          stopGame();
          return prev;
        }
      });
    }, 1000);

    const now = Date.now();
    await AsyncStorage.setItem('lastGameTime', now.toString());
  };

  const stopGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    updateNextPlayCountdown();
    Alert.alert('Ring Complete', `Total Ring Time: ${ringTime} seconds`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>📞 Ring Game</Text>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>Ring Time</Text>
        <Text style={[styles.time, { color: theme.accent }]}>{ringTime}s</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.dialButton,
          { backgroundColor: canPlay ? theme.accent : '#999' },
        ]}
        onPress={startGame}
        disabled={!canPlay || isPlaying}
      >
        <Ionicons name="call" size={32} color="#fff" />
        <Text style={styles.dialText}>{canPlay ? 'Dial Now' : 'Come Back Later'}</Text>
      </TouchableOpacity>

      {!canPlay && (
        <Text style={[styles.countdown, { color: theme.text }]}>
          Next play in: {nextPlayIn}
        </Text>
      )}
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 30,
  },
  card: {
    width: '80%',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  time: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  dialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
  },
  dialText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 16,
    fontWeight: '500',
  },
});
