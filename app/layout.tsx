import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIVOS OS · Cloud Integration & Agentic AI Platform',
  description: 'AIVOS is a next-generation IT integration and automation platform. Streamlining Azure Data Factory ETL, PySpark Delta Lake quality checks, and autonomous AI agents.',
  keywords: ['AIVOS', 'Azure Data Factory', 'Databricks', 'PySpark', 'Agentic AI', 'IT Integration', 'Delta Lake', 'Gemini 2.0'],
  authors: [{ name: 'AIVOS Systems' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
