import React, { useState } from 'react';
import { 
  User, Link as LinkIcon, GraduationCap, Briefcase, 
  Wrench, FolderGit2, Award, Palette, Plus, Trash2, 
  Upload, X, Check, AlertCircle 
} from 'lucide-react';
import { THEME_PALETTES, TEMPLATES } from '../sampleData';

export default function EditorPane({ resume, setResume, missingFields = [] }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Handle nested changes for personal_info
  const handlePersonalChange = (field, value) => {
    setResume(prev => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        [field]: value
      }
    }));
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG).');
      return;
    }

    setUploadingPhoto(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      handlePersonalChange('photo_url', data.url);
    } catch (err) {
      setUploadError('Failed to upload picture. You can still paste an image URL directly.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Array item handlers: Education
  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          id: Date.now(),
          degree: '',
          institution: '',
          location: '',
          start_year: '',
          end_year: '',
          cgpa: '',
          achievements: ''
        }
      ]
    }));
  };

  const updateEducation = (index, field, value) => {
    setResume(prev => {
      const updated = [...prev.educations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educations: updated };
    });
  };

  const removeEducation = (index) => {
    setResume(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  // Array item handlers: Experience
  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: Date.now(),
          job_title: '',
          company: '',
          location: '',
          start_date: '',
          end_date: '',
          is_current: false,
          responsibilities: ''
        }
      ]
    }));
  };

  const updateExperience = (index, field, value) => {
    setResume(prev => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  const removeExperience = (index) => {
    setResume(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  // Array item handlers: Skills
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Technical');
  const [newSkillProf, setNewSkillProf] = useState('Advanced');

  const addSkill = (name = newSkillName) => {
    if (!name.trim()) return;
    setResume(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: Date.now(),
          name: name.trim(),
          category: newSkillCat,
          proficiency_level: newSkillProf
        }
      ]
    }));
    setNewSkillName('');
  };

  const removeSkill = (index) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Projects
  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now(),
          title: '',
          description: '',
          technologies: '',
          project_url: ''
        }
      ]
    }));
  };

  const updateProject = (index, field, value) => {
    setResume(prev => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Certifications
  const addCertification = () => {
    setResume(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: Date.now(),
          name: '',
          issuing_org: '',
          issue_date: '',
          cert_url: ''
        }
      ]
    }));
  };

  const updateCertification = (index, field, value) => {
    setResume(prev => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const removeCertification = (index) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Photo', icon: User },
    { id: 'social', label: 'Social & Links', icon: LinkIcon },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects & Certs', icon: FolderGit2 },
    { id: 'design', label: 'Theme & Style', icon: Palette },
  ];

  return (
    <div className="editor-container">
      {/* Editor Tabs */}
      <div className="editor-tab-bar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`editor-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="editor-body">
        {/* Tab 1: Personal Info & Photo */}
        {activeTab === 'personal' && (
          <div className="tab-pane">
            <div className="section-header-row">
              <h3 className="section-title">Personal Information</h3>
              <span className="mandatory-hint">* Mandatory for PDF Export</span>
            </div>

            <div className="photo-upload-row">
              <div className="photo-preview-box">
                {resume.personal_info.photo_url ? (
                  <img
                    src={resume.personal_info.photo_url}
                    alt="Uploaded Avatar"
                    className="photo-preview-img"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="photo-controls">
                <label className="upload-btn">
                  <Upload className="w-4 h-4 mr-1.5" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Profile Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {resume.personal_info.photo_url && (
                  <button
                    className="remove-photo-btn"
                    onClick={() => handlePersonalChange('photo_url', '')}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Remove
                  </button>
                )}
                <p className="photo-tip">Optional. Cleanly hidden on resume if not provided.</p>
                {uploadError && <p className="error-text">{uploadError}</p>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="input-label">
                  Full Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className={`text-input ${missingFields.includes('Full Name') ? 'input-error' : ''}`}
                  value={resume.personal_info.full_name}
                  onChange={(e) => handlePersonalChange('full_name', e.target.value)}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div className="form-group">
                <label className="input-label">
                  Professional Headline / Title <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className={`text-input ${missingFields.includes('Professional Title') ? 'input-error' : ''}`}
                  value={resume.personal_info.professional_title}
                  onChange={(e) => handlePersonalChange('professional_title', e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>

              <div className="form-group">
                <label className="input-label">
                  Email Address <span className="req-star">*</span>
                </label>
                <input
                  type="email"
                  className={`text-input ${missingFields.includes('Email Address') ? 'input-error' : ''}`}
                  value={resume.personal_info.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="e.g. alex@example.com"
                />
              </div>

              <div className="form-group">
                <label className="input-label">
                  Phone Number <span className="req-star">*</span>
                </label>
                <input
                  type="tel"
                  className={`text-input ${missingFields.includes('Phone Number') ? 'input-error' : ''}`}
                  value={resume.personal_info.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>

              <div className="form-group full-width">
                <label className="input-label">Location (City, Country / Remote)</label>
                <input
                  type="text"
                  className="text-input"
                  value={resume.personal_info.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                />
              </div>

              <div className="form-group full-width">
                <label className="input-label">Professional Summary</label>
                <textarea
                  className="textarea-input"
                  rows={4}
                  value={resume.personal_info.summary}
                  onChange={(e) => handlePersonalChange('summary', e.target.value)}
                  placeholder="A concise summary highlighting your engineering experience, leadership, and key career achievements..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Social Links */}
        {activeTab === 'social' && (
          <div className="tab-pane">
            <h3 className="section-title">Social & Online Profiles</h3>
            <p className="tab-description">
              Any link left empty will automatically be omitted from your formatted CV.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label className="input-label">LinkedIn Profile URL</label>
                <input
                  type="text"
                  className="text-input"
                  value={resume.personal_info.linkedin_url}
                  onChange={(e) => handlePersonalChange('linkedin_url', e.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label className="input-label">GitHub Profile URL</label>
                <input
                  type="text"
                  className="text-input"
                  value={resume.personal_info.github_url}
                  onChange={(e) => handlePersonalChange('github_url', e.target.value)}
                  placeholder="github.com/username"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Personal Portfolio / Website</label>
                <input
                  type="text"
                  className="text-input"
                  value={resume.personal_info.portfolio_url}
                  onChange={(e) => handlePersonalChange('portfolio_url', e.target.value)}
                  placeholder="yourportfolio.dev"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Twitter / X Profile</label>
                <input
                  type="text"
                  className="text-input"
                  value={resume.personal_info.twitter_url}
                  onChange={(e) => handlePersonalChange('twitter_url', e.target.value)}
                  placeholder="x.com/username"
                />
              </div>

              <div className="form-group full-width">
                <label className="input-label">Coding Profile (LeetCode / Codeforces)</label>
                <input
                  type="text"
                  className="text-input"
                  value={resume.personal_info.leetcode_url}
                  onChange={(e) => handlePersonalChange('leetcode_url', e.target.value)}
                  placeholder="leetcode.com/username"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Experience */}
        {activeTab === 'experience' && (
          <div className="tab-pane">
            <div className="section-header-row">
              <h3 className="section-title">Work Experience</h3>
              <button className="add-btn" onClick={addExperience}>
                <Plus className="w-4 h-4 mr-1" /> Add Position
              </button>
            </div>

            {resume.experiences.length === 0 ? (
              <div className="empty-state-box">
                <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                <p>No work experience added yet.</p>
                <button className="add-btn mt-2" onClick={addExperience}>
                  <Plus className="w-4 h-4 mr-1" /> Add First Experience
                </button>
              </div>
            ) : (
              resume.experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="card-item">
                  <div className="card-item-header">
                    <span className="card-item-num">#{idx + 1} Position</span>
                    <button
                      className="delete-card-btn"
                      onClick={() => removeExperience(idx)}
                      title="Remove this position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="input-label">Job Title / Role</label>
                      <input
                        type="text"
                        className="text-input"
                        value={exp.job_title}
                        onChange={(e) => updateExperience(idx, 'job_title', e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Company / Organization</label>
                      <input
                        type="text"
                        className="text-input"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                        placeholder="e.g. Google, Tech Innovations"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Location</label>
                      <input
                        type="text"
                        className="text-input"
                        value={exp.location}
                        onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                        placeholder="e.g. New York, NY / Remote"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Start Date</label>
                      <input
                        type="text"
                        className="text-input"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(idx, 'start_date', e.target.value)}
                        placeholder="e.g. Jan 2022"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">End Date</label>
                      <input
                        type="text"
                        className="text-input"
                        value={exp.end_date}
                        disabled={exp.is_current}
                        onChange={(e) => updateExperience(idx, 'end_date', e.target.value)}
                        placeholder={exp.is_current ? 'Present' : 'e.g. Dec 2024'}
                      />
                      <label className="checkbox-row mt-1.5">
                        <input
                          type="checkbox"
                          checked={exp.is_current}
                          onChange={(e) => updateExperience(idx, 'is_current', e.target.checked)}
                        />
                        <span className="checkbox-label">Currently Working Here</span>
                      </label>
                    </div>

                    <div className="form-group full-width">
                      <label className="input-label">Responsibilities & Key Achievements</label>
                      <textarea
                        className="textarea-input"
                        rows={3}
                        value={exp.responsibilities}
                        onChange={(e) => updateExperience(idx, 'responsibilities', e.target.value)}
                        placeholder="Detailed accomplishments, technologies used, impact on performance or revenue..."
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Education */}
        {activeTab === 'education' && (
          <div className="tab-pane">
            <div className="section-header-row">
              <h3 className="section-title">Education Background</h3>
              <button className="add-btn" onClick={addEducation}>
                <Plus className="w-4 h-4 mr-1" /> Add Degree
              </button>
            </div>

            {resume.educations.length === 0 ? (
              <div className="empty-state-box">
                <GraduationCap className="w-8 h-8 text-slate-300 mb-2" />
                <p>No educational credentials added yet.</p>
                <button className="add-btn mt-2" onClick={addEducation}>
                  <Plus className="w-4 h-4 mr-1" /> Add Education
                </button>
              </div>
            ) : (
              resume.educations.map((edu, idx) => (
                <div key={edu.id || idx} className="card-item">
                  <div className="card-item-header">
                    <span className="card-item-num">#{idx + 1} Degree</span>
                    <button
                      className="delete-card-btn"
                      onClick={() => removeEducation(idx)}
                      title="Remove this education record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="input-label">Degree / Qualification</label>
                      <input
                        type="text"
                        className="text-input"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.Sc. in Computer Science"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Institution / University</label>
                      <input
                        type="text"
                        className="text-input"
                        value={edu.institution}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g. Stanford University"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Location</label>
                      <input
                        type="text"
                        className="text-input"
                        value={edu.location}
                        onChange={(e) => updateEducation(idx, 'location', e.target.value)}
                        placeholder="e.g. Boston, MA"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Graduation Year</label>
                      <input
                        type="text"
                        className="text-input"
                        value={edu.end_year}
                        onChange={(e) => updateEducation(idx, 'end_year', e.target.value)}
                        placeholder="e.g. 2021"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">CGPA / Grade (Optional)</label>
                      <input
                        type="text"
                        className="text-input"
                        value={edu.cgpa}
                        onChange={(e) => updateEducation(idx, 'cgpa', e.target.value)}
                        placeholder="e.g. 3.90 / 4.00"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="input-label">Honors & Academic Achievements</label>
                      <input
                        type="text"
                        className="text-input"
                        value={edu.achievements}
                        onChange={(e) => updateEducation(idx, 'achievements', e.target.value)}
                        placeholder="e.g. Magna Cum Laude, President's Award, Dean's Honor Roll"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Skills */}
        {activeTab === 'skills' && (
          <div className="tab-pane">
            <h3 className="section-title">Skills & Proficiencies</h3>
            <p className="tab-description">
              Categorize skills and assign proficiency levels to help employers scan your expertise.
            </p>

            <div className="add-skill-box">
              <input
                type="text"
                className="text-input flex-1"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Enter skill name (e.g. Docker, Python, FastAPI)..."
              />
              <select
                className="select-input"
                value={newSkillCat}
                onChange={(e) => setNewSkillCat(e.target.value)}
              >
                <option value="Technical">Technical</option>
                <option value="Soft">Soft Skill</option>
                <option value="Tool">Tool / Platform</option>
                <option value="Language">Language</option>
              </select>
              <select
                className="select-input"
                value={newSkillProf}
                onChange={(e) => setNewSkillProf(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button className="add-btn" onClick={() => addSkill()}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="quick-suggestions-row">
              <span className="suggestion-label">Quick Suggestions:</span>
              {['Python', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Git', 'System Design', 'REST APIs', 'Agile'].map(tech => (
                <button
                  key={tech}
                  className="quick-chip-btn"
                  onClick={() => addSkill(tech)}
                >
                  + {tech}
                </button>
              ))}
            </div>

            {/* Added Skills List */}
            <div className="skills-tag-cloud">
              {resume.skills.map((skill, idx) => (
                <div key={skill.id || idx} className="skill-pill-tag">
                  <span className="skill-tag-name">{skill.name}</span>
                  <span className="skill-tag-level">({skill.proficiency_level})</span>
                  <button
                    className="skill-remove-btn"
                    onClick={() => removeSkill(idx)}
                    title="Remove skill"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Projects & Certifications */}
        {activeTab === 'projects' && (
          <div className="tab-pane">
            {/* Projects Section */}
            <div className="section-header-row">
              <h3 className="section-title">Key Projects</h3>
              <button className="add-btn" onClick={addProject}>
                <Plus className="w-4 h-4 mr-1" /> Add Project
              </button>
            </div>

            {resume.projects.map((proj, idx) => (
              <div key={proj.id || idx} className="card-item">
                <div className="card-item-header">
                  <span className="card-item-num">Project #{idx + 1}</span>
                  <button className="delete-card-btn" onClick={() => removeProject(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="input-label">Project Title</label>
                    <input
                      type="text"
                      className="text-input"
                      value={proj.title}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      placeholder="e.g. Distributed Analytics Engine"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Project URL / Repository</label>
                    <input
                      type="text"
                      className="text-input"
                      value={proj.project_url}
                      onChange={(e) => updateProject(idx, 'project_url', e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="input-label">Technologies Used</label>
                    <input
                      type="text"
                      className="text-input"
                      value={proj.technologies}
                      onChange={(e) => updateProject(idx, 'technologies', e.target.value)}
                      placeholder="e.g. Python, FastAPI, Docker, PostgreSQL"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="input-label">Project Description</label>
                    <textarea
                      className="textarea-input"
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      placeholder="Key functionality, architectural highlights, and quantitative results..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Certifications Section */}
            <div className="section-header-row mt-6">
              <h3 className="section-title">Certifications & Credentials</h3>
              <button className="add-btn" onClick={addCertification}>
                <Plus className="w-4 h-4 mr-1" /> Add Certification
              </button>
            </div>

            {resume.certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="card-item">
                <div className="card-item-header">
                  <span className="card-item-num">Certification #{idx + 1}</span>
                  <button className="delete-card-btn" onClick={() => removeCertification(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="input-label">Certification Name</label>
                    <input
                      type="text"
                      className="text-input"
                      value={cert.name}
                      onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                      placeholder="e.g. AWS Certified Solutions Architect"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Issuing Organization</label>
                    <input
                      type="text"
                      className="text-input"
                      value={cert.issuing_org}
                      onChange={(e) => updateCertification(idx, 'issuing_org', e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Issue Date / Year</label>
                    <input
                      type="text"
                      className="text-input"
                      value={cert.issue_date}
                      onChange={(e) => updateCertification(idx, 'issue_date', e.target.value)}
                      placeholder="e.g. 2023"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Credential Verification URL</label>
                    <input
                      type="text"
                      className="text-input"
                      value={cert.cert_url}
                      onChange={(e) => updateCertification(idx, 'cert_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Theme & Style */}
        {activeTab === 'design' && (
          <div className="tab-pane">
            <h3 className="section-title">Resume Template & Design Theme</h3>
            <p className="tab-description">
              Select from professionally designed layout templates and color schemes.
            </p>

            <h4 className="sub-title">1. Choose Template Layout</h4>
            <div className="templates-grid">
              {TEMPLATES.map(tpl => (
                <div
                  key={tpl.id}
                  className={`template-card ${resume.template_name === tpl.id ? 'active' : ''}`}
                  onClick={() => setResume(prev => ({ ...prev, template_name: tpl.id }))}
                >
                  <div className="template-card-header">
                    <span className="template-name">{tpl.name}</span>
                    {resume.template_name === tpl.id && (
                      <span className="active-tag"><Check className="w-3.5 h-3.5" /> Selected</span>
                    )}
                  </div>
                  <p className="template-desc">{tpl.desc}</p>
                </div>
              ))}
            </div>

            <h4 className="sub-title mt-6">2. Choose Color Accent</h4>
            <div className="colors-palette-row">
              {THEME_PALETTES.map(p => (
                <button
                  key={p.hex}
                  className={`color-swatch-btn ${resume.theme_color === p.hex ? 'active-swatch' : ''}`}
                  style={{ backgroundColor: p.hex }}
                  onClick={() => setResume(prev => ({ ...prev, theme_color: p.hex }))}
                  title={p.name}
                >
                  {resume.theme_color === p.hex && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
              <div className="custom-color-picker-box">
                <input
                  type="color"
                  value={resume.theme_color}
                  onChange={(e) => setResume(prev => ({ ...prev, theme_color: e.target.value }))}
                  title="Custom color picker"
                  className="color-input-native"
                />
                <span className="custom-color-label">Custom Hex</span>
              </div>
            </div>

            <h4 className="sub-title mt-6">3. Font Family</h4>
            <div className="form-group" style={{ maxWidth: '320px' }}>
              <select
                className="select-input"
                value={resume.font_family}
                onChange={(e) => setResume(prev => ({ ...prev, font_family: e.target.value }))}
              >
                <option value="Inter">Modern Sans (Inter)</option>
                <option value="Helvetica, Arial, sans-serif">Clean Neutral (Helvetica / Arial)</option>
                <option value="'Times New Roman', Times, serif">Classic Editorial (Times New Roman)</option>
                <option value="Georgia, serif">Executive Serif (Georgia)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
