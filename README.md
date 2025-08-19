# Cryptocurrency Arbitrage Trading Bot

A comprehensive cryptocurrency arbitrage trading bot that automatically detects and profits from price differences across multiple exchanges. The system monitors real-time prices, identifies arbitrage opportunities, and executes automated trades while providing a professional dashboard for monitoring and control.

## Features

- **Real-time Price Monitoring**: Live price feeds from multiple exchanges (Binance, Coinbase, Kraken, Uniswap)
- **Arbitrage Detection**: Automated identification of profitable trading opportunities
- **Professional Dashboard**: Dark-themed trading interface with real-time updates
- **Bot Control Center**: Start, pause, and configure trading bot settings
- **Trading History**: Complete log of executed trades and performance metrics
- **Risk Management**: Configurable stop-loss, position limits, and auto-pause features
- **WebSocket Updates**: Live data streaming for instant market updates

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **TanStack Query** for server state management
- **Radix UI** + **shadcn/ui** for components
- **Tailwind CSS** for styling
- **WebSocket** for real-time updates

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **WebSocket Server** for real-time communication
- **In-memory storage** (easily switchable to PostgreSQL)
- **Modular service architecture**

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crypto-arbitrage-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. **Start the development server**
   
   **For Windows users:**
   ```bash
   # Use the Windows batch file
   dev.bat
   
   # OR use cross-env if available
   npx cross-env NODE_ENV=development tsx server/index.ts
   ```
   
   **For macOS/Linux users:**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5000
   ```

The application will automatically restart when you make changes to the code.

### Windows Troubleshooting

If you encounter the error `'NODE_ENV' is not recognized as an internal or external command` on Windows, use one of these solutions:

**Option 1: Use the Windows batch file**
```cmd
dev.bat
```

**Option 2: Use cross-env (installed automatically)**
```cmd
npx cross-env NODE_ENV=development tsx server/index.ts
```

**Option 3: Manual environment setup**
```cmd
set NODE_ENV=development && tsx server/index.ts
```

### Production Build (Local)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

## Deployment to Vercel

This application is optimized for deployment on Vercel with both frontend and serverless API functions.

### Prerequisites for Vercel Deployment

1. **Vercel account** at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended)
   ```bash
   npm install -g vercel
   ```

### Deployment Steps

#### Option 1: Deploy via Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy the application**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** (in Vercel dashboard or CLI)
   ```bash
   vercel env add NODE_ENV production
   vercel env add BINANCE_API_KEY your_binance_key_here
   vercel env add COINBASE_API_KEY your_coinbase_key_here
   # Add other required environment variables
   ```

#### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Configure Environment Variables**
   - In your Vercel project dashboard
   - Go to Settings > Environment Variables
   - Add all required variables from `.env.example`

### Environment Variables

For production deployment, you'll need to set these environment variables in Vercel:

```bash
NODE_ENV=production
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_SECRET_KEY=your_coinbase_secret_key
KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_SECRET_KEY=your_kraken_secret_key
```

### Vercel Configuration

The `vercel.json` file is pre-configured with:

- **Static Build**: Frontend assets served from Vercel's global CDN
- **Serverless Functions**: Backend API routes handled by Vercel Functions
- **WebSocket Support**: Real-time updates via Vercel's edge network
- **Automatic Routing**: API routes, WebSocket connections, and SPA routing

## API Endpoints

### Bot Control
- `GET /api/bot/status` - Get current bot status
- `POST /api/bot/start` - Start the trading bot
- `POST /api/bot/pause` - Pause the trading bot
- `POST /api/bot/stop` - Stop the trading bot
- `GET /api/bot/settings` - Get bot configuration
- `POST /api/bot/settings` - Update bot settings

### Data Endpoints
- `GET /api/prices` - Get latest prices from all exchanges
- `GET /api/opportunities` - Get active arbitrage opportunities
- `GET /api/trades` - Get trading history
- `POST /api/trades/:id/execute` - Execute a specific trade

### WebSocket
- `ws://localhost:5000/ws` (development)
- `wss://your-app.vercel.app/ws` (production)

## Configuration

### Bot Settings

The trading bot can be configured through the dashboard or API:

- **Minimum Profit Margin**: Threshold for executing trades (default: 0.25%)
- **Maximum Position Size**: Maximum amount per trade (default: $5000)
- **Slippage Tolerance**: Acceptable price movement (default: 0.5%)
- **Stop Loss**: Maximum loss per trade (default: 2.0%)
- **Daily Loss Limit**: Maximum daily losses (default: $1000)
- **Auto-pause on Loss**: Automatically pause after consecutive losses

### Exchange Configuration

Currently supports simulation mode for:
- **Binance**: Spot trading pairs
- **Coinbase Pro**: Major cryptocurrency pairs  
- **Kraken**: EUR and USD pairs
- **Uniswap V3**: DeFi token pairs

To add real exchange integration, update the API keys in your environment variables.

## Development

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── dist/                   # Production build output
```

### Adding New Exchanges

1. Update the exchange simulation in `server/services/exchange.ts`
2. Add exchange-specific API integration
3. Update the price monitoring service
4. Test with the arbitrage detection algorithm

### Database Migration

To switch from in-memory storage to PostgreSQL:

1. Update `drizzle.config.ts` with your database URL
2. Run `npm run db:push` to create tables
3. Update `server/storage.ts` to use Drizzle ORM
4. Set `DATABASE_URL` in your environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support:
- Check the GitHub issues
- Review the API documentation
- Test with the provided demo data

---

**⚠️ Disclaimer**: This is a demo trading bot for educational purposes. Always test thoroughly before using with real funds. Cryptocurrency trading involves significant risk.