'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    const specUrl = '/api/openapi.json';
    return (
        <div style={{ maxWidth: '100%', background: '#fff' }}>
            <SwaggerUI url={specUrl} docExpansion="list" defaultModelsExpandDepth={0} />
        </div>
    );
}
