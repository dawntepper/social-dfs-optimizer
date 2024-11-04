import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AlertsProvider } from '@/components/alerts/AlertsProvider';
import { Header } from '@/components/layout/Header';
import { FloatingAIAssistant } from '@/components/ai/FloatingAIAssistant';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFL DFS Optimizer',
  description: 'Advanced NFL DFS optimization and analysis platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className="dark"
    >
      <body 
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AlertsProvider>
              <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/90">
                <Header />
                <main className="flex-1 px-4 lg:px-8">
                  {children}
                </main>
                <FloatingAIAssistant />
              </div>
              <Toaster />
            </AlertsProvider>
          </TooltipProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                document.body.removeAttribute('data-new-gr-c-s-check-loaded');
                document.body.removeAttribute('data-gr-ext-installed');
              });
            `,
          }}
        />
      </body>
    </html>
  );
}