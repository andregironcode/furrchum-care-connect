
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
// ESLint: @typescript-eslint/no-require-imports

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				// Updated Furrchum Brand Colors based on user request
				primary: {
					DEFAULT: '#FF8F30', // primaryBlue
					50: '#FFF5ED',
					100: '#FFEBD5',
					200: '#FED6AC',
					300: '#FDC283',
					400: '#FDB67F', // primaryBlueLight
					500: '#FF8F30',
					600: '#ff7500', // secondaryBlue
					700: '#E06400',
					800: '#BD5300',
					900: '#A04700',
					foreground: '#FFFFFF'
				},
				accent: {
					DEFAULT: '#d67b4b', // boldPurple
					50: '#FDF5F0',
					100: '#F9E6DC',
					200: '#F0CDBA',
					300: '#E7B498',
					400: '#dba284', // lightPurple
					500: '#d67b4b',
					600: '#C56235',
					700: '#A6522D',
					800: '#884425',
					900: '#6A361D',
					foreground: '#FFFFFF'
				},
				cream: {
					50: '#FFFBF7',
					100: '#FEF7ED',
					200: '#FED7AA',
					300: '#FDBA74',
					400: '#FB923C',
					DEFAULT: '#FEF7ED',
				},
				tan: {
					100: '#F5F2E8',
					200: '#E8E0D0',
					300: '#D6C7A8',
					DEFAULT: '#E8E0D0',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#FFFBF7',
				foreground: 'hsl(var(--foreground))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out'
			}
		}
	},
	plugins: [animate],
} satisfies Config;
