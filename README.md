# Furrchum Care Connect

## Project Overview

Furrchum Care Connect is a comprehensive pet healthcare platform that connects pet owners with veterinary professionals. The application features appointment scheduling, video consultations, prescription management, and pet health tracking.

## Project Info

**Repository**: [GitHub](https://github.com/yourusername/furrchum-care-connect)  
**Production URL**: [https://furrchum-care-connect.vercel.app](https://furrchum-care-connect.vercel.app)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Supabase account
- Whereby account for video calls

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/furrchum-care-connect.git
   cd furrchum-care-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Whereby API credentials

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Connect your GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `VITE_WHEREBY_API_KEY`: Your Whereby API key
   - `VITE_APP_URL`: Your production URL (e.g., https://furrchum-care-connect.vercel.app)
   - `VITE_NODE_ENV`: `production`

3. **Deploy!** Vercel will automatically deploy on push to main/master branch

### Environment Variables

See `.env.example` for all required environment variables.

## 🛠 Built With

- [React](https://reactjs.org/) - Frontend library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Vite](https://vitejs.dev/) - Build tool
- [Supabase](https://supabase.com/) - Backend & Database
- [Whereby](https://whereby.com/) - Video calling
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI components

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

