import React, { useState, useEffect, useRef } from "react";
import { LoginView } from "./components/LoginView";
import { RegisterView } from "./components/RegisterView";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { AndroidFrame } from "./components/AndroidFrame";
import { FlutterCodeViewer } from "./components/FlutterCodeViewer";
import { DashboardView } from "./components/DashboardView";
import { SalaryHistoryView } from "./components/SalaryHistoryView";
import { SalaryDetailsView } from "./components/SalaryDetailsView";
import { ComparisonView } from "./components/ComparisonView";
import { AddSalaryView } from "./components/AddSalaryView";
import { ReportsView } from "./components/ReportsView";
import { ProfileView } from "./components/ProfileView";
import { BottomNavBar } from "./components/BottomNavBar";
import { SplashScreen } from "./components/SplashScreen";
import { ScreenType, MonthSalaryRecord, UserProfileData } from "./types";
import {
  auth,
  signOut,
  onAuthStateChanged,
  fetchUserProfile,
  saveUserProfile,
  fetchSalaryRecords,
  saveSalaryRecord,
  deleteSalaryRecord,
  seedInitialData,
  testFirestoreConnection,
  subscribeToUserData,
} from "./services/firebaseService";
import { isBiometricRegisteredForUser } from "./services/biometricService";
import {
  Smartphone,
  Code,
  CheckCircle,
  LogOut,
  Cloud,
  Loader2,
} from "lucide-react";
import {
  NotificationItem,
  INITIAL_NOTIFICATIONS,
} from "./components/NotificationModal";

const NOTIFICATIONS_STORAGE_KEY = "payflow_notifications_v1";

const getStoredNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load notifications from localStorage", e);
  }
  return INITIAL_NOTIFICATIONS;
};

