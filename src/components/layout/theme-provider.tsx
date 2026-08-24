'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Habilita el dark mode. Los tokens del bloque `.dark` de globals.css ya
 * existían, pero nadie le ponía nunca esa clase al <html>: sin esto el tema
 * oscuro era código muerto.
 *
 * `attribute="class"` es lo que espera el `@custom-variant dark` de Tailwind v4
 * declarado en globals.css.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
