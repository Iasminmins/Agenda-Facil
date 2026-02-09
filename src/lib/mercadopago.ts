// Mercado Pago Integration Helper via Supabase Edge Function - ASSINATURAS

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface PaymentPreference {
  title: string;
  unit_price: number;
  quantity: number;
  currency_id: string;
}

export const createPaymentLink = async (plan: 'essencial' | 'profissional') => {
  try {
    // Usando a função de ASSINATURA com 1 mês grátis
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar assinatura');
    }

    const data = await response.json();
    return data.init_point; // URL de checkout do Mercado Pago
  } catch (error) {
    console.error('Erro ao criar link de assinatura:', error);
    throw error;
  }
};
