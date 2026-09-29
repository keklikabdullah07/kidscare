import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudentsScreen } from '../students/StudentsScreen';
import { StaffTrackingTab } from '../staff/StaffTrackingTab';
import { StaffCareTab } from '../staff/StaffCareTab';
import { StaffMessagesTab } from '../staff/StaffMessagesTab';
import { StaffMoreTab } from '../staff/StaffMoreTab';
import { colors, radii, shadows, spacing, typography } from '../theme';

export type StaffTabParamList = {
  Students: undefined;
  Tracking: undefined;
  Care: undefined;
  Messages: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<StaffTabParamList>();

export function StaffTabs(): React.ReactElement {
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
            case 'Students':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Tracking':
              iconName = focused ? 'clipboard' : 'clipboard-outline';
              break;
            case 'Care':
              iconName = focused ? 'medkit' : 'medkit-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'More':
              iconName = focused ? 'grid' : 'grid-outline';
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
        name="Students"
        component={StudentsScreen}
        options={{ tabBarLabel: 'Öğrenciler' }}
      />
      <Tab.Screen
        name="Tracking"
        component={StaffTrackingTab}
        options={{ tabBarLabel: 'Akış' }}
      />
      <Tab.Screen
        name="Care"
        component={StaffCareTab}
        options={{ tabBarLabel: 'Sağlık' }}
      />
      <Tab.Screen
        name="Messages"
        component={StaffMessagesTab}
        options={{ tabBarLabel: 'İletişim' }}
      />
      <Tab.Screen
        name="More"
        component={StaffMoreTab}
        options={{ tabBarLabel: 'Yönetim' }}
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
