import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * 
 * This configuration centralizes all theme colors for the mini app.
 * To change the app's color scheme, simply update the 'primary' color value below.
 * 
 * Example theme changes:
 * - Blue theme: primary: "#3182CE"
 * - Green theme: primary: "#059669" 
 * - Red theme: primary: "#DC2626"
 * - Orange theme: primary: "#EA580C"
 */
export default {
    darkMode: "media",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			// Pudgy Penguins Brand Fonts
  			fobble: ['var(--font-fobble)', 'system-ui', 'sans-serif'],
  			kvant: ['var(--font-kvant)', 'system-ui', 'sans-serif'],
  			trailers: ['var(--font-trailers)', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			// Pudgy Penguins Brand Colors - Primary
  			'pudgy-sky': '#80ABFF',      // Sky Blue
  			'pudgy-blue': '#477DFD',     // Blue Crayola 
  			'pudgy-oxford': '#00142D',   // Oxford Blue
  			'pudgy-blizzard': '#F5FDFF', // Blizzard Blue
  			
  			// Pudgy Penguins Brand Colors - Secondary
  			'pudgy-coral': '#FF8B8B',    // Light Coral
  			'pudgy-floral': '#FBF7EB',   // Floral White
  			'pudgy-lavender': '#FBE9F3', // Lavender Blush
  			'pudgy-azure': '#E9F7FB',    // Azure
  			'pudgy-mint': '#A9FF99',     // Mint Green
  			'pudgy-jasmine': '#FFE092',  // Jasmine
  			'pudgy-plum': '#FFA3FF',     // Plum
  			
  			// Theme colors using Pudgy brand
  			primary: "#477DFD",          // Blue Crayola
  			"primary-light": "#80ABFF",  // Sky Blue
  			"primary-dark": "#00142D",   // Oxford Blue
  			
  			// Secondary colors for backgrounds and text
  			secondary: "#F5FDFF",        // Blizzard Blue
  			"secondary-dark": "#00142D", // Oxford Blue
  			
  			// Legacy CSS variables for backward compatibility
  			background: 'var(--background)',
  			foreground: 'var(--foreground)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Custom spacing for consistent layout
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  		},
  		// Custom container sizes
  		maxWidth: {
  			'xs': '20rem',
  			'sm': '24rem',
  			'md': '28rem',
  			'lg': '32rem',
  			'xl': '36rem',
  			'2xl': '42rem',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
