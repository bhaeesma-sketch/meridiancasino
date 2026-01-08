/**
 * Fingerprint Service - Generates a unique, persistent hash of the user's browser/hardware configuration.
 * This is used for anti-fraud and preventing referral farming.
 */

export const getDeviceFingerprint = async (): Promise<string> => {
    try {
        const components = [
            navigator.userAgent,
            navigator.language,
            window.screen.width,
            window.screen.height,
            window.screen.colorDepth,
            new Date().getTimezoneOffset(),
            (navigator as any).deviceMemory || 'unknown',
            (navigator as any).hardwareConcurrency || 'unknown',
            // Canvas Fingerprinting
            getCanvasFingerprint()
        ];

        const dataString = components.join('|');
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataString));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    } catch (e) {
        console.warn("Fingerprinting failed, using fallback:", e);
        return 'FP-FALLBACK-' + Math.random().toString(36).substring(7);
    }
};

const getCanvasFingerprint = (): string => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("QuantumLegacy-Fingerprint", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Compliance-v1", 4, 17);

        return canvas.toDataURL();
    } catch (e) {
        return 'canvas-error';
    }
};
