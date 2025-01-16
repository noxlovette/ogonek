import { env } from '$env/dynamic/private';
import type { Handle, HandleFetch } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const path = event.url.pathname;
   if (path.startsWith('/auth/login') || path.startsWith('/axum/auth/signin') || path.startsWith('/axum/auth/refresh')) {
   let response = await resolve(event);
   return response;
   }
   const refreshToken = event.cookies.get('refreshToken');
   if (!refreshToken) {
   return new Response('Unauthorized', {
    status: 303,
    headers: {
    location: '/auth/login',
   },
   });
   }
   const response = await resolve(event);
   if (response.status === 401 && event.cookies.get('refreshToken')) {
   try {
   const refreshRes = await event.fetch("/axum/auth/refresh");
   if (!refreshRes.ok) {
   throw new Error('Failed to refresh token');
   }
   const setCookieHeaders = refreshRes.headers.getSetCookie();
   const newResponse = new Response(response.body, response);
    setCookieHeaders.forEach(cookie => {
    newResponse.headers.append('set-cookie', cookie);
   });
   return newResponse;
   } catch (error) {
    console.error('Refresh token flow failed:', error);
   return await resolve(event);
   }
   } else if (response.status === 401) {
   return await resolve(event);
   }
   return response;
   };


   export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    const url = new URL(request.url);
  
  if (url.pathname.startsWith('/axum/')) {
    // Remove the /axum/ prefix and construct the new URL
    const cleanPath = url.pathname.replace('/axum/', '/');
    const newUrl = new URL(cleanPath, 'http://axum:3000');
    request = new Request(newUrl, request);
  }
  
    // Your existing header logic
    request.headers.set("X-API-KEY", env.API_KEY_AXUM);
    request.headers.set("Content-Type", "application/json");
    
    const accessToken = event.cookies.get("accessToken");
    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }
  
    return fetch(request);
  };