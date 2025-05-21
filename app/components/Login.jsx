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
  try {
    const {customerAccount} = window.ENV;
    const {data, errors} = await customerAccount.mutate(
      `mutation customerAccessTokenCreate($code: String!) {
        customerAccessTokenCreate(input: {code: $code}) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            message
          }
        }
      }`,
      {
        variables: {code},
      },
    );

    if (errors?.length) throw new Error(errors[0].message);

    const token =
      data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
    if (token) {
      await fetch('/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({token}),
      });
    }
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
