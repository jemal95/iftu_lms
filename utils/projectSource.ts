// This file contains the complete source code to enable the "Download Source" feature for GitHub uploads.

export const PROJECT_FILES: Record<string, string> = {
  'package.json': `{
  "name": "iftu-lms-production",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@google/genai": "^0.2.1",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.3",
    "marked": "^11.1.1",
    "jszip": "^3.10.1",
    "html2pdf.js": "^0.10.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.10"
  }
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`,
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});`,
  'README.md': `# IFTU LMS - Production Environment

Professional build of the IFTU Learning Management System.

## Deployment
1. Extract ZIP.
2. Run \`npm install\`.
3. Run \`npm run build\`.
4. Upload \`dist/\` folder to your host.

## Branding
Institutional branding is managed via the **Admin Profile > Branding** tab.
`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IFTU LMS</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`
};