import React, { useState } from 'react';
import { X, User, Phone, Mail, Check, AlertCircle } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user, token, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile');

      onUpdateUser(data);
      localStorage.setItem('auth_user', JSON.stringify(data));
      setMsg('Profile updated successfully!');
      setTimeout(() => {
        setMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="modal-title">My Account Profile</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body-pad">
          {msg && (
            <div className="success-banner mb-3">
              <Check className="w-4 h-4 mr-1.5" /> {msg}
            </div>
          )}

          {error && (
            <div className="auth-error-alert mb-3">
              <AlertCircle className="w-4 h-4 mr-1.5" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="input-label">Account Email (Permanent)</label>
              <div className="text-input bg-slate-100 text-slate-500 cursor-not-allowed">
                {user.email}
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                required
                className="text-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                className="text-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0199"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
