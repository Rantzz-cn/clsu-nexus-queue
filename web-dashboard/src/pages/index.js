import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getStoredUser } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getStoredUser();
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'counter_staff') {
        router.push('/counter/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Loading...</p>
    </div>
  );
}

