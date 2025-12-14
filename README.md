![Walletize](hero-dark.avif)

# Walletize

The open-source personal finance app that's simple, modern, and ready for self-hosting or managed use.

## About 📝

Walletize helps individuals track income, expenses, assets, and liabilities while visualizing net worth and long-term financial health. The monorepo ships both the Express.js API and the Next.js web client so you can run a complete stack locally or in production with a single Docker Compose command.

Key features:
- Multi-currency support with automatic rate updates
- Shared financial accounts spanning assets and liabilities
- Comprehensive transaction management and insights
- RESTful back-end API with authentication and authorization
- Modern, responsive web UI with cross-device sync

## Requirements 🛠️

- Docker and Docker Compose (bundle installs PostgreSQL, API, and front-end)
- An ExchangeRate-API key (get one at https://www.exchangerate-api.com)
- Optional: HTTPS certificate/termination if you flip `USE_HTTPS` to `true`

## How to Use 🚀

### 1. Managed Service

Visit [www.walletize.app](https://www.walletize.app) to use the hosted version with automatic updates, backups, and support.

### 2. Self-Hosting with Docker Compose

1. Clone the repository and enter the folder:
   ```bash
   git clone https://github.com/Walletize/walletize.git
   cd walletize
   ```
2. Create a `.env` file next to `docker-compose.yml` (or export environment variables) and adjust values as needed:
   ```bash
   EXCHANGE_RATE_API_KEY="your-exchangerate-api-key"
   WEB_URL="http://localhost:3101"
   USE_HTTPS="false"
   NEXT_PUBLIC_WEB_URL="http://localhost:3101"
   NEXT_PUBLIC_API_URL="http://localhost:3100"
   INTERNAL_API_URL="http://server:3100"
   DISABLE_SIGNUP="false"
   ```
   - `DATABASE_URL` is managed inside Compose (`postgresql://postgres:postgres@db:5432/walletize`).
   - Override `NEXT_PUBLIC` values when deploying behind a proxy or on a different host.
3. Build and start everything with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
   - The Compose stack boots PostgreSQL, the Walletize API (`:3100`), and the web client (`:3101`).
   - Logs are available via `docker compose logs -f server` or `docker compose logs -f web`.
4. Visit `http://localhost:3101` to access the web UI, which will call the API at `http://localhost:3100`.

5. When you are done, stop the stack with:
   ```bash
   docker compose down
   ```

For more granular control, see `server/README.md` and `web/README.md` for server-specific and front-end-specific commands such as `docker build`, `npm run`, or Prisma migrations.
