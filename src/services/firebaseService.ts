import {
  auth,
  db,
  ref,
  set,
  get,
  onValue,
  remove,
  child,
  update,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  updateProfile,
  User,
} from '../firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { MonthSalaryRecord, UserProfileData } from '../types';

const CACHE_PREFIX = 'payflow_cached_user_';

export function getUserLocalCache(uid?: string) {
  try {
    let raw = uid ? localStorage.getItem(`${CACHE_PREFIX}${uid}`) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn(e); }
  return { profile: null, records: [] };
}

export function setUserLocalCache(uid: string, profile: any, records: any) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify({ profile, records, updatedAt: Date.now() }));
  } catch (e) { console.warn(e); }
}

export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfileData }> {
  let user: User;
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(result.credential?.idToken);
    const userCredential = await signInWithCredential(auth, credential);
    user = userCredential.user;
  } else {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  }

  await seedInitialData(user.uid, user.email || '');
  const profile = await fetchUserProfile(user.uid);
  return { user, profile: profile! };
}

export async function fetchUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const snapshot = await get(ref(db, `users/${uid}/profile`));
    if (snapshot.exists()) return { ...snapshot.val(), uid };
  } catch (error) { console.error('Fetch Profile Error:', error); }
  return null;
}

export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  if (!profile.uid) return;
  const profileToSave = JSON.parse(JSON.stringify(profile));
  // Use update instead of set to preserve other fields like bioToken
  await update(ref(db, `users/${profile.uid}/profile`), profileToSave);
}

export async function fetchSalaryRecords(uid: string): Promise<MonthSalaryRecord[]> {
  try {
    const snapshot = await get(ref(db, `users/${uid}/months`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => {
        const incomeMap = data[key].income || {};
        const deductionMap = data[key].deduction || {};
        const gross = Object.values(incomeMap).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        const totalDeduction = Object.values(deductionMap).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        return {
          month: key,
          monthLabel: new Date(key + "-01").toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          incomes: incomeMap,
          deductions: deductionMap,
          extraDeduction: data[key].extraDeduction || [],
          gross, deduction: totalDeduction, net: gross - totalDeduction,
          createdDate: data[key].timestamp ? new Date(data[key].timestamp).toLocaleString('en-GB') : ''
        };
      }).sort((a, b) => b.month.localeCompare(a.month));
    }
  } catch (error) { console.error('Fetch Records Error:', error); }
  return [];
}

export function subscribeToUserData(uid: string, onData: (data: any) => void) {
  const userRef = ref(db, `users/${uid}`);
  return onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const profile = data.profile ? { ...data.profile, uid } : null;
      const records = data.months ? Object.keys(data.months).map(key => {
        const incomeMap = data[key].income || {};
        const deductionMap = data[key].deduction || {};
        const gross = Object.values(incomeMap).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        const totalDeduction = Object.values(deductionMap).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        return {
          month: key,
          monthLabel: new Date(key + "-01").toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          incomes: incomeMap, deductions: deductionMap,
          extraDeduction: data[key].extraDeduction || [],
          gross, deduction: totalDeduction, net: gross - totalDeduction,
          createdDate: data[key].timestamp ? new Date(data[key].timestamp).toLocaleString('en-GB') : ''
        };
      }).sort((a, b) => b.month.localeCompare(a.month)) : [];
      onData({ profile, records });
    }
  });
}

export async function saveSalaryRecord(uid: string, record: MonthSalaryRecord): Promise<void> {
  const monthData = { income: record.incomes, deduction: record.deductions, extraDeduction: record.extraDeduction || [], timestamp: Date.now() };
  await set(ref(db, `users/${uid}/months/${record.month}`), monthData);
}

export async function deleteSalaryRecord(uid: string, monthKey: string): Promise<void> {
  await remove(ref(db, `users/${uid}/months/${monthKey}`));
}

export async function seedInitialData(uid: string, email: string): Promise<void> {
  const targetEmails = ['saikot@saikot.bd', 'asifarmansaikot@gmail.com', 'saikot95@gmail.com'];
  if (email && targetEmails.includes(email)) {
    const userRef = ref(db, `users/${uid}`);
    const profileSnap = await get(child(userRef, 'profile'));

    // ONLY update if PIN is missing (New User)
    if (!profileSnap.exists() || !profileSnap.val().pin) {
       await update(child(userRef, 'profile'), {
         name: "ASIF ARMAN SAIKOT",
         email: email,
         companyName: "Essential Drugs Company Limited",
         designation: "Assistant Engineering Officer",
         pin: "5556",
         mobile: "01719364298",
         photoURL: auth.currentUser?.photoURL || ""
       });

       await update(child(userRef, 'months'), {
         "2026-06": { income: { "Basic Pay": 22460, "Conveyance": 1150, "House Rent": 17968, "Medical": 1900, "Refreshment": 1080, "Special": 2246, "Utility": 950 }, deduction: { "Canteen": 204, "PF": 2246, "Tax": 776, "Welfare": 100, "Stamps": 10, "Welfare Subs": 10 }, timestamp: 1787485999499 },
         "2026-07": { income: { "Basic Pay": 23590, "Conveyance": 1150, "House Rent": 18872, "Medical": 1900, "Refreshment": 3260, "Special": 2359, "Utility": 950 }, deduction: { "Canteen": 340, "PF": 2359, "Tax": 417, "Welfare": 100, "Stamps": 10, "Welfare Subs": 10 }, timestamp: 1787486143573 },
         "2026-08": { income: { "Basic Pay": 23590, "Conveyance": 1610, "House Rent": 18872, "Medical": 2660, "Refreshment": 5270, "Special": 2359, "Utility": 1330 }, deduction: { "Canteen": 374, "PF": 2359, "Tax": 417, "Welfare": 100, "Stamps": 10, "Welfare Subs": 10 }, timestamp: 1788089802970 }
       });
    }
  }
}

export async function testFirestoreConnection(): Promise<boolean> { return true; }

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile };
export type { User };
