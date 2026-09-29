import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParentHomeScreen } from '../parent/ParentHomeScreen';
import { ParentMessagesTab } from '../parent/ParentMessagesTab';
import { ParentCareTab } from '../parent/ParentCareTab';
import { ParentExploreTab } from '../parent/ParentExploreTab';
import { ParentProfileTab } from '../parent/ParentProfileTab';
import { colors, radii, shadows, spacing, typography } from '../theme';

export type ParentTabParamList = {
  Home: undefined;
  Messages: undefined;
  Care: undefined;
  Explore: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ParentTabParamList>();

export function ParentTabs(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 10);
  const tabHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Care':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              break;
            case 'Explore':
              iconName = focused ? 'sparkles' : 'sparkles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <View style={focused ? styles.activeIconContainer : null}>
              <Ionicons name={iconName} size={size || 22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={ParentHomeScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="Messages"
        component={ParentMessagesTab}
        options={{ tabBarLabel: 'Mesajlar' }}
      />
      <Tab.Screen
        name="Care"
        component={ParentCareTab}
        options={{ tabBarLabel: 'Bakım' }}
      />
      <Tab.Screen
        name="Explore"
        component={ParentExploreTab}
        options={{ tabBarLabel: 'Keşfet' }}
      />
      <Tab.Screen
        name="Profile"
        component={ParentProfileTab}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    paddingTop: 6,
    ...shadows.card,
  },
  tabBarLabel: {
    ...typography.tiny,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  activeIconContainer: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
});
