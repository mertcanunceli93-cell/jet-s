import { Linking, Platform, Alert } from 'react-native';

/**
 * NavigationHelper
 * Handles deep linking to external navigation apps (Google Maps, Yandex)
 * Fallbacks to web versions if native apps are not installed.
 */
export const NavigationHelper = {
  /**
   * Opens Google Maps for navigation.
   * Tries to open the native app first, falls back to the web browser if not installed.
   *
   * @param lat Destination latitude
   * @param lon Destination longitude
   */
  openGoogleMaps: async (lat: number, lon: number) => {
    try {
      // Android intent deep link for direct navigation
      const androidUrl = `google.navigation:q=${lat},${lon}&mode=d`;
      // iOS / universal fallback link
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;

      if (Platform.OS === 'android') {
        const canOpen = await Linking.canOpenURL(androidUrl);
        if (canOpen) {
          await Linking.openURL(androidUrl);
          return;
        }
      } else {
        // iOS Google Maps URL Scheme
        const iosUrl = `comgooglemaps://?daddr=${lat},${lon}&directionsmode=driving`;
        const canOpen = await Linking.canOpenURL(iosUrl);
        if (canOpen) {
          await Linking.openURL(iosUrl);
          return;
        }
      }

      // Fallback to web browser if the app is not installed
      await Linking.openURL(fallbackUrl);
    } catch (error) {
      console.error('Google Maps açılırken hata oluştu:', error);
      Alert.alert('Hata', 'Navigasyon başlatılamadı. Lütfen tekrar deneyin.');
    }
  },

  /**
   * Opens Yandex Navigation.
   * Tries to open the native app first, falls back to Google Maps if Yandex is not installed.
   *
   * @param lat Destination latitude
   * @param lon Destination longitude
   */
  openYandexNavigation: async (lat: number, lon: number) => {
    try {
      const yandexUrl = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`;

      const canOpen = await Linking.canOpenURL(yandexUrl);
      if (canOpen) {
        await Linking.openURL(yandexUrl);
      } else {
        // Fallback to Google Maps if Yandex Navigation is not installed
        await NavigationHelper.openGoogleMaps(lat, lon);
      }
    } catch (error) {
      console.error('Yandex Navigasyon açılırken hata oluştu:', error);
      // Failsafe fallback
      await NavigationHelper.openGoogleMaps(lat, lon);
    }
  }
};
