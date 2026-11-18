import React from 'react';
import { 
  FileText, Download, Printer, Save, CheckCircle, Clock, 
  FolderOpen, User, LogIn, LogOut, Sparkles, AlertCircle 
} from 'lucide-react';

export default function Navbar({
  resume,
  setResume,
  saveStatus,
  user,
  onOpenAuth,
  onLogout,
  onOpenResumes,
  onOpenProfile,
  onDownloadPdf,
  onPrint,
  onLoadSample,
  isDownloading,
  validationError
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="logo-badge">
          <FileText className="logo-icon" />
          <span className="logo-title">ResumeCraft</span>
        </div>

        <input
          type="text"
          className="resume-title-input"
          value={resume.title}
          onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Resume Title"
          title="Click to rename resume"
        />

        <div className="save-status-badge">
          {saveStatus === 'saving' && (
            <span className="status-saving">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="status-saved">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {saveStatus === 'draft' && (
            <span className="status-draft">
              <Save className="w-3.5 h-3.5" /> Draft in DB
            </span>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="nav-btn btn-secondary"
          onClick={onLoadSample}
          title="Pre-populate with sample candidate information"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Load Sample</span>
        </button>

        {user && (
          <button
            className="nav-btn btn-secondary"
            onClick={onOpenResumes}
            title="Manage all your saved resumes"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>My CVs</span>
          </button>
        )}

        <button
          className="nav-btn btn-secondary"
          onClick={onPrint}
          title="Print or Save via Browser"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>

        <button
          className="nav-btn btn-primary"
          onClick={onDownloadPdf}
          disabled={isDownloading}
          title="Generate and Download official PDF document"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
        </button>

        {user ? (
          <div className="user-profile-menu">
            <button 
              className="user-badge-btn" 
              onClick={onOpenProfile} 
              title="View and edit profile"
            >
              <div className="user-avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-text">{user.name.split(' ')[0]}</span>
            </button>
            <button 
              className="logout-icon-btn" 
              onClick={onLogout} 
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            className="nav-btn btn-auth"
            onClick={onOpenAuth}
            title="Sign in or create account to save multiple CVs"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
