import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const BASE_URL = 'http://localhost:5000/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: getHeaders()
      });
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
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
        headers: getHeaders()
      });
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
      const response = await axios.put(`${BASE_URL}${endpoint}`, data, {
        headers: getHeaders()
      });
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

  return { loading, error, fetchData, postData, putData };
};
