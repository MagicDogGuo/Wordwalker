import React, { useState } from 'react';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';
import './SubscribeForm.css';

const SubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await httpClient.post(API_ENDPOINTS.SUBSCRIBERS.SUBSCRIBE, { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.message || 'Subscription failed, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscribe-section">
      <h3>Subscribe to Newsletter</h3>
      <p>Get the latest articles and updates delivered to your inbox</p>
      
      <form onSubmit={handleSubmit} className="subscribe-form">
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SubscribeForm; 