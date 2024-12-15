import type { Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';

const DJANGO_URL = 'http://backend-firelight:8000';

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const csrfToken = cookies.get("csrftoken");
    const sessionid = cookies.get("sessionid");
    const username = data.get('username');
    const password = data.get('password');

    try {
      const response = await fetch(`${DJANGO_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `sessionid=${sessionid}; csrftoken=${csrfToken}`,
        },
        body: new URLSearchParams({
          username: username as string,
          password: password as string,
        }),
      });

      const result:App.ResponseLogin = await response.json();

      if (response.ok) {
        // Assuming your Django API returns some form of session token or user info
        // Here you might want to set a cookie or session
        cookies.set('sessionid', result.sessionid, { 
          path: '/', 
          maxAge: 60 * 60 * 24, // One day in seconds
          httpOnly: false,
          sameSite: 'lax'
        });

        return { result };
      } else {
        return fail(400, { success: false, message: result.message || 'Login failed' });
      }
    } catch (err) {
      console.error('Login error:', err);
      return fail(500, { success: false, message: 'An error occurred while trying to log in.' });
    }
  }
};