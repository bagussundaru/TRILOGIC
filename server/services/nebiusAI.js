import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialize Nebius AI client (only when API key is available)
let client = null;

function getClient() {
    if (!client && process.env.NEBIUS_API_KEY) {
        client = new OpenAI({
            baseURL: process.env.NEBIUS_API_URL || 'https://api.studio.nebius.ai/v1/',
            apiKey: process.env.NEBIUS_API_KEY,
        });
    }
    return client;
}

const MODEL = process.env.NEBIUS_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct';

// System prompt for PMO AI Assistant
const SYSTEM_PROMPT = `You are an intelligent PMO (Project Management Office) AI Assistant for Smart TRILOGIC Dashboard.

Your role is to:
1. Provide insights about project portfolio status
2. Answer questions about project health, budgets, and timelines
3. Suggest best practices for project management
4. Help identify risks and recommend mitigation strategies
5. Provide recommendations for resource allocation
6. Generate executive summaries and reports

When provided with project data context, analyze it and give specific, actionable insights.
Always be professional, concise, and helpful. Use Indonesian language when the user speaks in Indonesian.

Format your responses with:
- Clear headings when appropriate
- Bullet points for lists
- Specific numbers and percentages when discussing data
- Actionable recommendations`;

/**
 * Chat with Nebius AI
 * @param {string} userMessage - User's question
 * @param {object} context - Project/dashboard context data
 * @param {array} history - Chat history
 * @returns {string} AI response
 */
export async function chat(userMessage, context = {}, history = []) {
    try {
        const ai = getClient();
        if (!ai) {
            return 'AI Assistant tidak tersedia. Silakan konfigurasi NEBIUS_API_KEY.';
        }

        // Build messages array
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        // Add context if provided
        if (Object.keys(context).length > 0) {
            messages.push({
                role: 'system',
                content: `Current Dashboard Context:\n${JSON.stringify(context, null, 2)}`
            });
        }

        // Add chat history
        history.forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });

        // Call Nebius AI
        const response = await ai.chat.completions.create({
            model: MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Nebius AI Error:', error);
        throw new Error(`AI Assistant error: ${error.message}`);
    }
}

/**
 * Generate project summary using AI
 */
export async function generateProjectSummary(project) {
    const prompt = `Buatkan ringkasan eksekutif singkat untuk proyek berikut:
    
Nama: ${project.name}
Status: ${project.status}
Health: ${project.health_status}
Progress: ${project.completion_percentage}%
Budget: Rp ${project.budget_allocated?.toLocaleString()} (Terpakai: ${project.budget_spent?.toLocaleString()})
Timeline: ${project.start_date} - ${project.target_end_date}

Berikan dalam format:
1. Status Overview (1 kalimat)
2. Key Highlights (2-3 poin)
3. Recommendations (1-2 poin)`;

    return await chat(prompt);
}

/**
 * Analyze portfolio risks
 */
export async function analyzePortfolioRisks(projects) {
    const atRiskProjects = projects.filter(p =>
        p.health_status === 'At Risk' || p.health_status === 'Critical'
    );

    const prompt = `Analisis risiko portfolio proyek berikut:

Total Proyek: ${projects.length}
Proyek At Risk/Critical: ${atRiskProjects.length}

Detail proyek berisiko:
${atRiskProjects.map(p => `- ${p.name}: ${p.health_status}, Progress: ${p.completion_percentage}%`).join('\n')}

Berikan:
1. Risk Assessment Summary
2. Root Cause Analysis (kemungkinan)
3. Recommended Actions
4. Priority Matrix`;

    return await chat(prompt);
}

export default { chat, generateProjectSummary, analyzePortfolioRisks };
