// frontend/src/services/api.ts


const API_BASE_URL = 'http://localhost:8000';


export const API = {

    async get<T>(endpoint: string): Promise<T> {

        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            if (response.status === 204) return [] as any;
            throw new Error(`Error Status: ${response.status}`);
        }
        return response.json();

    }

};