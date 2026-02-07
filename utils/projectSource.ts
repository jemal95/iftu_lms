
// This file contains the complete source code to enable the "Download Source" feature for GitHub uploads.

export const PROJECT_FILES: Record<string, string> = {
  'metadata.json': `{
  "name": "IFTU LMS - Modern Institutional Learning Platform",
  "description": "Comprehensive Learning Management System with AI-powered student assistance, automated gradebooks, and performance tracking.",
  "requestFramePermissions": [
    "camera",
    "microphone",
    "geolocation"
  ]
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IFTU LMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&family=Pinyon+Script&display=swap" rel="stylesheet">
<script type="importmap">
{
  "imports": {
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "@google/genai": "https://esm.sh/@google/genai@^1.35.0",
    "recharts": "https://esm.sh/recharts@^3.6.0",
    "lucide-react": "https://esm.sh/lucide-react@^0.562.0",
    "marked": "https://esm.sh/marked@^12.0.0",
    "jszip": "https://esm.sh/jszip@^3.10.1"
  }
}
</script>
</head>
<body class="bg-gray-50 text-gray-900">
    <div id="root"></div>
</body>
</html>`,
  'types.ts': `export const ADMIN_PROFILE = { NAME: 'Jemal Fano Haji', EMAIL: 'admin@iftu.edu' };
export interface InstitutionalBranding {
  bureauName: string; bureauNameLocal: string;
  zoneName: string; woredaName: string;
  schoolName: string; schoolNameLocal: string;
  academicYear: string;
}
export enum NavSection { DASHBOARD = 'DASHBOARD', COURSES = 'COURSES', TEACHERS = 'TEACHERS', STUDENTS = 'STUDENTS', AI_ASSISTANT = 'AI_ASSISTANT', PROFILE = 'PROFILE', EXAMS = 'EXAMS', GRADEBOOK = 'GRADEBOOK', TRANSCRIPT = 'TRANSCRIPT', CERTIFICATE = 'CERTIFICATE' }`,
  'components/OfficialHeader.tsx': `import React from 'react';
import { InstitutionalBranding } from '../types';
export const OfficialHeader = ({ branding, subTitle }) => (
  <div className="flex justify-between items-center mb-8">
    <div className="text-center flex-1">
      <h1 className="text-lg font-bold uppercase">{branding.bureauName}</h1>
      <h2 className="text-3xl font-black text-[#0090C1]">{branding.schoolName}</h2>
      <p className="text-xs font-bold text-slate-500 uppercase">{subTitle}</p>
    </div>
  </div>
);`,
  'components/Signature.tsx': `import React from 'react';
export const Signature = ({ className, color }) => (
  <svg viewBox="0 0 100 80" className={className} stroke={color || '#2563eb'} fill="none">
    <path d="M50 15 C35 15, 30 35, 50 35 C65 35, 70 15, 50 15 Z" strokeWidth="1.5" />
    <path d="M50 15 L45 75" strokeWidth="1.5" />
  </svg>
);`
};
