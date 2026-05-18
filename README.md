# Pay Trix - Premium Personal Finance Manager

![Pay Trix Banner](public/banner.png)

**Pay Trix** is a state-of-the-art, privacy-first personal finance application built to help you take complete control of your wealth. Featuring a premium "dark-luxe" aesthetic, seamless wallet tracking, and intelligent analytics, Pay Trix operates entirely in your browser—meaning your financial data never leaves your device.

## ✨ Key Features

- **Multi-Wallet Support**: Create and manage multiple funding sources (e.g., Cash, Checking, Credit Cards). Your global Net Balance is intelligently calculated across all accounts.
- **Smart Budgeting**: Set dynamic monthly limits for specific categories and link them directly to specific funding accounts for seamless expense tracking.
- **Deep Analytics**: Visualize your cash flow with interactive Recharts, including 6-month income vs. expense bar charts and monthly breakdown donut charts.
- **Privacy First (100% Local)**: No databases, no servers, no subscriptions. All your data is securely stored in your browser's `localStorage`.
- **Data Export & Backup**: Download your entire transaction history and account states as a `.json` backup file at any time.
- **Theming Engine**: Toggle instantly between a sleek Light Mode and a premium Dark Mode. Both themes utilize a custom glassmorphism UI system.
- **Installable PWA**: Pay Trix is built as a Progressive Web App. Install it natively to your desktop or mobile device for an app-like experience.
- **Mobile First**: Fluid, responsive design with a bottom navigation bar for comfortable thumb-reach on mobile devices.

## 🛠 Tech Stack

- **Frontend Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (with custom glassmorphism utilities)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: React Context API + `useReducer`
- **Date Formatting**: `date-fns`
- **Notifications**: `react-hot-toast`

## 🚀 Getting Started

To run this project locally on your machine:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation

1. **Clone the repository** (or download the ZIP file and extract it):
   ```bash
   git clone https://github.com/your-username/paytrix.git
   cd paytrix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`.

## 📱 Progressive Web App (PWA) Setup

Pay Trix includes a `manifest.json` and a service worker. To install it natively:
1. Open the app in a supported browser (e.g., Chrome, Edge).
2. Click the **"Install App"** button in the header, or look for the install icon in your browser's address bar.
3. The app will now be available on your desktop or home screen!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](../../issues) if you want to contribute.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
