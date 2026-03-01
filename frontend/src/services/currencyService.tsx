// frontend/src/services/currencyService.ts


const BASE_URL = 'https://open.er-api.com/v6/latest';


export const currencyService = {

    async convert(amount: number, from: string, to: string): Promise<number> {

        if (from === to) return amount;
        try {

            const response = await fetch(`${BASE_URL}/${from}`);
            if (!response.ok) throw new Error('Failed to fetch exchange rates');

            const data = await response.json();
            const rate = data.rates[to];
            if (!rate) throw new Error(`Rate for currency ${to} not found`);
            
            return amount * rate;

        } catch (e) {
            console.error("Currency conversion error:", e);
            return amount; // Fallback
        }

    }
    
};