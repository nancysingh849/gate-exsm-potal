import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('notes'); // notes | quiz | mock | pyq | score
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [branchData, setBranchData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [quizResults, setQuizResults] = useState({});
  const [scores, setScores] = useState([]);

  const [mockAnswers, setMockAnswers] = useState({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockScore, setMockScore] = useState(null);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your GATE AI Tutor. Ask any doubts or upload a problem image for solutions!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegister ? '/auth/register' : '/auth/login';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.message || 'Authentication error.');
        return;
      }

      setUser(data.user);
      localStorage.setItem('gate_user', JSON.stringify(data.user));
    } catch (err) {
      setAuthError('Backend server unavailable. Please make sure node server is running on port 5000.');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('gate_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (user && selectedBranch) {
      fetch(`${API_BASE}/portal/data/${selectedBranch}`)
        .then((res) => {
          if (!res.ok) throw new Error('Data fetch failed');
          return res.json();
        })
        .then((data) => {
          if (data && data.subjects) {
            setBranchData(data);
            setSelectedSubject(data.subjects[0] || null);
          } else {
            setBranchData(null);
            setSelectedSubject(null);
          }
          setQuizResults({});
          setMockAnswers({});
          setMockSubmitted(false);
          setMockScore(null);
        })
        .catch((err) => {
          console.error('Error loading branch data:', err);
          setBranchData(null);
          setSelectedSubject(null);
        });
    }
  }, [user, selectedBranch]);

  const loadUserScores = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/portal/scores/${user.email}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setScores(data.reverse());
      }
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  };

  const handleQuizOptionSelect = async (question, chosenOption) => {
    if (quizResults[question.id]) return;

    const isCorrect = chosenOption === question.correctAnswer;

    setQuizResults((prev) => ({
      ...prev,
      [question.id]: {
        selected: chosenOption,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    }));

    try {
      await fetch(`${API_BASE}/portal/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          branch: selectedBranch,
          subject: `${selectedSubject ? selectedSubject.name : ''} (Quiz)`,
          score: isCorrect ? 1 : 0,
          total: 1
        })
      });
    } catch (e) {
      console.error('Score saving failed:', e);
    }
  };

  const handleMockSelect = (questionId, option) => {
    if (mockSubmitted) return;
    setMockAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submitMockTest = async (allQuestions) => {
    let score = 0;
    allQuestions.forEach((q) => {
      if (mockAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    setMockScore({ score, total: allQuestions.length });
    setMockSubmitted(true);

    try {
      await fetch(`${API_BASE}/portal/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          branch: selectedBranch,
          subject: `Full Mock Test (${selectedBranch})`,
          score,
          total: allQuestions.length
        })
      });
    } catch (e) {
      console.error('Score submission error:', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gate_user');
    setAuthForm({ username: '', email: '', password: '' });
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImg({
          base64: reader.result.split(',')[1],
          preview: reader.result,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Chat message send handler
  const sendChatMessage = async () => {
    if (!chatInput.trim() && !selectedImg) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      image: selectedImg ? selectedImg.preview : null
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput;
    const currentImg = selectedImg;
    setChatInput('');
    setSelectedImg(null);
    setAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/portal/ai-doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          imageBase64: currentImg ? currentImg.base64 : null,
          mimeType: currentImg ? currentImg.mimeType : null
        })
      });

      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply || "No reply from tutor." }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Server connection error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>GATE Prep Portal</h2>
          <p className="auth-subtitle">
            {isRegister ? 'Register your account to begin GATE preparation' : 'Welcome back! Login to your account'}
          </p>

          {authError && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth}>
            {isRegister && (
              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="primary-btn">
              {isRegister ? 'Register & Enter Portal' : 'Login'}
            </button>
          </form>

          <p className="auth-toggle">
            {isRegister ? 'Already registered?' : "Don't have an account?"}
            <span onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}>
              {isRegister ? 'Login here' : 'Create an Account'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const allBranchQuestions = (branchData && Array.isArray(branchData.subjects))
    ? branchData.subjects.flatMap((s) => (s && Array.isArray(s.quizzes)) ? s.quizzes : [])
    : [];

  // Pura subject ka single PDF Link nikalne ke liye
  const subjectPdfLink = (selectedSubject && selectedSubject.chapters)
    ? selectedSubject.chapters.find(c => c.link && c.link.trim() !== "")?.link || ""
    : "";

  return (
    <div>
      <nav className="navbar">
        <div className="brand-title">GATE Portal 2026</div>
        <div className="nav-right">
          <div className="nav-user">User: <span>{user.username}</span></div>
          <button className={`nav-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            Subjects & Notes
          </button>
          <button className={`nav-btn ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
            Subject Quiz
          </button>
          <button className={`nav-btn ${activeTab === 'mock' ? 'active' : ''}`} onClick={() => setActiveTab('mock')}>
            Mock Test
          </button>
          <button className={`nav-btn ${activeTab === 'pyq' ? 'active' : ''}`} onClick={() => setActiveTab('pyq')}>
            Previous Year Papers (PYQs)
          </button>
          <button className={`nav-btn ${activeTab === 'score' ? 'active' : ''}`} onClick={() => { setActiveTab('score'); loadUserScores(); }}>
            Your Scores
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-container">
        <div className="section-panel">
          <h3>Choose Your Branch</h3>
          <div className="badge-grid">
            {['CSE', 'ECE', 'EE', 'ME', 'CE'].map((b) => (
              <div
                key={b}
                className={`branch-card ${selectedBranch === b ? 'active' : ''}`}
                onClick={() => setSelectedBranch(b)}
              >
                {b === 'CSE' ? 'Computer Science (CSE)' :
                 b === 'ECE' ? 'Electronics & Comm (ECE)' :
                 b === 'EE'  ? 'Electrical Engg (EE)' :
                 b === 'ME'  ? 'Mechanical Engg (ME)' : 'Civil Engg (CE)'}
              </div>
            ))}
          </div>
        </div>

        {!branchData && (
          <div className="section-panel" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>Loading branch syllabus, PYQs & quizzes...</p>
          </div>
        )}

        {/* Tab 1: Subject Wise Notes & Syllabus Section */}
        {activeTab === 'notes' && branchData && (
          <div className="section-panel">
            <h3>{branchData.name} - Subjects & Comprehensive Notes</h3>
            <div className="subject-chips">
              {branchData.subjects && branchData.subjects.map((s) => (
                <div
                  key={s.id}
                  className={`subject-chip ${selectedSubject?.id === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(s)}
                >
                  {s.name}
                </div>
              ))}
            </div>

            {selectedSubject && (
              <div className="notes-container">
                {/* Header with Title and Single Subject-Level Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                    {selectedSubject.name} - Official Syllabus & Topics
                  </h4>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* 1. YouTube Lectures Button */}
                    {selectedSubject.videoUrl && (
                      <a
                        href={selectedSubject.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '13px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                        }}
                      >
                        ▶ Watch Video Lectures (YouTube)
                      </a>
                    )}

                    {/* 2. Single Master Button for Complete Subject PDF Notes */}
                    <a
                      href={subjectPdfLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!subjectPdfLink) {
                          e.preventDefault();
                          alert("Is subject ki complete notes PDF jald hi attach kar di jayegi!");
                        }
                      }}
                      style={{
                        background: subjectPdfLink ? '#0284c7' : '#94a3b8',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: subjectPdfLink ? 'pointer' : 'not-allowed',
                        boxShadow: subjectPdfLink ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none'
                      }}
                    >
                      📄 Download Complete Notes (PDF)
                    </a>
                  </div>
                </div>

                {/* Clean Topics List (NO separate buttons per topic) */}
                {selectedSubject.chapters && selectedSubject.chapters.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedSubject.chapters.map((item, idx) => {
                      const cleanTitle = item.title ? item.title.replace(/^Chapter\s*\d+\s*:\s*/i, '') : `Unit ${idx + 1}`;
                      
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            background: '#ffffff', 
                            padding: '18px 20px', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '10px' 
                          }}>
                            <span style={{ fontSize: '18px' }}>📘</span>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                              {cleanTitle} - Syllabus & Key Topics
                            </h4>
                          </div>

                          <ul style={{ 
                            margin: 0, 
                            paddingLeft: '22px', 
                            color: '#334155', 
                            lineHeight: '1.7', 
                            fontSize: '14px' 
                          }}>
                            {item.points && item.points.map((pt, pIdx) => (
                              <li key={pIdx} style={{ marginBottom: '4px' }}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notes-content">{selectedSubject.notes}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Subject Quiz */}
        {activeTab === 'quiz' && branchData && selectedSubject && (
          <div className="section-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Practice Quiz: {selectedSubject.name} ({selectedBranch})</h3>
              {selectedSubject.videoUrl && (
                <a
                  href={selectedSubject.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}
                >
                  ▶ Watch Topic Videos
                </a>
              )}
            </div>

            <div className="subject-chips">
              {branchData.subjects && branchData.subjects.map((s) => (
                <div
                  key={s.id}
                  className={`subject-chip ${selectedSubject?.id === s.id ? 'active' : ''}`}
                  onClick={() => { setSelectedSubject(s); setQuizResults({}); }}
                >
                  {s.name}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px' }}>
              {selectedSubject.quizzes && selectedSubject.quizzes.map((q, idx) => {
                const res = quizResults[q.id];
                return (
                  <div key={q.id} className="quiz-card">
                    <div className="quiz-question">
                      Q{idx + 1}. {q.question}
                    </div>
                    <div className="options-list">
                      {q.options && q.options.map((opt) => {
                        let btnClass = 'option-button';
                        if (res) {
                          if (opt === q.correctAnswer) btnClass += ' correct';
                          else if (res.selected === opt) btnClass += ' wrong';
                        }
                        return (
                          <button
                            key={opt}
                            className={btnClass}
                            disabled={!!res}
                            onClick={() => handleQuizOptionSelect(q, opt)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {res && (
                      <div className={`feedback-box ${res.isCorrect ? 'correct' : 'wrong'}`}>
                        <div>{res.isCorrect ? '✅ Shabaash! Sahi Jawab.' : '❌ Galat Jawab!'}</div>
                        {!res.isCorrect && (
                          <div style={{ marginTop: '4px' }}>
                            Sahi Jawab: <span className="correct-ans-highlight">{res.correctAnswer}</span>
                          </div>
                        )}
                        <p><strong>Explanation:</strong> {res.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Mock Test */}
        {activeTab === 'mock' && branchData && (
          <div className="section-panel">
            <h3>Full Branch Mock Test - {branchData.name}</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Test your overall preparation across all subjects of this branch. Submit to see total score.
            </p>

            {mockScore && (
              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <h4 style={{ color: '#047857' }}>Mock Test Evaluated!</h4>
                <p style={{ marginTop: '4px', fontSize: '15px' }}>
                  Aapka Score: <strong>{mockScore.score} / {mockScore.total}</strong>
                </p>
              </div>
            )}

            {allBranchQuestions.map((q, idx) => (
              <div key={q.id} className="quiz-card">
                <div className="quiz-question">
                  Q{idx + 1}. {q.question}
                </div>
                <div className="options-list">
                  {q.options && q.options.map((opt) => {
                    const isSelected = mockAnswers[q.id] === opt;
                    let btnClass = 'option-button';
                    if (isSelected) btnClass += ' active';
                    if (mockSubmitted) {
                      if (opt === q.correctAnswer) btnClass += ' correct';
                      else if (isSelected) btnClass += ' wrong';
                    }
                    return (
                      <button
                        key={opt}
                        className={btnClass}
                        style={isSelected && !mockSubmitted ? { borderColor: '#0284c7', background: '#e0f2fe' } : {}}
                        disabled={mockSubmitted}
                        onClick={() => handleMockSelect(q.id, opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {mockSubmitted && (
                  <div className="feedback-box wrong" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                    <strong>Correct Answer:</strong> {q.correctAnswer}
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {!mockSubmitted && allBranchQuestions.length > 0 && (
              <button
                className="primary-btn"
                style={{ maxWidth: '240px', marginTop: '10px' }}
                onClick={() => submitMockTest(allBranchQuestions)}
              >
                Submit Mock Test
              </button>
            )}
          </div>
        )}

        {/* Tab 4: PYQs */}
        {activeTab === 'pyq' && branchData && (
          <div className="section-panel">
            <h3>{branchData.name} - Previous Year Question Papers</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Access and download official GATE question papers year-by-year directly in PDF format.
            </p>

            {(!branchData.pyqs || branchData.pyqs.length === 0) ? (
              <p style={{ color: '#64748b' }}>No PYQ papers added for this branch yet.</p>
            ) : (
              <div className="pyq-grid">
                {branchData.pyqs.map((paper, pIdx) => (
                  <div key={pIdx} className="pyq-card" style={{ padding: '20px' }}>
                    <div className="pyq-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                      <div>
                        <span className="pyq-badge">GATE {paper.year}</span>
                        <h4 style={{ margin: '8px 0 6px 0', fontSize: '18px', color: '#0f172a' }}>
                          {paper.paperName}
                        </h4>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          Total Marks: {paper.totalMarks} | Duration: 3 Hours
                        </span>
                      </div>
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="download-btn"
                        style={{ fontSize: '14px', padding: '10px 18px' }}
                      >
                        📄 Download Official PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Scores */}
        {activeTab === 'score' && (
          <div className="section-panel">
            <h3>Your Test & Quiz Performance History</h3>
            {scores.length === 0 ? (
              <p style={{ color: '#64748b', marginTop: '12px' }}>
                No tests or quizzes have been attempted yet.
              </p>
            ) : (
              <table className="score-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Subject / Test</th>
                    <th>Score</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((sc, index) => (
                    <tr key={index}>
                      <td><strong>{sc.branch}</strong></td>
                      <td>{sc.subject}</td>
                      <td>
                        <span className="score-badge">{sc.score} / {sc.total}</span>
                      </td>
                      <td>{new Date(sc.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Doubt Solver Chatbot Widget */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              fontSize: '28px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Ask GATE AI Tutor"
          >
            🤖
          </button>
        )}

        {chatOpen && (
          <div style={{
            width: '380px',
            height: '520px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>🤖 GATE AI Doubt Solver</div>
              <button
                onClick={() => setChatOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
              >
                ✖
              </button>
            </div>

            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === 'user' ? '#0284c7' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    maxWidth: '85%',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.image && (
                    <img src={msg.image} alt="uploaded" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '4px', marginBottom: '6px' }} />
                  )}
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: 'flex-start', background: '#e2e8f0', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                  Thinking & solving your query...
                </div>
              )}
            </div>

            {selectedImg && (
              <div style={{ padding: '6px 12px', background: '#e0f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span>📷 Photo Attached</span>
                <button onClick={() => setSelectedImg(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}>Remove</button>
              </div>
            )}

            <div style={{ padding: '10px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', fontSize: '20px', padding: '4px' }} title="Attach Question Image">
                📎
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </label>

              <input
                type="text"
                placeholder="Ask any GATE doubt..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              <button
                onClick={sendChatMessage}
                disabled={aiLoading}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;