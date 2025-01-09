import { fail, type Actions } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        try {
            const data = await request.formData();
            const username = data.get('username') as string;
            const pass = data.get('password') as string; 
                       
            const response = await fetch(`${env.BACKEND_URL}/auth/signin`, {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    pass,
                })
            });

            console.log('response:', response);
            if (!response.ok) {
                throw new Error('Login failed');
            }


            const { accessToken, token_type } = await response.json();
            return {
                success: true,
                message: 'Login successful',
                accessToken,
                token_type,
            };

        } catch (error) {
            console.error('Signin error:', error);
            return fail(400, { 
                success: false, 
                message: error instanceof Error ? error.message : 'Login failed' 
            });
        }
    }
};