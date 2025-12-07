import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000`;
  }

  if (Constants.platform?.android) {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = getBaseUrl();

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "1",
    name: "Starter",
    credits: 1,
    price: 1.99,
    pricePerCredit: 1.99,
  },
  {
    id: "5",
    name: "Popular",
    credits: 5,
    price: 7.99,
    pricePerCredit: 1.60,
    popular: true,
    savings: "Save 20%",
  },
  {
    id: "12",
    name: "Pro",
    credits: 12,
    price: 15.99,
    pricePerCredit: 1.33,
    savings: "Save 33%",
  },
];

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
  pack: string;
}

export interface SessionInfo {
  session_id: string;
  credits: number;
  has_improved_text: boolean;
}

export const paymentsApi = {
  /**
   * Create a Stripe Checkout session for purchasing credits
   */
  async createCheckout(sessionId: string, pack: string): Promise<CheckoutResponse> {
    try {
      console.log('💳 Creating checkout session for pack:', pack);
      
      const response = await fetch(`${API_BASE_URL}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          pack: pack,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `Failed to create checkout: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);
      return data;
    } catch (error) {
      console.error('❌ Checkout error:', error);
      throw error;
    }
  },

  /**
   * Open Stripe Checkout in browser
   */
  async openCheckout(sessionId: string, pack: string): Promise<void> {
    const { checkout_url } = await this.createCheckout(sessionId, pack);
    
    if (Platform.OS === 'web') {
      window.open(checkout_url, '_blank');
    } else {
      const canOpen = await Linking.canOpenURL(checkout_url);
      if (canOpen) {
        await Linking.openURL(checkout_url);
      } else {
        throw new Error('Cannot open checkout URL');
      }
    }
  },

  /**
   * Get session info including credit balance
   */
  async getSessionInfo(sessionId: string): Promise<SessionInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get session info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get session info error:', error);
      throw error;
    }
  },

  /**
   * Get credit pack by ID
   */
  getCreditPack(packId: string): CreditPack | undefined {
    return CREDIT_PACKS.find(p => p.id === packId);
  },
};
