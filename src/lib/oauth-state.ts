import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

type StatePayload = Record<string, unknown>;

type SignedStatePayload<T extends StatePayload> = T & {
    iat: number;
    exp: number;
    nonce: string;
};

const DEFAULT_TTL_SECONDS = 60 * 10;

function getStateSecret(): string {
    const secret = process.env.OAUTH_STATE_SECRET ?? process.env.NEXT_APPWRITE_KEY;

    if (!secret) {
        throw new Error('Missing OAuth state secret');
    }

    return secret;
}

function toBase64Url(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(value: string): Buffer {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (normalized.length % 4)) % 4;
    return Buffer.from(normalized + '='.repeat(padding), 'base64');
}

function getSignature(payloadPart: string): Buffer {
    return createHmac('sha256', getStateSecret()).update(payloadPart).digest();
}

export function createSignedOAuthState<T extends StatePayload>(
    payload: T,
    ttlSeconds = DEFAULT_TTL_SECONDS,
): { state: string; nonce: string } {
    const issuedAt = Math.floor(Date.now() / 1000);
    const nonce = randomUUID();

    const signedPayload: SignedStatePayload<T> = {
        ...payload,
        iat: issuedAt,
        exp: issuedAt + ttlSeconds,
        nonce,
    };

    const payloadPart = toBase64Url(Buffer.from(JSON.stringify(signedPayload), 'utf-8'));
    const signaturePart = toBase64Url(getSignature(payloadPart));

    return {
        state: `${payloadPart}.${signaturePart}`,
        nonce,
    };
}

export function verifySignedOAuthState<T extends StatePayload>(
    state: string,
    expectedNonce?: string,
): SignedStatePayload<T> | null {
    const [payloadPart, signaturePart, extraPart] = state.split('.');

    if (!payloadPart || !signaturePart || extraPart) {
        return null;
    }

    let receivedSignature: Buffer;
    try {
        receivedSignature = fromBase64Url(signaturePart);
    } catch {
        return null;
    }

    const expectedSignature = getSignature(payloadPart);

    if (receivedSignature.length !== expectedSignature.length) {
        return null;
    }

    if (!timingSafeEqual(receivedSignature, expectedSignature)) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(fromBase64Url(payloadPart).toString('utf-8'));
    } catch {
        return null;
    }

    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    const payload = parsed as Partial<SignedStatePayload<T>>;

    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number' || typeof payload.nonce !== 'string') {
        return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.iat > now + 60 || payload.exp < now || payload.exp <= payload.iat) {
        return null;
    }

    if (expectedNonce && payload.nonce !== expectedNonce) {
        return null;
    }

    return payload as SignedStatePayload<T>;
}
