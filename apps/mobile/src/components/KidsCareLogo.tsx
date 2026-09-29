import { Image, StyleSheet, View } from 'react-native';

export type KidsCareLogoVariant = 'horizontal' | 'full' | 'icon';

interface KidsCareLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: KidsCareLogoVariant;
}

const LOGO_HORIZONTAL = require('../../assets/brand/kidscare-logo-horizontal.png');
const LOGO_FULL = require('../../assets/brand/kidscare-logo-full.png');
const LOGO_ICON = require('../../assets/brand/kidscare-icon.png');

export function KidsCareLogo({
  size = 'md',
  variant = 'horizontal',
}: KidsCareLogoProps): React.ReactElement {
  const getDimensions = () => {
    if (variant === 'icon') {
      switch (size) {
        case 'sm':
          return { width: 36, height: 36 };
        case 'md':
          return { width: 48, height: 48 };
        case 'lg':
          return { width: 64, height: 64 };
        case 'xl':
          return { width: 80, height: 80 };
      }
    }
    if (variant === 'full') {
      switch (size) {
        case 'sm':
          return { width: 120, height: 45 };
        case 'md':
          return { width: 160, height: 60 };
        case 'lg':
          return { width: 220, height: 85 };
        case 'xl':
          return { width: 280, height: 110 };
      }
    }
    // horizontal (default)
    switch (size) {
      case 'sm':
        return { width: 110, height: 32 };
      case 'md':
        return { width: 150, height: 44 };
      case 'lg':
        return { width: 200, height: 58 };
      case 'xl':
        return { width: 260, height: 76 };
    }
  };

  const dim = getDimensions();
  const source =
    variant === 'icon' ? LOGO_ICON : variant === 'full' ? LOGO_FULL : LOGO_HORIZONTAL;

  return (
    <View style={styles.container}>
      <Image source={source} style={dim} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
