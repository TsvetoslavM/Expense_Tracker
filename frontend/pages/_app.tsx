import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';
import { AuthProvider } from '@/context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Check if current page is an auth-related page
  const isAuthPage = router.pathname === '/login' || 
                    router.pathname === '/register' || 
                    router.pathname === '/forgot-password' ||
                    router.pathname === '/reset-password';
  
  return (
    <AuthProvider>
      <div className='flex flex-col min-h-screen'>
        {!isAuthPage && <Header />}
        <main className={`flex-grow bg-gray-50 ${isAuthPage ? 'py-0' : 'py-4 md:py-6 lg:py-8'}`}>
          <Component {...pageProps} />
        </main>
        {!isAuthPage && <SimpleFooter />}
      </div>
    </AuthProvider>
  );
}

export default MyApp; 