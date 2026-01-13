"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import ContactFloating from "@/components/ContactFloating";

type AppChromeProps = {
  children: React.ReactNode;
};

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/admin");

  return (
    <>
      {!hideChrome && (
        <div className="fixed top-3 left-0 right-0 z-50">
          <div className="px-4">
            <Header />
          </div>
        </div>
      )}

      <div>{children}</div>

      {!hideChrome && <ContactFloating />}
    </>
  );
}
