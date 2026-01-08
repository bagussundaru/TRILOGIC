import React from 'react';
import { motion } from "framer-motion";

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  delay = 0
}) {
  // QCLAY Color Psychology Palette with Gradient Fills
  const colorConfig = {
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accent: "#3b82f6",
      gradientFrom: "from-blue-50/80",
      gradientVia: "via-white",
      gradientTo: "to-indigo-50/50",
      glowFrom: "from-blue-400/20",
      glowTo: "to-blue-600/10"
    },
    green: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "#10b981",
      gradientFrom: "from-emerald-50/80",
      gradientVia: "via-white",
      gradientTo: "to-teal-50/50",
      glowFrom: "from-emerald-400/20",
      glowTo: "to-emerald-600/10"
    },
    orange: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "#f59e0b",
      gradientFrom: "from-amber-50/80",
      gradientVia: "via-white",
      gradientTo: "to-orange-50/50",
      glowFrom: "from-amber-400/20",
      glowTo: "to-amber-600/10"
    },
    red: {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      accent: "#f43f5e",
      gradientFrom: "from-rose-50/80",
      gradientVia: "via-white",
      gradientTo: "to-pink-50/50",
      glowFrom: "from-rose-400/20",
      glowTo: "to-rose-600/10"
    },
    teal: {
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      accent: "#14b8a6",
      gradientFrom: "from-teal-50/80",
      gradientVia: "via-white",
      gradientTo: "to-cyan-50/50",
      glowFrom: "from-teal-400/20",
      glowTo: "to-teal-600/10"
    },
    purple: {
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent: "#8b5cf6",
      gradientFrom: "from-violet-50/80",
      gradientVia: "via-white",
      gradientTo: "to-purple-50/50",
      glowFrom: "from-violet-400/20",
      glowTo: "to-violet-600/10"
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      {/* QCLAY Card with Smooth Gradient Fill */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradientFrom} ${config.gradientVia} ${config.gradientTo} border border-[#f0f2f5] rounded-xl p-8 min-h-[140px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:border-[#e5e7eb] transition-all duration-300`}>

        {/* QCLAY: Top gradient bar on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, ${config.accent}, ${config.accent}80)` }}
        />

        {/* Left gradient accent stripe */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1 opacity-60"
          style={{ background: `linear-gradient(180deg, ${config.accent}40, ${config.accent}10)` }}
        />

        {/* Ambient Glow Effect - QCLAY Premium Feel */}
        <div
          className={`absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${config.glowFrom} ${config.glowTo} opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}
        />

        {/* Content */}
        <div className="relative flex items-start justify-between gap-4">
          {/* Text Content - QCLAY Typography */}
          <div className="flex-1 min-w-0">
            {/* Label: 12px, uppercase, letter-spacing 1.2px, #999 */}
            <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#888] mb-3">
              {title}
            </p>

            {/* Value: 48-56px, bold, near-black #1a1a1a */}
            <h3 className="text-[48px] lg:text-[56px] font-bold leading-[1.1] text-[#1a1a1a] tracking-tight mb-3">
              {value}
            </h3>

            {/* Sublabel: 14px, #666 */}
            {subtitle && (
              <div className="text-[14px] text-[#666] leading-relaxed">
                {subtitle}
              </div>
            )}
          </div>

          {/* Icon Container - QCLAY: 40x40, colored background */}
          {Icon && (
            <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}