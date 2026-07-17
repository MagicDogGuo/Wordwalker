import React, { useState } from 'react';
import { useSubscribe } from '../hooks/useSubscribe';
import './SubscribeForm.css';

const SubscribeForm = () => {
  const [email, setEmail] = useState('');
  const subscribe = useSubscribe();

  const handleSubmit = (e) => {
    e.preventDefault();
    subscribe.mutate(email, {
      onSuccess: () => setEmail('')
    });
  };

  const message = subscribe.data?.message;
  const errorMessage = subscribe.isError
    ? (subscribe.error.response?.data?.message || 'Subscription failed, please try again later')
    : '';

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
            disabled={subscribe.isPending}
          />
          <button type="submit" disabled={subscribe.isPending}>
            {subscribe.isPending ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </form>
    </div>
  );
};

export default SubscribeForm;
