// src/middleware/axiosInterceptor.js

import axios from 'axios';
import { store } from '../redux/store';
import { logoutSuccess } from '@/redux/reducers/userSlice';

function resolveApiBaseUrl() {
  const endpoint = process.env.NEXT_PUBLIC_END_POINT ?? 'laravel-api';

  // Browser: same-origin relative URL (works on Mac localhost and phone LAN IP)
  if (typeof window !== 'undefined') {
    return `/${endpoint}/`;
  }

  // Server: talk to Laravel directly
  const laravel = process.env.LARAVEL_DEV_URL ?? 'http://127.0.0.1:8000';
  return `${laravel.replace(/\/$/, '')}/api/`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000,
});

const getStoredToken = async () => {
  try {
    const state = store.getState();
    if (!state) return null;
    return state.user.token || null;
  } catch (error) {
    console.warn('Store not initialized yet:', error);
    return null;
  }
};

const getCurrentLanguageCode = () => {
  try {
    const state = store.getState();
    if (!state) {
      return { langCode: 'en', currencyCode: undefined };
    }

    const currentLangCode = state.language?.currentLanguage;
    const currentCurrencyCode = state.currency?.currentCurrency?.currency_code;

    return {
      langCode: currentLangCode?.code ?? 'en',
      currencyCode: currentCurrencyCode,
    };
  } catch (error) {
    console.warn('Store not initialized yet:', error);
    return { langCode: 'en', currencyCode: undefined };
  }
};

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const currentLanguage = getCurrentLanguageCode();
      if (currentLanguage.currencyCode) {
        config.headers['Accept-Currency'] = currentLanguage.currencyCode;
      }
      config.headers['Accept-Language'] = currentLanguage.langCode ?? 'en';

      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      } else {
        delete config.headers['Content-Type'];
      }

      return config;
    } catch (error) {
      console.error('Error in token retrieval:', error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('401 Unauthorized - Logging out user...');
      store.dispatch(logoutSuccess());
      return Promise.reject(error);
    }

    if (status >= 400 && status < 500 && error.response?.data) {
      return Promise.resolve(error.response);
    }

    return Promise.reject(error);
  },
);

export default api;
