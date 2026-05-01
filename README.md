# SchoolCoreOS Frontend Architecture

Welcome to the SchoolCoreOS frontend repository. This project is built using React and TypeScript, strictly adhering to best practices, clean architecture, and modular design.

## Features

- **Component-Driven Architecture**: Uses highly reusable UI components (`/components/common`).
- **Centralized API Service**: All networking calls are isolated in `/services`, leveraging `axios` with global interceptors.
- **i18n Localization**: Built-in support for multiple languages using `react-i18next`.
- **Responsive Design**: Utilizes CSS Media Queries and flexible layouts over Javascript dimension checks.
- **Theme Variables**: Centralized styling configurations for consistency across the application.

## 📂 Folder Structure

```
src/
├── assets/         # Static assets (images, icons)
├── components/     # Reusable React components
│   ├── common/     # Core UI (Button, Input, Text)
├── i18n/           # Localization configuration and JSON files
├── pages/          # Full page views (Login, Dashboard, etc.)
├── routes/         # React Router configurations
├── services/       # Centralized API logic (api.ts, authService.ts)
├── styles/         # Global stylesheets and CSS variables
├── theme/          # Design system tokens (colors, typography)
└── utils/          # Pure helper functions (validation, formatting)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## 🛠 Usage & Conventions

### Adding New Components
- Always use the `/components/common` directory for generic, highly reusable UI blocks.
- Components should not fetch data directly; pass data in via props.

### API Services
- Do not use inline `fetch()` or raw API endpoints in UI components.
- Define service methods in `src/services/` (e.g., `authService.ts`) and use the pre-configured `axios` instance (`api.ts`).

### Localization (i18n)
- Never hardcode text strings into components.
- Use the `useTranslation()` hook and reference keys defined in `src/i18n/locales/en.json`.
