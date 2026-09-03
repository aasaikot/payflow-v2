import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<{ available: boolean; reason?: string }> {
  if (!Capacitor.isNativePlatform()) return { available: false };
  try {
    const result = await NativeBiometric.isAvailable();
    return { available: result.isAvailable };
  } catch (e) { return { available: false }; }
}

export async function registerBiometrics(uid: string, email: string): Promise<{ success: boolean; secretToken: string; message: string }> {
  try {
    // 1. Force strict biometric prompt for enrollment
    await NativeBiometric.verifyIdentity({
      reason: "ফিঙ্গারপ্রিন্ট এনক্রিপ্ট করার জন্য আসল আঙুলটি স্ক্যান করুন",
      title: "Secure Enrollment",
    });

    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    const secretToken = Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');

    // 2. Store in Hardware Vault with a new unique server key
    await NativeBiometric.setCredentials({
      username: `${uid}|${email}`,
      password: secretToken,
      server: 'payflow_auth_final'
    });

    return { success: true, secretToken, message: 'সফল!' };
  } catch (error: any) {
    return { success: false, secretToken: '', message: 'ব্যর্থ হয়েছে।' };
  }
}

export async function authenticateWithBiometrics(): Promise<{ success: boolean; email?: string; uid?: string; secretToken?: string; message: string }> {
  try {
    // 1. EXPLICITLY ask for biometric verification every time
    // This prevents instant login and ensures physical scanning
    await NativeBiometric.verifyIdentity({
      reason: "লগইন করতে আপনার ফিঙ্গারপ্রিন্ট স্ক্যান করুন",
      title: "PayFlow Secure Login",
    });

    // 2. Only if verified, retrieve credentials from hardware
    const creds = await NativeBiometric.getCredentials({
      server: 'payflow_auth_final'
    });

    if (creds && creds.password && creds.username) {
      const [uid, email] = creds.username.split('|');
      return { success: true, uid, email, secretToken: creds.password, message: 'Verified' };
    }
    return { success: false, message: 'ডাটা পাওয়া যায়নি।' };
  } catch (error: any) {
    return { success: false, message: 'ভেরিফিকেশন ব্যর্থ হয়েছে বা বাতিল করা হয়েছে।' };
  }
}

export function isBiometricRegisteredForUser(): boolean {
    return true;
}

export function removeBiometricForUser(): void {
  NativeBiometric.deleteCredentials({ server: 'payflow_auth_final' });
}

export function isInIFrame() { return false; }
export function saveBiometricDirectly() { return { success: true }; }
export function getSavedBiometricCredentials() { return [{}]; }
export function getLastBiometricUser() { return null; }
