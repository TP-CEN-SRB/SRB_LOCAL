# Temasek Polytechnic Smart Recycling Bin(Major Project)

## Installation Setup for Raspberry Pi

First, ensure that you have the following installed:

1. [Node.js 18.17](https://nodejs.org/en) or later
2. Git

Once you clone the repository, enter the following commands

```bash
npm install # install the necessary dependencies

```

## Setting up environent variables

Ensure your `key.ts` has the following environment variables

1. BASE_URL = "http://localhost:3000"
2. HOSTED_URL = "https://cen-smart-bin.vercel.app"
3. API_KEY = *****************************
4. NEXT_JWT_SECRET_KEY = *****************************

Create an account at [Pusher](https://dashboard.pusher.com/) and copy your API keys 

5. NEXT_PUBLIC_PUSHER_APP_ID = *****************************
6. NEXT_PUBLIC_PUSHER_KEY = *****************************
7. PUSHER_SECRET = *****************************
8. NEXT_PUBLIC_PUSHER_CLUSTER = *****************************