const BLANK_USER_PROFILE: UserProfileData = {
  uid: "",
  name: "",
  email: "",
  companyName: "",
  designation: "",
  pin: "",
  mobile: "",
  joinDate: "",
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("login");
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(["login"]);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState("2026-08");
  const [editSalaryMonth, setEditSalaryMonth] = useState<string | null>(null);
  const [salaryRecords, setSalaryRecords] = useState<MonthSalaryRecord[]>([]);
  const [userProfile, setUserProfile] =
    useState<UserProfileData>(BLANK_USER_PROFILE);
  const [currentUid, setCurrentUid] = useState<string>("");
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStoredNotifications(),
  );

  // 1. Splash Screen & Global Loading Animation State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const screenHistoryRef = useRef<ScreenType[]>(screenHistory);

  useEffect(() => {
    screenHistoryRef.current = screenHistory;
  }, [screenHistory]);

  const handleUpdateNotifications = (
    updater:
      | NotificationItem[]
      | ((prev: NotificationItem[]) => NotificationItem[]),
  ) => {
    setNotifications((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save notifications", e);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Splash Screen Timer
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(splashTimer);
  }, []);

  // 2. Gesture Back System Handler (Android Physical Back & Web History)
  useEffect(() => {
    const handlePopState = () => {
      if (screenHistoryRef.current.length > 1) {
        setScreenHistory((prev) => {
          const newHistory = [...prev];
          newHistory.pop();
          const prevScreen = newHistory[newHistory.length - 1];
          setCurrentScreen(prevScreen);
          return newHistory;
        });
      }
    };

    window.addEventListener("popstate", handlePopState);

    let listenerHandle: any = null;

    const registerCapacitorBack = async () => {
      try {
        const { App: CapApp } = await import("@capacitor/app");
        listenerHandle = await CapApp.addListener("backButton", () => {
          if (screenHistoryRef.current.length > 1) {
            setScreenHistory((prev) => {
              const newHistory = [...prev];
              newHistory.pop();
              const prevScreen = newHistory[newHistory.length - 1];
              setCurrentScreen(prevScreen);
              return newHistory;
            });
          } else {
            CapApp.minimizeApp();
          }
        });
      } catch {
        // Fallback for web browser
      }
    };

    registerCapacitorBack();

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  const navigateTo = (screen: ScreenType) => {
    if (screen === "add") {
      setEditSalaryMonth(null);
    }
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  // Test Firebase connection
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Sync auth state with Firebase and setup realtime listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsDataLoading(true);
      if (firebaseUser) {
        setCurrentUid(firebaseUser.uid);
        setIsFirebaseConnected(true);

        const isBioEnabled = isBiometricRegisteredForUser();
        if (isBioEnabled && currentScreen === "login") {
          // Stay on locked login screen
        } else {
          setCurrentScreen("dashboard");
        }

        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) setUserProfile(profile);

        const records = await fetchSalaryRecords(firebaseUser.uid);
        setSalaryRecords(records || []);
        if (records && records.length > 0) {
          setActiveMonth(records[0].month);
        }
      } else {
        setCurrentUid("");
        setUserProfile(BLANK_USER_PROFILE);
        setSalaryRecords([]);
        setCurrentScreen("login");
      }
      setIsDataLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to real-time updates for authenticated currentUid
  useEffect(() => {
    if (!currentUid || !auth.currentUser || auth.currentUser.uid !== currentUid)
      return;

    const unsubscribeRealtime = subscribeToUserData(
      currentUid,
      ({ profile, records }) => {
        if (profile) setUserProfile(profile);
        setSalaryRecords(records || []);
        if (records && records.length > 0) {
          setActiveMonth((prev) =>
            records.some((r) => r.month === prev) ? prev : records[0].month,
          );
        }
      },
    );

    return () => unsubscribeRealtime();
  }, [currentUid]);

  const handleLoginSuccess = async (email: string, uid?: string) => {
    const effectiveUid = uid || currentUid;
    if (!effectiveUid) return;

    setIsDataLoading(true);
    setCurrentUid(effectiveUid);

    await seedInitialData(effectiveUid, email);

    try {
      const remoteProfile = await fetchUserProfile(effectiveUid);
      if (remoteProfile) {
        setUserProfile(remoteProfile);
      }
      const records = await fetchSalaryRecords(effectiveUid);
      setSalaryRecords(records || []);
      if (records && records.length > 0) {
        setActiveMonth(records[0].month);
      }
    } catch (e) {
      console.error("Data load error on login:", e);
    } finally {
      setIsDataLoading(false);
    }

    navigateTo("dashboard");
  };

  const handleRegisterSuccess = async (email: string, uid?: string) => {
    const effectiveUid = uid || auth.currentUser?.uid || currentUid;
    setCurrentUid(effectiveUid);
    setUserProfile((prev) => ({ ...prev, email, uid: effectiveUid }));
    setSalaryRecords([]);
    navigateTo("dashboard");
    showToast(`Account registered & synchronized with Firebase!`);
  };

  const handleSaveSalaryRecord = async (newRecord: MonthSalaryRecord) => {
    setIsDataLoading(true);
    setSalaryRecords((prev) => {
      const idx = prev.findIndex((r) => r.month === newRecord.month);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRecord;
        return updated;
      }
      return [newRecord, ...prev];
    });
    setActiveMonth(newRecord.month);

    try {
      await saveSalaryRecord(currentUid, newRecord);
      showToast(`Salary for ${newRecord.monthLabel} saved & synced!`);
    } catch (e) {
      showToast(`Salary for ${newRecord.monthLabel} saved locally!`);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDeleteSalaryRecord = async (monthToDelete: string) => {
    const target = salaryRecords.find((r) => r.month === monthToDelete);
    const label = target?.monthLabel || monthToDelete;

    setIsDataLoading(true);
    setSalaryRecords((prev) => {
      const updated = prev.filter((r) => r.month !== monthToDelete);
      if (activeMonth === monthToDelete) {
        if (updated.length > 0) {
          setActiveMonth(updated[0].month);
        } else {
          setActiveMonth("");
        }
      }
      return updated;
    });

    try {
      if (currentUid) {
        await deleteSalaryRecord(currentUid, monthToDelete);
        showToast(`Salary record for ${label} deleted successfully!`);
      }
    } catch (e) {
      showToast(`Salary for ${label} removed.`);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfileData) => {
    setIsDataLoading(true);
    setUserProfile(updatedProfile);
    try {
      await saveUserProfile(updatedProfile);
      showToast("Profile updated & synced to Firebase!");
    } catch (e) {
      showToast("Profile updated successfully!");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogout = async () => {
    const isBioEnabled = isBiometricRegisteredForUser();

    if (isBioEnabled) {
      setCurrentUid("");
      setUserProfile(BLANK_USER_PROFILE);
      setSalaryRecords([]);
      navigateTo("login");
      showToast("সেশন লক করা হয়েছে। ফিঙ্গারপ্রিন্ট ব্যবহার করুন।");
    } else {
      try {
        await signOut(auth);
        setCurrentUid("");
        setUserProfile(BLANK_USER_PROFILE);
        setSalaryRecords([]);
        navigateTo("login");
        showToast("লগআউট সফল হয়েছে।");
      } catch (e) {
        navigateTo("login");
      }
    }
  };

  const activeRecord =
    salaryRecords.find((r) => r.month === activeMonth) || salaryRecords[0];

  const showBottomNav =
    currentScreen === "dashboard" ||
    currentScreen === "history" ||
    currentScreen === "reports" ||
    currentScreen === "profile" ||
    currentScreen === "details" ||
    currentScreen === "comparison";

  return (
    <div className="min-h-screen bg-[#F5FAF7] dark:bg-[#0E1814] text-[#17211D] flex flex-col items-center relative overflow-hidden">
      {/* Splash Screen Overlay */}
      <SplashScreen isLoading={showSplash} />

      {/* Global Loading Animation Overlay */}
      {isDataLoading && (
        <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="bg-[#17211D] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#008F5B]/40 animate-in fade-in">
            <Loader2 size={20} className="animate-spin text-[#10E594]" />
            <span className="text-xs font-bold tracking-wide">
              Syncing with Firebase...
            </span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed top-5 z-50 bg-[#17211D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce"
        >
          <CheckCircle size={16} className="text-[#008F5B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header (Desktop Preview Only) */}
      <header className="w-full bg-white dark:bg-[#14221C] border-b border-[#D7E0DC] dark:border-[#21352C] px-4 py-3 sticky top-0 z-40 hidden md:block">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="PayFlow"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.className =
                      "w-8 h-8 rounded-lg bg-[#008F5B] text-white flex items-center justify-center font-bold text-base shadow-xs";
                    target.parentElement.innerHTML = "<span>P</span>";
                  }
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-sm text-[#17211D] dark:text-[#F1F7F4]">
                  Pay
                </span>
                <span className="font-extrabold text-sm text-[#008F5B] dark:text-[#10E594]">
                  Flow
                </span>
                <span className="text-[10px] bg-[#E9F7F1] dark:bg-[#163024] text-[#008F5B] dark:text-[#10E594] font-bold px-2 py-0.5 rounded-full ml-1 border border-[#008F5B]/20 flex items-center gap-1">
                  <Cloud size={10} />
                  <span>Firebase Connected</span>
                </span>
              </div>
              <span className="text-[11px] text-[#6E7974] dark:text-[#9DB3A8] font-medium block mt-0.5">
                Pixel-Accurate Flutter Android Application • Realtime Backend
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-[#F5FAF7] dark:bg-[#101A16] rounded-xl border border-[#D7E0DC] dark:border-[#21352C]">
              <button
                id="toggle-preview-mode-btn"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-[#008F5B] text-white shadow-xs"
                    : "text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-white"
                }`}
              >
                <Smartphone size={14} />
                <span>Android UI View</span>
              </button>
              <button
                id="toggle-code-mode-btn"
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "code"
                    ? "bg-[#008F5B] text-white shadow-xs"
                    : "text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-white"
                }`}
              >
                <Code size={14} />
                <span>Flutter / Dart Code</span>
              </button>
            </div>

            {currentScreen !== "login" && currentScreen !== "register" && (
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#14221C] border border-[#D7E0DC] dark:border-[#21352C] text-xs font-semibold text-[#D83B3B] hover:bg-[#D83B3B]/10 transition-all cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto flex-1 p-0 md:p-5 flex flex-col items-center justify-center h-screen overflow-hidden">
        {viewMode === "preview" ? (
          <AndroidFrame
            activeScreen={currentScreen}
            onSelectScreen={navigateTo}
          >
            {/* Screen Content Container with Clean Native Scroll */}
            <div className="flex-1 flex flex-col justify-between h-full overflow-hidden relative">
              <div className="flex-1 overflow-y-auto overscroll-none">
                {currentScreen === "login" && (
                  <LoginView
                    onNavigateToRegister={() => navigateTo("register")}
                    onForgotPassword={() => setIsForgotPasswordOpen(true)}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )}

                {currentScreen === "register" && (
                  <RegisterView
                    onNavigateToLogin={() => navigateTo("login")}
                    onRegisterSuccess={handleRegisterSuccess}
                  />
                )}

                {currentScreen === "dashboard" && (
                  <DashboardView
                    userProfile={userProfile}
                    salaryRecords={salaryRecords}
                    activeMonth={activeMonth}
                    onSelectMonth={(m) => setActiveMonth(m)}
                    onNavigate={navigateTo}
                    notifications={notifications}
                    onUpdateNotifications={handleUpdateNotifications}
                  />
                )}

                {currentScreen === "history" && (
                  <SalaryHistoryView
                    salaryRecords={salaryRecords}
                    userProfile={userProfile}
                    activeMonth={activeMonth}
                    onSelectMonth={(m) => setActiveMonth(m)}
                    onNavigate={navigateTo}
                    onDeleteRecord={handleDeleteSalaryRecord}
                  />
                )}

                {currentScreen === "details" && (
                  <SalaryDetailsView
                    record={activeRecord}
                    salaryRecords={salaryRecords}
                    userProfile={userProfile}
                    onNavigate={navigateTo}
                    onEditMonth={(m) => {
                      setActiveMonth(m);
                      setEditSalaryMonth(m);
                      navigateTo("add");
                    }}
                    onDeleteRecord={handleDeleteSalaryRecord}
                  />
                )}

                {currentScreen === "comparison" && (
                  <ComparisonView
                    salaryRecords={salaryRecords}
                    activeMonth={activeMonth}
                    onNavigate={navigateTo}
                  />
                )}

                {currentScreen === "add" && (
                  <AddSalaryView
                    key={`add-view-${editSalaryMonth || "new"}-${salaryRecords.length}`}
                    initialMonth={editSalaryMonth || undefined}
                    existingRecords={salaryRecords}
                    onSaveRecord={handleSaveSalaryRecord}
                    onNavigate={navigateTo}
                  />
                )}

                {currentScreen === "reports" && (
                  <ReportsView
                    salaryRecords={salaryRecords}
                    activeMonth={activeMonth}
                    onSelectMonth={(m) => setActiveMonth(m)}
                    onNavigate={navigateTo}
                  />
                )}

                {currentScreen === "profile" && (
                  <ProfileView
                    userProfile={userProfile}
                    salaryRecords={salaryRecords}
                    onUpdateProfile={handleUpdateProfile}
                    onLogout={handleLogout}
                    onNavigate={navigateTo}
                  />
                )}
              </div>

              {/* Fixed Docked Bottom Navigation Bar */}
              {showBottomNav && (
                <div className="shrink-0 z-30">
                  <BottomNavBar
                    currentScreen={currentScreen}
                    onSelectScreen={navigateTo}
                  />
                </div>
              )}
            </div>
          </AndroidFrame>
        ) : (
          <div className="w-full max-w-5xl h-[700px]">
            <FlutterCodeViewer />
          </div>
        )}
      </main>

      {/* Forgot Password Dialog */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
