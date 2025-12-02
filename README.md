# Whole Life vs Term & Invest Calculator

A web-based simulation tool to compare the long-term financial outcomes of purchasing Whole Life insurance vs. buying Term insurance and investing the premium difference (BTID strategy), tailored for the Singapore tax environment.

## Features

- **Profile Configuration**: Set age, retirement goals, and inflation assumptions
- **Whole Life Policy Modeling**: Configure death benefit, premiums, and payment duration (Life Pay, 10-Pay, 20-Pay, Pay to 65)
- **Cash Value Calibration**: Input actual policy illustration values for accurate projections
- **BTID Strategy Modeling**: Configure term insurance and investment parameters
- **Singapore Tax Context**: Defaults to 0% capital gains tax with adjustable dividend withholding tax
- **Real-time Calculations**: Instant updates as you adjust parameters
- **Dual View**: Toggle between "Today's Dollars" (inflation-adjusted) and "Future Dollars"
- **Interactive Charts**: Visualize breakeven points and compare scenarios
- **Privacy-First**: All calculations are client-side, no data is stored or transmitted

## Quick Start

### Using Docker (Recommended)

#### Development Mode
```bash
docker-compose up dev
```
Then open http://localhost:5173

#### Production Mode
```bash
docker-compose up prod --build
```
Then open http://localhost:80

### Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

### Building the Production Image

```bash
docker build --target production -t wl-btid-calculator .
```

### Running the Production Container

```bash
docker run -d -p 80:80 --name wl-btid-calculator wl-btid-calculator
```

### Deploying to a Live Server

1. **Build the image**:
   ```bash
   docker build --target production -t wl-btid-calculator:latest .
   ```

2. **Save the image** (for transfer):
   ```bash
   docker save wl-btid-calculator:latest | gzip > wl-btid-calculator.tar.gz
   ```

3. **Transfer to server** (via scp, rsync, etc.):
   ```bash
   scp wl-btid-calculator.tar.gz user@your-server:/path/to/destination
   ```

4. **Load and run on server**:
   ```bash
   ssh user@your-server
   gunzip -c wl-btid-calculator.tar.gz | docker load
   docker run -d -p 80:80 --restart unless-stopped --name wl-btid-calculator wl-btid-calculator:latest
   ```

Alternatively, push to a container registry (Docker Hub, AWS ECR, GCP GCR, etc.) and pull on your server.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Interactive charts
- **Lucide React** - Icons
- **Docker** - Containerization
- **Nginx** - Production web server

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ProfileInputs.jsx      # User profile configuration
│   │   ├── WholeLifeInputs.jsx    # WL policy inputs
│   │   ├── BTIDInputs.jsx         # Term + Invest inputs
│   │   ├── ComparisonTable.jsx    # Key age snapshots table
│   │   ├── BreakevenChart.jsx     # Interactive chart
│   │   └── Toggle.jsx             # Toggle switch component
│   ├── utils/
│   │   ├── calculations.js        # All financial calculations
│   │   └── defaults.js            # Default values
│   ├── App.jsx                    # Main application
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind styles
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Development & production configs
├── nginx.conf                     # Production nginx config
└── package.json                   # Dependencies
```

## Calculation Logic

### Whole Life Ledger
- Tracks premium payments based on payment duration
- Interpolates cash value curve from calibration points
- Calculates death benefit including paid-up additions

### BTID Ledger
- Tracks term premium payments
- Calculates investment contributions based on strategy
- Applies net returns (return - fees - tax drag)
- Computes total estate value (investment + term death benefit)

### Breakeven Points
- Identifies when investment crosses above cash value
- Shows when WL death benefit exceeds total BTID estate

## License

MIT License - feel free to use and modify.

## Disclaimer

This calculator is for educational and illustrative purposes only. It does not constitute financial advice. Please consult a qualified financial advisor before making insurance or investment decisions.
