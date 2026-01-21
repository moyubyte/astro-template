import type { APIRoute } from 'astro';
import { getEdgeOneLocation } from '../../utils/geo-helper';

export const GET: APIRoute = async (context) => {
    const location = getEdgeOneLocation(context);

    // 收集调试信息，帮助定位数据到底在哪里
    const debugInfo = {
        hasContextGeo: !!(context as any).geo,
        hasLocalsGeo: !!(context.locals && (context.locals as any).geo),
        hasRequestEo: !!((context.request as any).eo),
        keys: Object.keys(context),
        localsKeys: context.locals ? Object.keys(context.locals) : [],
    };

    return new Response(JSON.stringify({
        location,
        debug: debugInfo
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
