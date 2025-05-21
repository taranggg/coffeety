import {redirect} from '@shopify/remix-oxygen';

export async function action({request, context}) {
  const formData = await request.formData();
  const token = formData.get('token');

  if (token) {
    await context.customerAccount.login(token);
    return redirect('/account');
  }

  return redirect(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/account/login?client_id=${context.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID}&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(context.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL)}/account/login`,
  );
}
