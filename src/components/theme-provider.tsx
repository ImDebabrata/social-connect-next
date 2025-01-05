"use client";

import { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Fix hyderation error block
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure we're only rendering after the client mounts
  }, []);

  if (!isClient) {
    return null; // Prevent rendering on the server
  }
  // End of hydration error block
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
