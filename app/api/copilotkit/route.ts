import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const model = "gpt-4o";

const serviceAdapter = new OpenAIAdapter({
    openai,
    model,
});


const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: '/api/copilotkit',
    });

    return handleRequest(req);
};
