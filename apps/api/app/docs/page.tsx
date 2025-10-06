'use client';

import dynamic from 'next/dynamic';
// Import Swagger UI on the client only (no SSR) and treat it as a React component
const SwaggerUI: any = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
    // Point to your OpenAPI JSON endpoint
    const specUrl =
        process.env.NEXT_PUBLIC_OPENAPI_URL ??
        `${process.env.NEXT_PUBLIC_API_URL ?? ''}/openapi.json`; // adjust if needed

    return (
        <div style={{ maxWidth: '100%', background: '#fff' }}>
            <SwaggerUI url={specUrl} docExpansion="list" defaultModelsExpandDepth={0} />
        </div>
    );
}
