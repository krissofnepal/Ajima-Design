# Ajima Design Frontend

Modern frontend application for Ajima Design built with Next.js, TypeScript, and Tailwind CSS.

## Project Structure
```
frontend-new/
├── .next/              # Next.js build output
├── src/               # Source code
│   ├── app/          # App router pages
│   ├── components/   # Reusable components
│   ├── styles/      # Global styles
│   └── utils/       # Utility functions
├── public/           # Static assets
├── next.config.mjs   # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── tsconfig.json    # TypeScript configuration
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

## Development Guidelines

- Use TypeScript for type safety
- Follow the component-based architecture
- Style with Tailwind CSS
- Follow ESLint and Prettier configurations
