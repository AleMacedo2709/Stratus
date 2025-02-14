import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/providers/AuthProvider';
import { MsalProvider } from '@/providers/MsalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Planejamento Estratégico',
  description: 'Sistema de Planejamento Estratégico para Órgãos Públicos',
};

if (process.env.NODE_ENV === 'development') {
  require('../utils/suppressWarnings');
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <MsalProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </MsalProvider>
      </body>
    </html>
  );
}
