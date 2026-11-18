import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import AuthModal from './components/AuthModal';
import ResumeManagerModal from './components/ResumeManagerModal';
import ProfileModal from './components/ProfileModal';
import { initialEmptyResume, sampleCandidateResume } from './sampleData';
import './App.css';

export default function App() {
  const [resume, setResume] = useState(() => {
    const saved = localStorage.getItem('local_resume_draft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return sampleCandidateResume;
  });

  const [activeResumeId, setActiveResumeId] = useState(() => {
    const id = localStorage.getItem('active_resume_id');
    return id ? parseInt(id, 10) : null;
  });

  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('auth_user');
    return u ? JSON.parse(u) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'draft'
  const [missingFields, setMissingFields] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [resumesModalOpen, setResumesModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Auto-save debounce timer ref
  const autoSaveTimerRef = useRef(null);

  // Validate active user token on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token expired');
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      })
      .catch(() => {
        // clear expired session
        setUser(null);
        setToken('');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      });
    }
  }, []);

  // Check mandatory fields whenever personal info changes
  useEffect(() => {
    const missing = [];
    if (!resume.personal_info?.full_name?.trim()) missing.push('Full Name');
    if (!resume.personal_info?.email?.trim()) missing.push('Email Address');
    if (!resume.personal_info?.phone?.trim()) missing.push('Phone Number');
    if (!resume.personal_info?.professional_title?.trim()) missing.push('Professional Title');
    setMissingFields(missing);
  }, [resume.personal_info]);

  // Persistent Auto-Save Effect (Local Storage + Backend DB autosave)
  useEffect(() => {
    // 1. Instant local persistence
    localStorage.setItem('local_resume_draft', JSON.stringify(resume));
    setSaveStatus('saving');

    // 2. Debounced server persistence
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const queryParam = activeResumeId ? `?resume_id=${activeResumeId}` : '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/resumes/autosave${queryParam}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(resume)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.id && data.id !== activeResumeId) {
            setActiveResumeId(data.id);
            localStorage.setItem('active_resume_id', data.id.toString());
          }
          setSaveStatus(token ? 'saved' : 'draft');
        } else {
          setSaveStatus('draft');
        }
      } catch (err) {
        setSaveStatus('draft');
      }
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [resume, token, activeResumeId]);

  // Auth Success Handler
  const handleAuthSuccess = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // Switch / Load Resume from DB
  const handleSelectResume = async (id) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/resumes/${id}`, { headers });
      if (!res.ok) throw new Error('Could not load resume');
      const data = await res.json();
      setResume(data);
      setActiveResumeId(data.id);
      localStorage.setItem('active_resume_id', data.id.toString());
    } catch (err) {
      alert(`Error loading resume: ${err.message}`);
    }
  };

  // Create New Resume
  const handleCreateNewResume = () => {
    setResume({
      ...initialEmptyResume,
      title: 'New Resume ' + new Date().toLocaleDateString()
    });
    setActiveResumeId(null);
    localStorage.removeItem('active_resume_id');
  };

  // Load Pre-populated Sample
  const handleLoadSample = () => {
    setResume(sampleCandidateResume);
    setActiveResumeId(null);
    localStorage.removeItem('active_resume_id');
  };

  // Download PDF Handler
  const handleDownloadPdf = async () => {
    if (missingFields.length > 0) {
      alert(`Cannot generate PDF. Please fill in all mandatory fields first:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail?.message || 'PDF export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (resume.personal_info.full_name || 'Resume').replace(/\s+/g, '_');
      a.download = `${cleanName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Failed to download PDF: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        resume={resume}
        setResume={setResume}
        saveStatus={saveStatus}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenResumes={() => setResumesModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        onLoadSample={handleLoadSample}
        isDownloading={isDownloading}
        validationError={missingFields.length > 0}
      />

      {/* Main Split-Screen Workspace */}
      <main className="workspace-main">
        {/* Left Side: Form Editor Pane */}
        <section className="pane-left">
          <EditorPane
            resume={resume}
            setResume={setResume}
            missingFields={missingFields}
          />
        </section>

        {/* Right Side: Live Formatted Preview Pane */}
        <section className="pane-right">
          <PreviewPane
            resume={resume}
            missingFields={missingFields}
            onDownloadPdf={handleDownloadPdf}
            isDownloading={isDownloading}
          />
        </section>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ResumeManagerModal
        isOpen={resumesModalOpen}
        onClose={() => setResumesModalOpen(false)}
        token={token}
        activeResumeId={activeResumeId}
        onSelectResume={handleSelectResume}
        onCreateNewResume={handleCreateNewResume}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        token={token}
        onUpdateUser={(updated) => setUser(updated)}
      />
    </div>
  );
}
