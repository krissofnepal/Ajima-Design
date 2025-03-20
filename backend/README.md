# Ajima Design Backend

This is the backend server for Ajima Design built with Node.js and Express.

## Project Structure
```
backend/
├── .env                 # Environment variables
├── middleware/         # Custom middleware functions
├── models/            # Database models
├── routes/            # API route handlers
└── server.js          # Main application entry point
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

API endpoints are organized in the `routes` directory:
- Authentication routes
- User management
- Design related operations
