// import '../styles/globals.css';
import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

type AppLayoutProps = { Component: AppProps['Component']; pageProps: AppProps['pageProps'] };
function AppLayout({ Component, pageProps }: AppLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Hide navbar on login, register, 404, and error pages
  const hideNavbar = ['/login', '/register', '/404', '/_error'].includes(router.pathname);

  return (
    <>
      {!hideNavbar && (
        <Navbar
          userEmail={session?.user?.email ?? undefined}
          onLogout={() => signOut({ callbackUrl: '/' })}
        />
      )}
      <Component {...pageProps} />
    </>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AppLayout Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
