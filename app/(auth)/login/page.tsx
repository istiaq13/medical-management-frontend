'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Activity,
  Bed,
  Syringe,
  FlaskConical,
  ClipboardList,
  Pill,
  Microscope,
  Ambulance,
  HeartPulse,
  Droplets,
  BriefcaseMedical,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkHealth = async () => {
      try {
        const res = await apiClient.get('/health');
        if (res.data && (res.data.status === 'ok' || res.status === 200)) {
          if (isMounted) {
            setIsBackendReady(true);
          }
          return;
        }
      } catch (err) {
        // Backend spinning up on Render free tier
      }

      if (isMounted) {
        timeoutId = setTimeout(checkHealth, 2500);
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email.trim(), data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 12 circular orbit medical items (matching screenshot ring)
  const orbitIcons = [
    {
      label: 'IV Infusion',
      icon: <Droplets className="h-4 w-4 text-[#009AA6]" />,
      angle: 285,
    },
    {
      label: 'Cardiology',
      icon: <HeartPulse className="h-4 w-4 text-[#009AA6]" />,
      angle: 320,
    },
    {
      label: 'Injection',
      icon: <Syringe className="h-4 w-4 text-[#009AA6]" />,
      angle: 355,
    },
    {
      label: 'Medical Kit',
      icon: <BriefcaseMedical className="h-4 w-4 text-[#009AA6]" />,
      angle: 30,
    },
    {
      label: 'Laboratory',
      icon: <FlaskConical className="h-4 w-4 text-[#009AA6]" />,
      angle: 65,
    },
    {
      label: 'Physiotherapy',
      icon: <Activity className="h-4 w-4 text-[#009AA6]" />,
      angle: 100,
    },
    {
      label: 'Records',
      icon: <ClipboardList className="h-4 w-4 text-[#009AA6]" />,
      angle: 135,
    },
    {
      label: 'Pharmacy',
      icon: <Pill className="h-4 w-4 text-[#009AA6]" />,
      angle: 170,
    },
    {
      label: 'Diagnostics',
      icon: <Microscope className="h-4 w-4 text-[#009AA6]" />,
      angle: 205,
    },
    {
      label: 'Ambulance',
      icon: <Ambulance className="h-4 w-4 text-[#009AA6]" />,
      angle: 235,
    },
    {
      label: 'Hospital Bed',
      icon: <Bed className="h-4 w-4 text-[#009AA6]" />,
      angle: 260,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* LEFT PANE: Form View */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-20 bg-white">
        {/* Center Login Box */}
        <div className="mx-auto w-full max-w-sm py-8 z-10">
          {/* Header Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B6A78]">
              DOCTOR TRACKER
            </h1>
            <p className="mt-1 text-base font-normal text-slate-500">
              Management Service
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Field 1: Email Address */}
            <div className="relative">
              <div
                className={`relative rounded-md border bg-white px-3.5 pt-2.5 pb-2 transition focus-within:border-[#0B6A78] focus-within:ring-1 focus-within:ring-[#0B6A78] ${
                  errors.email ? 'border-rose-400' : 'border-slate-300'
                }`}
              >
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Field 2: Password */}
            <div className="relative">
              <div
                className={`relative rounded-md border bg-white px-3.5 pt-2.5 pb-2 transition focus-within:border-[#0B6A78] focus-within:ring-1 focus-within:ring-[#0B6A78] ${
                  errors.password ? 'border-rose-400' : 'border-slate-300'
                }`}
              >
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500">
                  Password
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 stroke-[1.8]" />
                    ) : (
                      <Eye className="h-4 w-4 stroke-[1.8]" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isBackendReady || isSubmitting}
              className={`w-full rounded-md py-3 text-sm font-bold text-white shadow-sm transition duration-150 flex items-center justify-center gap-2 mt-2 ${
                !isBackendReady
                  ? 'bg-[#009AA6]/80 cursor-wait'
                  : isSubmitting
                  ? 'bg-[#009AA6]/85 cursor-wait'
                  : 'bg-[#009AA6] hover:bg-[#008792] active:bg-[#00737d] cursor-pointer'
              }`}
            >
              {!isBackendReady ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span>Backend starting...</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>

        {/* Faint Architectural Skyline Watermark at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 opacity-15 overflow-hidden">
          <svg
            viewBox="0 0 1200 200"
            className="w-full h-full object-cover object-bottom stroke-slate-500 fill-none"
            strokeWidth="1.2"
          >
            <path d="M0,200 L0,160 L40,160 L40,130 L70,130 L70,160 L120,160 L120,100 L140,80 L160,100 L160,160 L230,160 L230,140 L260,140 L260,160 L320,160 L320,70 L340,40 L360,40 L380,70 L380,160 L450,160 L470,130 L510,130 L530,160 L600,160 L600,110 L630,90 L660,110 L660,160 L750,160 L780,120 L840,120 L870,160 L960,160 L960,60 L980,30 L1000,60 L1000,160 L1080,160 L1100,140 L1140,140 L1160,160 L1200,160 L1200,200 Z" />
            <circle cx="360" cy="90" r="12" />
            <circle cx="980" cy="80" r="10" />
            <path d="M30,160 C100,120 200,120 280,160 M280,160 C360,120 460,120 540,160 M540,160 C640,120 740,120 820,160" />
          </svg>
        </div>
      </div>

      {/* RIGHT PANE: Cyan Illustration with Medical Orbit */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-b from-[#E6F8F9] via-[#E2F7F8] to-[#D5F3F5] overflow-hidden p-8 border-l border-[#cdeef1]">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/40 via-transparent to-transparent pointer-events-none" />

        {/* Circular Orbit Graphic */}
        <div className="relative flex items-center justify-center w-[420px] h-[420px]">
          {/* Dashed circular orbit boundary */}
          <div className="absolute w-[360px] h-[360px] rounded-full border-2 border-dashed border-[#A0E2E8]/90" />

          {/* Center Brand Badge */}
          <div className="z-10 text-center select-none bg-white/70 backdrop-blur-xs rounded-full p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-[#0B6A78]">
              DOCTOR TRACKER
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Management Service
            </p>
          </div>

          {/* 11-12 Icons positioned precisely along the perimeter */}
          {orbitIcons.map((item, idx) => {
            const radius = 180; // half of 360px
            const rad = (item.angle * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(rad));
            const y = Math.round(radius * Math.sin(rad));

            return (
              <div
                key={idx}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                title={item.label}
                className="absolute flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-sm border border-[#A0E2E8]/60 transition-transform hover:scale-115 hover:shadow-md"
              >
                {item.icon}
              </div>
            );
          })}
        </div>

        {/* Faint Architectural Skyline Watermark at bottom of right pane */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 opacity-25 overflow-hidden">
          <svg
            viewBox="0 0 1200 200"
            className="w-full h-full object-cover object-bottom stroke-[#0B6A78] fill-none"
            strokeWidth="1.2"
          >
            <path d="M0,200 L0,160 L40,160 L40,130 L70,130 L70,160 L120,160 L120,100 L140,80 L160,100 L160,160 L230,160 L230,140 L260,140 L260,160 L320,160 L320,70 L340,40 L360,40 L380,70 L380,160 L450,160 L470,130 L510,130 L530,160 L600,160 L600,110 L630,90 L660,110 L660,160 L750,160 L780,120 L840,120 L870,160 L960,160 L960,60 L980,30 L1000,60 L1000,160 L1080,160 L1100,140 L1140,140 L1160,160 L1200,160 L1200,200 Z" />
            <circle cx="360" cy="90" r="12" />
            <circle cx="980" cy="80" r="10" />
            <path d="M30,160 C100,120 200,120 280,160 M280,160 C360,120 460,120 540,160 M540,160 C640,120 740,120 820,160" />
          </svg>
        </div>
      </div>
    </div>
  );
}
