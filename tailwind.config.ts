import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			whispr: {
  				void: '#0A0A0A',
  				smoke: '#1C1C1E',
  				concrete: '#2C2C2E',
  				'whisper-gray': '#8E8E93',
  				chalk: '#F2F2F7',
  				paper: '#FAFAFA',
  				copper: '#D4A574',
  				ember: '#B8785C',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			glow: '0 0 20px rgba(212,165,116,0.35)'
  		},
  		fontFamily: {
  			display: ['Space Grotesk', 'sans-serif'],
  			body: ['DM Sans', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace'],
  			space: ['Space Grotesk', 'sans-serif'],
  			satoshi: ['DM Sans', 'sans-serif'],
  		},
  		borderRadius: {
  			'2xl': '1.25rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backdropBlur: {
  			glass: '10px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
