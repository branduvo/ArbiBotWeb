# Overview

This is a cryptocurrency arbitrage trading bot application that identifies and executes profitable trading opportunities across multiple exchanges. The system monitors real-time price differences between exchanges for various trading pairs and automatically executes trades when profitable arbitrage opportunities are detected. The application features a professional dashboard interface for monitoring bot performance, managing settings, and viewing trading history.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript, utilizing a modern component-based architecture:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management with real-time data synchronization
- **UI Framework**: Radix UI components with shadcn/ui design system and Tailwind CSS for styling
- **Real-time Communication**: WebSocket integration for live price updates and bot status monitoring
- **Component Structure**: Modular components for dashboard, price monitoring, arbitrage opportunities, trading history, and bot controls

## Backend Architecture
The server-side implements a RESTful API with real-time capabilities:
- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for bot control, settings management, and data retrieval
- **Real-time Updates**: WebSocket server for broadcasting live price data and trading opportunities
- **Service Layer**: Modular services for arbitrage detection, exchange management, and bot operations
- **Background Processing**: Automated price monitoring and opportunity scanning with configurable intervals

## Data Storage Solutions
The application uses a PostgreSQL database with Drizzle ORM:
- **Database**: PostgreSQL for reliable data persistence
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Design**: Normalized tables for users, exchanges, trading pairs, prices, arbitrage opportunities, trades, and bot settings
- **Migrations**: Database schema versioning through Drizzle migrations
- **Connection**: Neon serverless PostgreSQL integration for cloud deployment

## Authentication and Authorization
Currently implements basic user management:
- **User Storage**: User credentials stored in PostgreSQL with hashed passwords
- **Session Management**: Session-based authentication using PostgreSQL session store
- **Access Control**: Basic user identification for bot settings and trading history

## External Service Integrations
The system is designed to integrate with multiple cryptocurrency exchanges:
- **Exchange APIs**: Configurable API connections for multiple exchanges (Binance, Coinbase, Kraken, etc.)
- **Price Feeds**: Real-time price data aggregation from connected exchanges
- **Trading Execution**: Automated trade execution across different exchange platforms
- **WebSocket Connections**: Live market data streaming from exchange WebSocket APIs
- **Mock Data**: Development environment includes simulated price data for testing

## Key Design Patterns
- **Service-Oriented Architecture**: Separation of concerns with dedicated services for arbitrage, exchanges, and bot management
- **Event-Driven Updates**: WebSocket-based real-time data broadcasting
- **Configuration-Driven**: Flexible bot settings for profit margins, position sizes, and risk management
- **Microservice Ready**: Modular structure allows for easy service extraction and scaling
- **Type Safety**: End-to-end TypeScript implementation with shared schemas between client and server

# External Dependencies

## Core Technologies
- **React 18**: Frontend framework with hooks and modern patterns
- **Express.js**: Node.js web application framework
- **TypeScript**: Type-safe JavaScript development
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Primary database (configured for Neon serverless)

## Deployment Configuration
- **Vercel**: Production hosting platform with serverless functions
- **Local Development**: Node.js server with Vite HMR
- **Environment Variables**: Separate configs for development and production
- **WebSocket Support**: Real-time updates in both local and production environments

## UI and Styling
- **Radix UI**: Headless UI component library
- **shadcn/ui**: Pre-built component system
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **WebSocket**: Real-time bidirectional communication

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Fast JavaScript bundler for production
- **TSX**: TypeScript execution for development

## External APIs and Services
- **Cryptocurrency Exchange APIs**: Multiple exchange integrations for price data and trading
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Servers**: Real-time market data feeds

## Authentication and Security
- **bcrypt**: Password hashing (implied from user management)
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Development and Deployment Files
- **vercel.json**: Vercel deployment configuration with serverless functions
- **README.md**: Comprehensive setup and deployment instructions
- **DEPLOYMENT.md**: Detailed deployment guide for Vercel
- **.env.example**: Template for environment variables
- **api/index.js**: Vercel serverless function entry point