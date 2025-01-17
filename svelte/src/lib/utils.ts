export const formatDateTime = (isoString: string): string => {
	const date = new Date(isoString);

	return new Intl.DateTimeFormat('en-GB', {
		// year: 'numeric',
		month: 'short',
		day: 'numeric',
		// hour: 'numeric',
		// minute: 'numeric',
		// hour12: true
	}).format(date);
};

export function getGreeting() {
	const date = new Date();
	const hours = date.getHours();

	if (hours >= 5 && hours < 12) {
		return 'morning ☕';
	} else if (hours >= 12 && hours < 18) {
		return 'afternoon ☀️';
	} else if (hours >= 18 && hours < 22) {
		return 'evening 🌖';
	} else {
		return 'night 😴';
	}
}


import { importSPKI, jwtVerify } from 'jose';
import { env } from '$env/dynamic/public';

export async function ValidateAccess(jwt: string) {
	const spki = env.PUBLIC_spki || '';
	const alg = env.PUBLIC_alg || 'RS256';
	const publicKey = await importSPKI(spki, alg);

	const { payload } = await jwtVerify(jwt, publicKey, {
		issuer: 'auth:auth',
	});

	// Add a buffer time (e.g., 30 seconds) to refresh before actual expiry
	const EXPIRY_BUFFER = 30; // seconds
	if (payload.exp && typeof payload.exp === 'number') {
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp - now < EXPIRY_BUFFER) {
			throw new Error('Token about to expire');
		}
	}

	return payload;
}

import { createAvatar } from '@dicebear/core';
import { lorelei, thumbs } from '@dicebear/collection';

export function getAvatar(seed: string) {
	const avatar = createAvatar(thumbs, {
		seed,
	});

	return avatar.toDataUri();
}

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeFormat from 'rehype-format'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'


export async function parseMarkdown(content: string) {
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeFormat)
		.use(rehypeSanitize)
		.use(rehypeStringify)

	const result = await processor.process(content);
	return String(result);
}