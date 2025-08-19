# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env.local`
4. Start development server: `npm run dev`
5. Open http://localhost:5000

## Vercel Deployment

### Automatic GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables** in Vercel dashboard:
   ```
   NODE_ENV=production
   BINANCE_API_KEY=your_binance_key
   COINBASE_API_KEY=your_coinbase_key
   KRAKEN_API_KEY=your_kraken_key
   ```

### Manual CLI Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add NODE_ENV production
   vercel env add BINANCE_API_KEY your_key_here
   ```

### Configuration Files

- `vercel.json` - Deployment configuration
- `api/index.js` - Serverless function entry
- `.env.example` - Environment variables template

### Domain & HTTPS

- Vercel provides automatic HTTPS
- Custom domains available in project settings
- WebSocket connections work over WSS

### Monitoring

- Check deployment status in Vercel dashboard  
- View function logs in Vercel Functions tab

## Troubleshooting White Screen Issue

If you see a white screen on Vercel but the app works locally:

### Quick Fix Steps
1. **Update vercel.json** - Fixed routing for static assets
2. **Rebuild and redeploy** - Push the updated configuration
3. **Check browser console** - Look for asset loading errors
4. **Test API endpoints** - Verify `/api/` routes work

### Updated Vercel Configuration
The `vercel.json` now includes specific routing for:
- Static assets (`/assets/*`)
- CSS/JS files
- API endpoints (`/api/*`) 
- Client-side routing (fallback to `/index.html`)

### Environment Variables
Make sure these are set in Vercel:
```
NODE_ENV=production
```

### API Connectivity
The serverless functions should handle:
- `/api/bot/status`
- `/api/opportunities`
- `/api/trades`

### Force Rebuild
If issues persist:
1. Go to Vercel dashboard
2. Deployments tab
3. Redeploy latest commit
4. Check build logs for errors
- Monitor WebSocket connections via browser dev tools

## Environment Variables

### Required for Production

```bash
NODE_ENV=production
```

### Optional Exchange API Keys

```bash
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_SECRET_KEY=your_coinbase_secret_key
KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_SECRET_KEY=your_kraken_secret_key
```

### Database (Future)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check for TypeScript errors

2. **API Routes Not Working**:
   - Verify `vercel.json` routing configuration
   - Check function logs in Vercel dashboard
   - Ensure environment variables are set

3. **WebSocket Connection Issues**:
   - Use WSS protocol in production
   - Check browser network tab for connection errors
   - Verify Vercel supports WebSocket upgrades

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API routes working
- [ ] WebSocket connections established  
- [ ] Static assets loading
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Function logs clean
- [ ] Performance optimized