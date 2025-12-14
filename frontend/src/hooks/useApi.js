import { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { useNotification } from '../context/NotificationContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchData = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [showNotification]);

  const postData = useCallback(async (endpoint, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(endpoint, data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [showNotification]);

  const putData = useCallback(async (endpoint, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(endpoint, data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [showNotification]);

  const wrapRequest = useCallback(async (promise) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promise;
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [showNotification]);

  return { loading, error, fetchData, postData, putData, wrapRequest };
};
