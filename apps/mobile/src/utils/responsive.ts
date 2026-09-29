import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

// Base guideline dimensions (iPhone 13 / 14 / modern standard viewport)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

/**
 * Scale horizontal size based on current screen width
 */
export function scale(size: number, screenWidth: number = Dimensions.get('window').width): number {
  return Math.round(PixelRatio.roundToNearestPixel((screenWidth / BASE_WIDTH) * size));
}

/**
 * Scale vertical size based on current screen height
 */
export function verticalScale(size: number, screenHeight: number = Dimensions.get('window').height): number {
  return Math.round(PixelRatio.roundToNearestPixel((screenHeight / BASE_HEIGHT) * size));
}

/**
 * Moderate scale with dampening factor (default 0.5) so fonts/icons don't scale too aggressively
 */
export function moderateScale(
  size: number,
  factor = 0.5,
  screenWidth: number = Dimensions.get('window').width,
): number {
  const scaled = (screenWidth / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(size + (scaled - size) * factor));
}

/**
 * Responsive font size helper that clamps to readable ranges
 */
export function responsiveFont(
  size: number,
  minSize = size * 0.85,
  maxSize = size * 1.25,
  screenWidth: number = Dimensions.get('window').width,
): number {
  const scaled = moderateScale(size, 0.4, screenWidth);
  return Math.min(Math.max(scaled, minSize), maxSize);
}

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallPhone: boolean; // < 375px
  isMediumPhone: boolean; // 375px - 430px
  isLargePhone: boolean; // 430px - 768px
  isTablet: boolean; // >= 768px
  isLandscape: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  font: (size: number, min?: number, max?: number) => number;
}

/**
 * Hook to dynamically react to screen size changes, rotation, split-screen, or tablet view
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 375;
  const isMediumPhone = width >= 375 && width < 430;
  const isLargePhone = width >= 430 && width < 768;
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const contentMaxWidth = isTablet ? 720 : isLandscape ? 680 : 540;
  const horizontalPadding = isSmallPhone ? 12 : isTablet ? 24 : 16;

  return {
    width,
    height,
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    isTablet,
    isLandscape,
    contentMaxWidth,
    horizontalPadding,
    scale: (s: number) => scale(s, width),
    verticalScale: (s: number) => verticalScale(s, height),
    moderateScale: (s: number, factor = 0.5) => moderateScale(s, factor, width),
    font: (s: number, min?: number, max?: number) => responsiveFont(s, min, max, width),
  };
}
