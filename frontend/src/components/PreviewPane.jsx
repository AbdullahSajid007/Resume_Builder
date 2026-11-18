import React, { useState } from 'react';
import { 
  ZoomIn, ZoomOut, Download, AlertTriangle, 
  ExternalLink, Mail, Phone, MapPin, Globe, 
  Link as LinkIcon, Code2, Award, Share2
} from 'lucide-react';

export default function PreviewPane({ 
  resume, 
  missingFields = [], 
  onDownloadPdf, 
  isDownloading 
}) {
  const [zoom, setZoom] = useState(100);

  const { personal_info: info, educations, experiences, skills, projects, certifications, theme_color, template_name } = resume;

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(130, Math.max(70, prev + delta)));
  };

  return (
    <div className="preview-container">
      {/* Top Preview Toolbar */}
      <div className="preview-toolbar">
        <div className="toolbar-left">
          <span className="preview-badge">Live Preview &bull; {template_name.toUpperCase()}</span>
        </div>

        <div className="toolbar-right">
          <div className="zoom-controls">
            <button className="tool-btn" onClick={() => handleZoom(-10)} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="zoom-label">{zoom}%</span>
            <button className="tool-btn" onClick={() => handleZoom(10)} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            className={`tool-download-btn ${missingFields.length > 0 ? 'btn-disabled-hint' : ''}`}
            onClick={onDownloadPdf}
            disabled={isDownloading}
            title={missingFields.length > 0 ? 'Fill required fields to download' : 'Download PDF'}
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>{isDownloading ? 'Generating...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Validation Banner */}
      {missingFields.length > 0 && (
        <div className="validation-warning-banner">
          <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
          <div className="warning-text">
            <b>PDF download requires mandatory fields:</b> {missingFields.join(', ')}.
          </div>
        </div>
      )}

      {/* A4 Sheet Paper Container */}
      <div className="preview-viewport">
        <div 
          className={`a4-paper-sheet template-${template_name}`} 
          id="resume-printable-area"
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center',
            '--theme-color': theme_color || '#1e3a8a'
          }}
        >
          {/* TEMPLATE 1: MODERN MINIMALIST */}
          {template_name === 'modern' && (
            <div className="tpl-modern">
              <header className="modern-header" style={{ borderBottomColor: theme_color }}>
                <div className="modern-header-left">
                  <h1 className="modern-name" style={{ color: theme_color }}>
                    {info.full_name || 'Your Full Name'}
                  </h1>
                  {info.professional_title && (
                    <div className="modern-title">{info.professional_title}</div>
                  )}

                  <div className="modern-contacts">
                    {info.email && (
                      <span className="contact-chip">
                        <Mail className="w-3.5 h-3.5 mr-1" /> {info.email}
                      </span>
                    )}
                    {info.phone && (
                      <span className="contact-chip">
                        <Phone className="w-3.5 h-3.5 mr-1" /> {info.phone}
                      </span>
                    )}
                    {info.location && (
                      <span className="contact-chip">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> {info.location}
                      </span>
                    )}
                  </div>

                  {(info.linkedin_url || info.github_url || info.portfolio_url || info.leetcode_url) && (
                    <div className="modern-socials">
                      {info.linkedin_url && (
                        <span className="social-chip">
                          <LinkIcon className="w-3 h-3 mr-1" /> {info.linkedin_url}
                        </span>
                      )}
                      {info.github_url && (
                        <span className="social-chip">
                          <Code2 className="w-3 h-3 mr-1" /> {info.github_url}
                        </span>
                      )}
                      {info.portfolio_url && (
                        <span className="social-chip">
                          <Globe className="w-3 h-3 mr-1" /> {info.portfolio_url}
                        </span>
                      )}
                      {info.leetcode_url && (
                        <span className="social-chip">
                          <Share2 className="w-3 h-3 mr-1" /> {info.leetcode_url}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {info.photo_url && (
                  <div className="modern-header-right">
                    <img 
                      src={info.photo_url} 
                      alt="Candidate" 
                      className="modern-avatar" 
                      style={{ borderColor: theme_color }}
                    />
                  </div>
                )}
              </header>

              {info.summary && (
                <section className="modern-section">
                  <h2 className="modern-sec-title" style={{ color: theme_color }}>Professional Summary</h2>
                  <p className="modern-summary">{info.summary}</p>
                </section>
              )}

              {experiences && experiences.length > 0 && (
                <section className="modern-section">
                  <h2 className="modern-sec-title" style={{ color: theme_color }}>Work Experience</h2>
                  {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="modern-entry">
                      <div className="entry-head-row">
                        <div>
                          <span className="entry-role">{exp.job_title}</span>
                          <span className="entry-company"> &mdash; {exp.company}</span>
                          {exp.location && <span className="entry-loc"> ({exp.location})</span>}
                        </div>
                        <span className="entry-date">
                          {exp.start_date} &ndash; {exp.is_current ? 'Present' : (exp.end_date || 'Present')}
                        </span>
                      </div>
                      {exp.responsibilities && (
                        <div className="entry-details">{exp.responsibilities}</div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {educations && educations.length > 0 && (
                <section className="modern-section">
                  <h2 className="modern-sec-title" style={{ color: theme_color }}>Education Background</h2>
                  {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="modern-entry">
                      <div className="entry-head-row">
                        <div>
                          <span className="entry-role">{edu.degree}</span>
                          <span className="entry-company"> &mdash; {edu.institution}</span>
                          {edu.location && <span className="entry-loc"> ({edu.location})</span>}
                        </div>
                        <span className="entry-date">
                          {edu.start_year ? `${edu.start_year} - ` : ''}{edu.end_year}
                        </span>
                      </div>
                      {(edu.cgpa || edu.achievements) && (
                        <div className="entry-details">
                          {edu.cgpa && <span className="font-semibold">CGPA: {edu.cgpa} &bull; </span>}
                          {edu.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {skills && skills.length > 0 && (
                <section className="modern-section">
                  <h2 className="modern-sec-title" style={{ color: theme_color }}>Skills & Proficiencies</h2>
                  <div className="modern-skills-grid">
                    {skills.map((skill, idx) => (
                      <span 
                        key={skill.id || idx} 
                        className="modern-skill-tag"
                        style={{ borderLeftColor: theme_color }}
                      >
                        <b>{skill.name}</b> <span className="text-slate-500">({skill.proficiency_level})</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {projects && projects.length > 0 && (
                <section className="modern-section">
                  <h2 className="modern-sec-title" style={{ color: theme_color }}>Key Projects</h2>
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="modern-entry">
                      <div className="entry-head-row">
                        <span className="entry-role">
                          {proj.title}
                          {proj.technologies && (
                            <span style={{ color: theme_color, fontSize: '0.82rem', fontWeight: 'normal', marginLeft: '6px' }}>
                              [{proj.technologies}]
                            </span>
                          )}
                        </span>
                        {proj.project_url && (
                          <span className="text-xs text-blue-600 truncate max-w-xs">{proj.project_url}</span>
                        )}
                      </div>
                      {proj.description && <div className="entry-details">{proj.description}</div>}
                    </div>
                  ))}
                </section>
              )}

              {certifications && certifications.length > 0 && (
                <section className="modern-section">
                  <h2 className="modern-sec-title" style={{ color: theme_color }}>Certifications</h2>
                  {certifications.map((cert, idx) => (
                    <div key={cert.id || idx} className="entry-head-row text-xs py-0.5">
                      <span><b>{cert.name}</b> {cert.issuing_org ? `— ${cert.issuing_org}` : ''}</span>
                      <span className="text-slate-500">{cert.issue_date}</span>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

          {/* TEMPLATE 2: CLASSIC PROFESSIONAL */}
          {template_name === 'classic' && (
            <div className="tpl-classic">
              <div className="classic-header">
                <h1 className="classic-name" style={{ color: theme_color }}>
                  {info.full_name || 'Your Full Name'}
                </h1>
                {info.professional_title && (
                  <div className="classic-title">{info.professional_title}</div>
                )}
                <div className="classic-contacts">
                  {info.location && <span>{info.location} &bull; </span>}
                  {info.phone && <span>{info.phone} &bull; </span>}
                  {info.email && <span>{info.email}</span>}
                </div>
                {(info.linkedin_url || info.github_url || info.portfolio_url) && (
                  <div className="classic-contacts text-xs">
                    {info.linkedin_url && <span>LinkedIn: {info.linkedin_url} &bull; </span>}
                    {info.github_url && <span>GitHub: {info.github_url} &bull; </span>}
                    {info.portfolio_url && <span>Portfolio: {info.portfolio_url}</span>}
                  </div>
                )}
              </div>

              {info.summary && (
                <div className="classic-sec">
                  <div className="classic-sec-head" style={{ color: theme_color }}>Professional Summary</div>
                  <p className="classic-desc">{info.summary}</p>
                </div>
              )}

              {experiences && experiences.length > 0 && (
                <div className="classic-sec">
                  <div className="classic-sec-head" style={{ color: theme_color }}>Professional Experience</div>
                  {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="classic-item">
                      <div className="flex justify-between font-serif">
                        <span><b>{exp.job_title}</b>, <i>{exp.company}</i> {exp.location ? `(${exp.location})` : ''}</span>
                        <span className="text-xs italic">{exp.start_date} &ndash; {exp.is_current ? 'Present' : (exp.end_date || 'Present')}</span>
                      </div>
                      {exp.responsibilities && <div className="classic-desc">{exp.responsibilities}</div>}
                    </div>
                  ))}
                </div>
              )}

              {educations && educations.length > 0 && (
                <div className="classic-sec">
                  <div className="classic-sec-head" style={{ color: theme_color }}>Education</div>
                  {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="classic-item">
                      <div className="flex justify-between font-serif">
                        <span><b>{edu.degree}</b>, <i>{edu.institution}</i></span>
                        <span className="text-xs italic">{edu.start_year ? `${edu.start_year} - ` : ''}{edu.end_year}</span>
                      </div>
                      {(edu.cgpa || edu.achievements) && (
                        <div className="classic-desc">
                          {edu.cgpa && <b>CGPA: {edu.cgpa} &bull; </b>}
                          {edu.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {skills && skills.length > 0 && (
                <div className="classic-sec">
                  <div className="classic-sec-head" style={{ color: theme_color }}>Skills & Competencies</div>
                  <div className="classic-desc">
                    {skills.map(s => `${s.name} (${s.proficiency_level})`).join('  •  ')}
                  </div>
                </div>
              )}

              {projects && projects.length > 0 && (
                <div className="classic-sec">
                  <div className="classic-sec-head" style={{ color: theme_color }}>Key Projects</div>
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="classic-item">
                      <div className="flex justify-between font-serif">
                        <span><b>{proj.title}</b> {proj.technologies ? `[${proj.technologies}]` : ''}</span>
                        {proj.project_url && <span className="text-xs">{proj.project_url}</span>}
                      </div>
                      {proj.description && <div className="classic-desc">{proj.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 3: EXECUTIVE TWO-COLUMN */}
          {template_name === 'executive' && (
            <div className="tpl-executive">
              <aside className="exec-sidebar" style={{ borderRightColor: theme_color }}>
                {info.photo_url && (
                  <div className="exec-avatar-wrap">
                    <img src={info.photo_url} alt="Profile" className="exec-avatar" style={{ borderColor: theme_color }} />
                  </div>
                )}

                <div className="exec-side-head" style={{ color: theme_color }}>Contact Details</div>
                {info.email && <div className="exec-side-item"><b>Email:</b><br />{info.email}</div>}
                {info.phone && <div className="exec-side-item"><b>Phone:</b><br />{info.phone}</div>}
                {info.location && <div className="exec-side-item"><b>Location:</b><br />{info.location}</div>}

                {(info.linkedin_url || info.github_url || info.portfolio_url || info.leetcode_url) && (
                  <>
                    <div className="exec-side-head" style={{ color: theme_color }}>Web Links</div>
                    {info.linkedin_url && <div className="exec-side-item"><b>LinkedIn:</b><br />{info.linkedin_url}</div>}
                    {info.github_url && <div className="exec-side-item"><b>GitHub:</b><br />{info.github_url}</div>}
                    {info.portfolio_url && <div className="exec-side-item"><b>Portfolio:</b><br />{info.portfolio_url}</div>}
                    {info.leetcode_url && <div className="exec-side-item"><b>LeetCode:</b><br />{info.leetcode_url}</div>}
                  </>
                )}

                {skills && skills.length > 0 && (
                  <>
                    <div className="exec-side-head" style={{ color: theme_color }}>Key Skills</div>
                    {skills.map((s, idx) => (
                      <div key={s.id || idx} className="exec-skill-line">
                        &bull; <b>{s.name}</b> <span className="text-slate-500">({s.proficiency_level})</span>
                      </div>
                    ))}
                  </>
                )}

                {certifications && certifications.length > 0 && (
                  <>
                    <div className="exec-side-head" style={{ color: theme_color }}>Certifications</div>
                    {certifications.map((c, idx) => (
                      <div key={c.id || idx} className="exec-side-item">
                        <b>{c.name}</b><br />
                        <span className="text-slate-500">{c.issuing_org} ({c.issue_date})</span>
                      </div>
                    ))}
                  </>
                )}
              </aside>

              <main className="exec-mainbar">
                <h1 className="exec-name" style={{ color: theme_color }}>
                  {info.full_name || 'Your Full Name'}
                </h1>
                {info.professional_title && (
                  <div className="exec-title">{info.professional_title}</div>
                )}

                {info.summary && (
                  <div className="exec-sec">
                    <h2 className="exec-sec-head" style={{ color: theme_color, borderBottomColor: theme_color }}>
                      Executive Summary
                    </h2>
                    <p className="exec-desc">{info.summary}</p>
                  </div>
                )}

                {experiences && experiences.length > 0 && (
                  <div className="exec-sec">
                    <h2 className="exec-sec-head" style={{ color: theme_color, borderBottomColor: theme_color }}>
                      Experience
                    </h2>
                    {experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="mb-3">
                        <div className="flex justify-between font-bold text-slate-800 text-xs">
                          <span>{exp.job_title} &mdash; <span className="font-normal text-slate-600">{exp.company}</span></span>
                          <span className="text-slate-500">{exp.start_date} - {exp.is_current ? 'Present' : (exp.end_date || 'Present')}</span>
                        </div>
                        {exp.responsibilities && <div className="exec-desc">{exp.responsibilities}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {educations && educations.length > 0 && (
                  <div className="exec-sec">
                    <h2 className="exec-sec-head" style={{ color: theme_color, borderBottomColor: theme_color }}>
                      Education
                    </h2>
                    {educations.map((edu, idx) => (
                      <div key={edu.id || idx} className="mb-2">
                        <div className="flex justify-between font-bold text-slate-800 text-xs">
                          <span>{edu.degree} &mdash; <span className="font-normal text-slate-600">{edu.institution}</span></span>
                          <span className="text-slate-500">{edu.start_year ? `${edu.start_year} - ` : ''}{edu.end_year}</span>
                        </div>
                        {(edu.cgpa || edu.achievements) && (
                          <div className="exec-desc">
                            {edu.cgpa && <b>CGPA: {edu.cgpa} &bull; </b>}
                            {edu.achievements}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {projects && projects.length > 0 && (
                  <div className="exec-sec">
                    <h2 className="exec-sec-head" style={{ color: theme_color, borderBottomColor: theme_color }}>
                      Projects
                    </h2>
                    {projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="mb-2">
                        <div className="text-xs font-bold text-slate-800">
                          {proj.title} {proj.technologies && <span style={{ color: theme_color }}>[{proj.technologies}]</span>}
                        </div>
                        {proj.description && <div className="exec-desc">{proj.description}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </div>
          )}

          {/* TEMPLATE 4: CREATIVE TECH */}
          {template_name === 'creative' && (
            <div className="tpl-creative">
              <div className="creative-hero" style={{ borderLeftColor: theme_color }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="creative-name">{info.full_name || 'Your Full Name'}</h1>
                    {info.professional_title && (
                      <div className="creative-role" style={{ color: theme_color }}>{info.professional_title}</div>
                    )}
                    <div className="creative-contacts">
                      {info.email && <span>{info.email} &bull; </span>}
                      {info.phone && <span>{info.phone} &bull; </span>}
                      {info.location && <span>{info.location}</span>}
                    </div>
                    {(info.github_url || info.linkedin_url || info.portfolio_url || info.leetcode_url) && (
                      <div className="creative-contacts text-xs">
                        {info.github_url && <span>GitHub: {info.github_url} &bull; </span>}
                        {info.linkedin_url && <span>LinkedIn: {info.linkedin_url} &bull; </span>}
                        {info.portfolio_url && <span>Portfolio: {info.portfolio_url}</span>}
                      </div>
                    )}
                  </div>
                  {info.photo_url && (
                    <img 
                      src={info.photo_url} 
                      alt="Avatar" 
                      className="creative-avatar" 
                      style={{ borderColor: theme_color }}
                    />
                  )}
                </div>
              </div>

              {info.summary && (
                <div className="creative-sec">
                  <div className="creative-head" style={{ color: theme_color }}>About Me</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{info.summary}</p>
                </div>
              )}

              {skills && skills.length > 0 && (
                <div className="creative-sec">
                  <div className="creative-head" style={{ color: theme_color }}>Core Technologies & Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, idx) => (
                      <span key={s.id || idx} className="creative-pill">
                        {s.name} &bull; {s.proficiency_level}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {experiences && experiences.length > 0 && (
                <div className="creative-sec">
                  <div className="creative-head" style={{ color: theme_color }}>Experience</div>
                  {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="mb-2.5">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{exp.job_title} <span className="font-normal text-slate-500">@ {exp.company}</span></span>
                        <span className="text-slate-500 font-normal">{exp.start_date} &ndash; {exp.is_current ? 'Present' : (exp.end_date || 'Present')}</span>
                      </div>
                      {exp.responsibilities && <div className="text-xs text-slate-600 mt-1">{exp.responsibilities}</div>}
                    </div>
                  ))}
                </div>
              )}

              {projects && projects.length > 0 && (
                <div className="creative-sec">
                  <div className="creative-head" style={{ color: theme_color }}>Featured Projects</div>
                  {projects.map((p, idx) => (
                    <div key={p.id || idx} className="mb-2">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{p.title} {p.technologies && <span style={{ color: theme_color }}>[{p.technologies}]</span>}</span>
                        {p.project_url && <span className="text-xs text-blue-600">{p.project_url}</span>}
                      </div>
                      {p.description && <div className="text-xs text-slate-600 mt-0.5">{p.description}</div>}
                    </div>
                  ))}
                </div>
              )}

              {educations && educations.length > 0 && (
                <div className="creative-sec">
                  <div className="creative-head" style={{ color: theme_color }}>Education</div>
                  {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="mb-1.5 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{edu.degree} &mdash; <span className="font-normal text-slate-600">{edu.institution}</span></span>
                        <span className="text-slate-500 font-normal">{edu.start_year ? `${edu.start_year} - ` : ''}{edu.end_year}</span>
                      </div>
                      {(edu.cgpa || edu.achievements) && (
                        <div className="text-slate-600 mt-0.5">
                          {edu.cgpa && <b>CGPA: {edu.cgpa} &bull; </b>}
                          {edu.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
