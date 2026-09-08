'use client';

import React from 'react';
import Image from 'next/image';

interface OniLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export default function OniLogo({ size = 'md', showSubtitle = true, className = '' }: OniLogoProps) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 48 : 38;
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative group cursor-pointer">
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white p-1 shadow-sm transition-all duration-200 group-hover:border-[#0047FF]/40 group-hover:shadow-md">
          <Image
            src="/oni_logo.png"
            alt="OniPress Brand Mark"
            width={dim}
            height={dim}
            className="object-contain rounded-lg transform group-hover:scale-105 transition duration-300"
            priority
          />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-[#0f172a] text-lg lg:text-xl font-display flex items-center">
            Oni<span className="text-[#0047FF]">Press</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wide bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20">
            v2.0 PRO
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-[#64748b] font-medium tracking-normal">
            Autonomous SEO &amp; WordPress Intelligence
          </p>
        )}
      </div>
    </div>
  );
}
