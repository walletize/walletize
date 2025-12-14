![Walletize](/hero-dark.avif)

# Walletize

The open-source personal finance app that's simple and modern.

## About 📝

Walletize is a web application designed to help individuals efficiently manage their personal finances. Track your income, expenses, assets, and liabilities while getting comprehensive insights into your net worth and overall financial health.

Key features:

- Multi-currency support
- Shared financial accounts
- Cross-device synchronization
- Asset tracking (savings, investments, real estate, etc.)
- Transaction management
- Modern, intuitive interface

## Requirements 🛠️

- Docker installed and running
- Walletize server running (see [Walletize/server](https://github.com/Walletize/server))

## How to Use 🚀

There are two ways to use Walletize:

### 1. Managed Service

Visit [www.walletize.app](https://www.walletize.app) to use the managed version. This is the easiest way to get started - simply create an account and start tracking your finances. The managed version includes automatic updates, backups, and technical support.

### 2. Self-Hosting with Docker

Before self-hosting Walletize, you'll need to set up the Walletize server first:

Set up [Walletize/server](https://github.com/Walletize/server) by following the instructions in its README

Once you have the server running, you can proceed with setting up the web application:

1. Clone this repository:

   ```bash
   git clone https://github.com/Walletize/web.git walletize-web
   cd walletize-web
   ```

2. Create a `.env` file in the root directory with the following variables, and adjust them accordingly (or copy `.env.example`):

   ```bash
   NEXT_PUBLIC_WEB_URL="http://<YOUR_IP_ADDRESS>:3101"
   NEXT_PUBLIC_API_URL="http://<YOUR_IP_ADDRESS>:3100"
   DISABLE_SIGNUP=false #You can disable the signup page by setting this to true
   ```

3. Build and run the Docker container:

   ```bash
   docker build -t walletize-web .
   docker run -d -p 3101:3101 --name walletize-web walletize-web
   ```

4. Access Walletize at `http://<YOUR_IP_ADDRESS>:3101`
