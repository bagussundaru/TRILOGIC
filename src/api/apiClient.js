// API Client for Smart TRILOGIC Backend
// Use the server's public IP for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://103.189.234.15:3001/api';

// Generic fetch wrapper
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// API Service for AI
export const aiAPI = {
    async chat(message, history = []) {
        const result = await fetchAPI('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history })
        });
        return result.data?.message || result.data;
    },

    async generateProjectSummary(projectId) {
        const result = await fetchAPI('/ai/project-summary', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId })
        });
        return result.data;
    },

    async analyzePortfolioRisks() {
        const result = await fetchAPI('/ai/portfolio-risks', {
            method: 'POST'
        });
        return result.data;
    }
};

// API Service for Projects
export const projectsAPI = {
    async list(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const result = await fetchAPI(`/projects?${queryString}`);
        return result.data || [];
    },

    async get(id) {
        const result = await fetchAPI(`/projects/${id}`);
        return result.data;
    },

    async create(data) {
        const result = await fetchAPI('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result.data;
    },

    async update(id, data) {
        const result = await fetchAPI(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return result.data;
    },

    async delete(id) {
        return await fetchAPI(`/projects/${id}`, { method: 'DELETE' });
    },

    async getStats() {
        const result = await fetchAPI('/projects/stats/summary');
        return result.data;
    }
};

// API Service for Tasks
export const tasksAPI = {
    async list(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const result = await fetchAPI(`/tasks?${queryString}`);
        return result.data || [];
    },

    async create(data) {
        const result = await fetchAPI('/tasks', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result.data;
    },

    async update(id, data) {
        const result = await fetchAPI(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return result.data;
    },

    async delete(id) {
        return await fetchAPI(`/tasks/${id}`, { method: 'DELETE' });
    },

    async getStats() {
        const result = await fetchAPI('/tasks/stats/summary');
        return result.data;
    }
};

// API Service for Resources
export const resourcesAPI = {
    async list(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const result = await fetchAPI(`/resources?${queryString}`);
        return result.data || [];
    },

    async create(data) {
        const result = await fetchAPI('/resources', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result.data;
    },

    async update(id, data) {
        const result = await fetchAPI(`/resources/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return result.data;
    },

    async delete(id) {
        return await fetchAPI(`/resources/${id}`, { method: 'DELETE' });
    },

    async getCapacityStats() {
        const result = await fetchAPI('/resources/stats/capacity');
        return result.data;
    }
};

// API Service for Dashboard
export const dashboardAPI = {
    async getSummary() {
        const result = await fetchAPI('/dashboard');
        return result.data;
    },

    async healthCheck() {
        return await fetchAPI('/health');
    }
};

export default {
    ai: aiAPI,
    projects: projectsAPI,
    tasks: tasksAPI,
    resources: resourcesAPI,
    dashboard: dashboardAPI
};
