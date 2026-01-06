// Type declarations for Next.js API routes
// These routes are designed for a separate Next.js server deployment

declare module 'next' {
    export interface NextApiRequest {
        method?: string;
        headers: {
            [key: string]: string | string[] | undefined;
            authorization?: string;
            'x-nowpayments-sig'?: string;
        };
        body: any;
        query: { [key: string]: string | string[] };
        on(event: string, callback: (data?: any) => void): void;
    }

    export interface NextApiResponse<T = any> {
        status(code: number): NextApiResponse<T>;
        json(data: T): void;
        send(data: any): void;
        end(): void;
    }
}
