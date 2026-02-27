// navigation/BottomTabs.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';

import GameScreen from '../screens/GameScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StakingScreen from '../screens/StakingScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0ea5a4',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Game':
              iconName = 'game-controller-outline';
              break;
            case 'Staking':
              iconName = 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = 'person-circle-outline';
              break;
          }

          // Example badge on Game tab
          const showBadge = route.name === 'Game';

          return (
            <View>
              <Ionicons name={iconName as any} size={size} color={color} />
              {showBadge && (
                <View
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -6,
                    backgroundColor: 'red',
                    borderRadius: 8,
                    width: 12,
                    height: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 8 }}>!</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Game" component={GameScreen} />
      <Tab.Screen name="Staking" component={StakingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
