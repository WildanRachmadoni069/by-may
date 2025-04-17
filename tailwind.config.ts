import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Base sizes (mobile)
        "h1-mobile": ["2rem", { lineHeight: "1.2", fontWeight: "700" }], // 32px
        "h2-mobile": ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }], // 28px
        "h3-mobile": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }], // 24px
        "h4-mobile": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }], // 20px
        "h5-mobile": ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }], // 18px
        "h6-mobile": ["1rem", { lineHeight: "1.5", fontWeight: "600" }], // 16px

        // Desktop sizes
        h1: ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }], // 40px
        h2: ["2rem", { lineHeight: "1.3", fontWeight: "600" }], // 32px
        h3: ["1.75rem", { lineHeight: "1.4", fontWeight: "600" }], // 28px
        h4: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }], // 24px
        h5: ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }], // 20px
        h6: ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }], // 18px
      },
      container: {
        center: true,
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        ping: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-25%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slower": "ping 4s cubic-bezier(0, 0, 0.2, 1) infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-staggered-1": "bounce 1s ease infinite 0.1s",
        "bounce-staggered-2": "bounce 1s ease infinite 0.2s",
        "bounce-staggered-3": "bounce 1s ease infinite 0.3s",
        "bounce-staggered-4": "bounce 1s ease infinite 0.4s",
        "bounce-staggered-5": "bounce 1s ease infinite 0.5s",
        "bounce-staggered-6": "bounce 1s ease infinite 0.6s",
        "bounce-staggered-7": "bounce 1s ease infinite 0.7s",
        "bounce-staggered-8": "bounce 1s ease infinite 0.8s",
        "bounce-staggered-9": "bounce 1s ease infinite 0.9s",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
