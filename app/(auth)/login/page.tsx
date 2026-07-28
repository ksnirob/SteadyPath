import { AuthScreen } from "./auth-screen";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requestedCallbackUrl = params?.callbackUrl || "/dashboard";
  const callbackUrl =
    requestedCallbackUrl.startsWith("/") && !requestedCallbackUrl.startsWith("//")
      ? requestedCallbackUrl
      : "/dashboard";
  const authError = params?.error;

  return <AuthScreen callbackUrl={callbackUrl} authError={authError} />;
}
