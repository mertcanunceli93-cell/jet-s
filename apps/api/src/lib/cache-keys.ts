export const cacheKeys = {
  distance: (fromLat: number, fromLng: number, toLat: number, toLng: number) =>
    `distance:${fromLat}:${fromLng}:${toLat}:${toLng}`,
  pricingRules: (vehicleType: string, deliveryType: string) =>
    `pricing-rule:${vehicleType}:${deliveryType}`,
  settings: (key: string) => `settings:${key}`,
  surgeActive: (time: string, day: string) => `surge:${time}:${day}`,
  weatherActive: (condition: string) => `weather:${condition || 'ANY'}`,
  zonesActive: () => 'zones:active',
};
