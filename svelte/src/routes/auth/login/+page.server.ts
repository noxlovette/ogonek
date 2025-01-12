import { fail, type Actions } from '@sveltejs/kit';
import { ValidateAccess } from '$lib/utils';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const pass = data.get('password') as string;

        try {
            const response = await fetch(`/axum/auth/signin`, {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    pass,
                })
            });
            const { accessToken } = await response.json();

            const user = await ValidateAccess(accessToken);

            if (!user) {
                throw new Error('Login failed');
            }
            return {
                success: true,
                message: 'Login successful',
                user,
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