import React from 'react';
import { motion } from 'motion/react';
import { PayFlowLogo } from './PayFlowLogo';
import { Shield, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  isLoading: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  return (
    <motion.div
      id="payflow-splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={`fixed inset-0 z-50 bg-gradient-to-b from-[#0E1814] via-[#10221B] to-[#0A120E] flex flex-col items-center justify-between py-12 px-6 ${
        isLoading ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#008F5B]/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#10E594]/10 blur-2xl pointer-events-none" />

      {/* Top Spacer */}
      <div className="w-full flex justify-end">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#162D24] border border-[#008F5B]/30 text-[11px] font-bold text-[#10E594]">
          <Sparkles size={12} />
          <span>v2.4 Secure</span>
        </div>
      </div>

      {/* Center Brand Identity & Logo */}
      <div className="flex flex-col items-center text-center relative z-10 my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          {/* Outer Pulsing Emerald Ring */}
          <div className="absolute -inset-4 rounded-3xl bg-[#008F5B]/20 blur-md animate-ping" />

          <div className="relative p-4 rounded-2xl bg-[#14261D] border border-[#008F5B]/40 shadow-2xl">
            <PayFlowLogo iconSize={64} fontSize={32} showSubtitle={false} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-6"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#008F5B] dark:text-[#10E594]">
            Secure Salary Management
          </p>
          <p className="text-[13px] text-[#8EA298] font-medium mt-1">
            Realtime Firebase Payroll & Cashflow Intelligence
          </p>
        </motion.div>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1.5 bg-[#162D24] rounded-full overflow-hidden mt-8 border border-[#234537]">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: 'easeInOut',
            }}
            className="w-full h-full bg-gradient-to-r from-[#008F5B] via-[#10E594] to-[#008F5B] rounded-full"
          />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#6E857B] relative z-10">
        <Shield size={14} className="text-[#008F5B]" />
        <span>HARDWARE ENCRYPTED</span>
        <span>•</span>
        <span>FIREBASE SYNC</span>
      </div>
    </motion.div>
  );
};
