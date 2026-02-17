"use client";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 40, text: "text-xl" },
};

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const { icon: iconSize, text: textClass } = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2.5 font-semibold text-white ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        {/* Shield: trust & protection */}
        <path
          d="M20 4L6 10v10c0 8 6 14 14 16 8-2 14-8 14-16V10L20 4z"
          fill="url(#tw-grad)"
        />
        <path
          d="M20 7.5L8.5 12.5v8c0 6.5 4.8 11.5 11.5 13.2 6.7-1.7 11.5-6.7 11.5-13.2v-8L20 7.5z"
          fill="url(#tw-inner)"
          fillOpacity="0.35"
        />
        {/* W = wealth rising (growth line) */}
        <path
          d="M12 24l4-8 4 5 4-5 4 8"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <linearGradient id="tw-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="tw-inner" x1="20" y1="7" x2="20" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
      </svg>
      {showText && <span className={textClass}>TrueWealth</span>}
    </span>
  );
}
