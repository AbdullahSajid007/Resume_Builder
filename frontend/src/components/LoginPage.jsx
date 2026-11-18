import React, { useState, useEffect } from 'react';
import { 
  FileText, LogIn, UserPlus, Sparkles, ArrowRight, 
  CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, 
  Briefcase, Code2, Layout, GraduationCap, Palette
} from 'lucide-react';

export default function LoginPage({ 
  onAuthSuccess, 
  onNavigateToBuilder 
}) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoLoading, setActiveDemoLoading] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);

  // Fetch demo users metadata
  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then(res => res.json())
      .then(data => setDemoUsers(data))
      .catch(() => {
        // Fallback local list
        setDemoUsers([
          {
            email: "demo@candidate.com",
            name: "Alex Morgan",
            role: "Senior Full-Stack & Cloud Systems Architect",
            badge: "Tech Lead / Senior Dev",
            avatar: "AM",
            template_name: "modern",
            theme_color: "#1e3a8a",
            description: "5+ years building scalable microservices and reactive SPAs with Python, FastAPI, and React.",
            skills: ["Python & FastAPI", "React & TS", "PostgreSQL", "Docker", "System Design"]
          },
          {
            email: "sarah.jenkins@demo.com",
            name: "Sarah Jenkins",
            role: "Senior Technical Product Manager",
            badge: "Product Management",
            avatar: "SJ",
            template_name: "executive",
            theme_color: "#065f46",
            description: "Data-driven PM with 7+ years delivering enterprise SaaS, AI products, and cross-functional leadership.",
            skills: ["Roadmap Strategy", "Agile & Scrum", "Data Analytics", "User Research", "Go-To-Market"]
          },
          {
            email: "david.chen@demo.com",
            name: "David Chen",
            role: "Lead UI/UX & Product Designer",
            badge: "UI/UX & Design",
            avatar: "DC",
            template_name: "creative",
            theme_color: "#581c87",
            description: "Design lead creating intuitive mobile & web design systems, user journeys, and high-fidelity prototypes.",
            skills: ["Figma", "Design Systems", "Wireframing", "Prototyping", "Accessibility (WCAG)"]
          },
          {
            email: "emily.taylor@demo.com",
            name: "Emily Taylor",
            role: "Junior Software Engineer",
            badge: "Fresh Graduate",
            avatar: "ET",
            template_name: "classic",
            theme_color: "#881337",
            description: "Summa Cum Laude CS graduate with strong foundations in algorithms, object-oriented programming, and web development.",
            skills: ["Java & Python", "Data Structures", "Algorithms", "Git & GitHub", "SQL"]
          }
        ]);
      });
  }, []);

  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = tab === 'login' 
      ? { email, password }
      : { name, email, password, phone };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.access_token);
      onNavigateToBuilder();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (persona) => {
    setError('');
    setActiveDemoLoading(persona.email);

    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: persona.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Demo login failed');

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      // Fetch this user's primary resume
      const resResume = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      let resumeData = null;
      if (resResume.ok) {
        const resumes = await resResume.json();
        if (resumes.length > 0) {
          const detailRes = await fetch(`/api/resumes/${resumes[0].id}`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          });
          if (detailRes.ok) {
            resumeData = await detailRes.json();
          }
        }
      }

      onAuthSuccess(data.user, data.access_token, resumeData);
      onNavigateToBuilder();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setActiveDemoLoading(null);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top Bar */}
      <nav className="login-top-bar">
        <div className="logo-badge">
          <FileText className="logo-icon" />
          <span className="logo-title">ResumeCraft</span>
        </div>
        <button 
          className="nav-btn btn-secondary"
          onClick={onNavigateToBuilder}
          title="Return to the resume editor"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Continue as Guest</span>
        </button>
      </nav>

      {/* Main Container */}
      <div className="login-content-container">
        {/* Page Hero */}
        <div className="login-page-header">
          <h1 className="login-main-heading">Sign In or Explore Demo Accounts</h1>
          <p className="login-sub-heading">
            Access your saved CVs with cloud auto-save, or test instant pre-configured profiles for different career tracks.
          </p>
        </div>

        {error && (
          <div className="auth-error-alert max-w-4xl mx-auto mb-6">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="login-split-grid">
          {/* Left Column: Form Auth */}
          <div className="login-card-box">
            <div className="login-card-tabs">
              <button
                className={`login-card-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                <LogIn className="w-4 h-4 mr-1.5" /> Sign In
              </button>
              <button
                className={`login-card-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError(''); }}
              >
                <UserPlus className="w-4 h-4 mr-1.5" /> Register Free
              </button>
            </div>

            <form onSubmit={handleStandardAuth} className="login-form-body">
              {tab === 'register' && (
                <div className="form-group mb-3">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="text-input"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group mb-3">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="text-input"
                  placeholder="e.g. you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group mb-3">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="text-input"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {tab === 'register' && (
                <div className="form-group mb-3">
                  <label className="input-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="text-input"
                    placeholder="+1 555 0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (tab === 'login' ? 'Sign In to My Account' : 'Create Free Account')}
              </button>
            </form>

            <div className="login-card-footer">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
              <span>Passwords secured with PBKDF2 HMAC SHA-256 + 16-byte random salts.</span>
            </div>
          </div>

          {/* Right Column: Demo User Personas */}
          <div className="demo-personas-box">
            <div className="demo-box-header">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-lg text-slate-800">1-Click Demo Login</h3>
              </div>
              <span className="badge-pill bg-blue-100 text-blue-700 text-xs">Evaluator Mode</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select any pre-configured candidate persona to log in instantly without entering credentials. Each persona loads their tailored CV, design template, and color theme.
            </p>

            <div className="demo-cards-list">
              {demoUsers.map((persona) => {
                const isLoading = activeDemoLoading === persona.email;
                return (
                  <div key={persona.email} className="demo-persona-card">
                    <div className="persona-card-top">
                      <div 
                        className="persona-avatar-circle"
                        style={{ backgroundColor: persona.theme_color }}
                      >
                        {persona.avatar || persona.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="persona-info">
                        <div className="flex items-center gap-2">
                          <h4 className="persona-name">{persona.name}</h4>
                          <span className="badge-pill text-2xs">{persona.badge}</span>
                        </div>
                        <p className="persona-role">{persona.role}</p>
                      </div>
                    </div>

                    <p className="persona-desc">{persona.description}</p>

                    <div className="persona-tags-row">
                      {persona.skills && persona.skills.slice(0, 4).map((sk) => (
                        <span key={sk} className="persona-skill-chip">{sk}</span>
                      ))}
                    </div>

                    <div className="persona-card-bottom">
                      <span className="persona-meta">
                        Template: <b className="capitalize">{persona.template_name}</b> &bull;
                        Theme: <span className="inline-block w-2.5 h-2.5 rounded-full ml-1" style={{ backgroundColor: persona.theme_color }} />
                      </span>
                      <button
                        className="launch-demo-btn"
                        onClick={() => handleDemoLogin(persona)}
                        disabled={isLoading}
                      >
                        <span>{isLoading ? 'Loading...' : `Launch as ${persona.name.split(' ')[0]}`}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
