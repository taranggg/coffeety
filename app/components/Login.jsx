import {useNavigate} from '@remix-run/react';
import {useEffect} from 'react';

export function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle login status after authentication
    console.log('In Login Page');
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('code')) {
        await authenticate(params.get('code'));
        navigate('/account');
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="login-container">
      <h2>Sign in to your account</h2>
      <a
        href="/account/login"
        className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors"
      >
        Sign in with Shopify
      </a>
    </div>
  );
}

async function authenticate(code) {
  // Authentication handled via Shopify Hydrogen's built-in customer account API
}
