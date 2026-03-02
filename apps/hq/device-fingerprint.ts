function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  const characteristics = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency,
    (navigator as any).deviceMemory,
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < characteristics.length; i++) {
    const char = characteristics.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36).substring(0, 8);
}

export function generateDeviceId(): string {
  if (typeof window === 'undefined') return '';

  const storageKey = 'kolbo_device_id';
  const versionKey = 'kolbo_device_v';
  const currentVersion = '2';
  
  const existing = localStorage.getItem(storageKey);
  const existingVersion = localStorage.getItem(versionKey);
  const browserFingerprint = generateBrowserFingerprint();
  
  if (existing && existingVersion === currentVersion && existing.includes(browserFingerprint)) {
    return existing;
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const deviceId = `device_${browserFingerprint}_${timestamp}_${random}`;
  
  try {
    localStorage.setItem(storageKey, deviceId);
    localStorage.setItem(versionKey, currentVersion);
  } catch {
    // localStorage unavailable (e.g. private browsing)
  }

  return deviceId;
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Server',
      deviceType: 'server',
    };
  }

  const ua = navigator.userAgent;
  const isMobile = /mobile/i.test(ua);
  const isTablet = /tablet|ipad/i.test(ua);
  
  let deviceType = 'desktop';
  if (isMobile) deviceType = 'mobile';
  if (isTablet) deviceType = 'tablet';

  const deviceName = ua.substring(0, 50);

  return {
    deviceName,
    deviceType,
  };
}

export function clearDeviceId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kolbo_device_id');
  localStorage.removeItem('kolbo_device_v');
}

export function getCurrentDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kolbo_device_id');
}
