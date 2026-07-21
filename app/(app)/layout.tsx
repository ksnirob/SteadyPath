import { AppChrome } from "@/components/layout/app-chrome";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AppChrome>{children}</AppChrome>;
}
