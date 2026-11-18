import React, { useState, useEffect } from 'react';
import { X, Plus, Copy, Trash2, Edit3, FolderOpen, Calendar, Check, AlertCircle } from 'lucide-react';

export default function ResumeManagerModal({
  isOpen,
  onClose,
  token,
  activeResumeId,
  onSelectResume,
  onCreateNewResume
}) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchResumes = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not fetch resumes');
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchResumes();
    }
  }, [isOpen, token]);

  const handleDuplicate = async (id) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      setActionMsg('Resume duplicated successfully');
      fetchResumes();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this resume?')) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setActionMsg('Resume deleted successfully');
      fetchResumes();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h3 className="modal-title">My Saved Resumes</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body-pad">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">
              Manage your created CVs, duplicate them for different job roles, or create a new one.
            </p>
            <button
              className="add-btn"
              onClick={() => {
                onCreateNewResume();
                onClose();
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> New Resume
            </button>
          </div>

          {actionMsg && (
            <div className="success-banner mb-3">
              <Check className="w-4 h-4 mr-1.5" /> {actionMsg}
            </div>
          )}

          {error && (
            <div className="auth-error-alert mb-3">
              <AlertCircle className="w-4 h-4 mr-1.5" /> {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading your resumes...</div>
          ) : resumes.length === 0 ? (
            <div className="empty-state-box">
              <FolderOpen className="w-10 h-10 text-slate-300 mb-2" />
              <p>No resumes stored yet.</p>
              <button
                className="add-btn mt-3"
                onClick={() => {
                  onCreateNewResume();
                  onClose();
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Create Your First Resume
              </button>
            </div>
          ) : (
            <div className="resumes-list-grid">
              {resumes.map(r => (
                <div 
                  key={r.id} 
                  className={`resume-manage-card ${activeResumeId === r.id ? 'active-resume' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{r.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-pill uppercase text-2xs">{r.template_name}</span>
                        <span 
                          className="w-3 h-3 rounded-full inline-block border border-slate-300" 
                          style={{ backgroundColor: r.theme_color }} 
                          title={`Theme: ${r.theme_color}`}
                        />
                        {r.is_draft && <span className="badge-pill bg-amber-100 text-amber-800 text-2xs">Draft</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-2xs text-slate-400 flex items-center gap-1 mb-3">
                    <Calendar className="w-3 h-3" />
                    Updated {new Date(r.updated_at).toLocaleDateString()} at {new Date(r.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="resume-card-actions">
                    <button
                      className="card-action-btn edit-action"
                      onClick={() => {
                        onSelectResume(r.id);
                        onClose();
                      }}
                      title="Load and edit this resume"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      <span>{activeResumeId === r.id ? 'Active' : 'Open'}</span>
                    </button>

                    <button
                      className="card-action-btn dup-action"
                      onClick={() => handleDuplicate(r.id)}
                      title="Duplicate this resume"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      className="card-action-btn del-action"
                      onClick={() => handleDelete(r.id)}
                      title="Delete resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
