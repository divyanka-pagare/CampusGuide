import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Chatbot.css';

// ─── All questions in order ────────────────────────────────────────────────
const STEPS = [
  {
    key: 'companyName',
    question: "👋 Hi! I'm here to help you share your campus drive experience.\n\nWhich **company** came to your campus?",
    type: 'text',
    placeholder: 'e.g. TCS, Infosys, Google...',
    validate: v => v.trim().length >= 2 ? null : 'Please enter a valid company name'
  },
  {
    key: 'driveType',
    question: "Was it for a **Placement** or **Internship**?",
    type: 'choice',
    options: ['Placement', 'Internship']
  },
  {
    key: 'driveYear',
    question: "Which **year** did this drive happen?",
    type: 'text',
    placeholder: 'e.g. 2024',
    validate: v => {
      const n = parseInt(v);
      return (!isNaN(n) && n >= 2018 && n <= 2035) ? null : 'Enter a valid year (2018–2035)';
    }
  },
  {
    key: 'role',
    question: "What **role / position** were you applying for?",
    type: 'text',
    placeholder: 'e.g. Software Engineer, Data Analyst...',
    validate: v => v.trim().length >= 2 ? null : 'Please enter a valid role'
  },
  {
    key: 'studentBranch',
    question: "What is your **branch**?",
    type: 'choice',
    options: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'OTHER']
  },
  {
    key: 'studentPassingYear',
    question: "What is your **passing / graduation year**?",
    type: 'text',
    placeholder: 'e.g. 2025',
    validate: v => {
      const n = parseInt(v);
      return (!isNaN(n) && n >= 2020 && n <= 2035) ? null : 'Enter a valid year (2020–2035)';
    }
  },
  {
    key: 'cgpa',
    question: "What was your **CGPA** at the time of drive?\n\n_(Optional — type 'skip' to skip)_",
    type: 'text',
    placeholder: 'e.g. 8.5 or skip',
    optional: true
  },
  {
    key: 'isSelected',
    question: "What was your **result**? 🎯",
    type: 'choice',
    options: ['✅ I got Selected!', '❌ Not Selected this time']
  },
  {
    key: 'package',
    question: "What was the **package / stipend** offered?\n\n_(Optional — type 'skip' to skip)_",
    type: 'text',
    placeholder: 'e.g. 6 LPA, 20k/month or skip',
    optional: true
  },
  {
    key: 'title',
    question: "Give your experience a **title** 📝\n\nThis will be the headline of your post:",
    type: 'text',
    placeholder: 'e.g. My TCS NQT Experience 2024 - Got Selected!',
    validate: v => v.trim().length >= 5 ? null : 'Title must be at least 5 characters'
  },
  {
    key: 'overview',
    question: "Write a **brief overview** of your experience.\n\nHow was the overall process? What should juniors know?",
    type: 'textarea',
    placeholder: 'Describe the overall drive experience...',
    validate: v => v.trim().length >= 20 ? null : 'Please write at least 20 characters'
  },
  {
    key: 'roundsCount',
    question: "How many **rounds** were there in total?\n\n_(Enter 0 if you want to skip round details)_",
    type: 'text',
    placeholder: 'e.g. 3',
    validate: v => {
      const n = parseInt(v);
      return (!isNaN(n) && n >= 0 && n <= 15) ? null : 'Enter a number between 0 and 15';
    }
  },
  {
    key: 'preparationTips',
    question: "Share your **preparation tips** for juniors! 💡\n\nWhat resources did you use? What should they focus on?",
    type: 'textarea',
    placeholder: 'e.g. Practice DSA on LeetCode, prepare HR questions...',
    validate: v => v.trim().length >= 10 ? null : 'Please write at least 10 characters'
  },
  {
    key: 'resourcesUsed',
    question: "List **resources you used** to prepare.\n\n_(Comma separated — or type 'skip')_",
    type: 'text',
    placeholder: 'e.g. GeeksForGeeks, LeetCode, InterviewBit or skip',
    optional: true
  },
  {
    key: 'otherInsights',
    question: "Any **other insights** to share?\n\nCompany culture, dress code, interview vibe, do's & don'ts...\n\n_(Optional — type 'skip' to skip)_",
    type: 'textarea',
    placeholder: 'Anything else that would help juniors...',
    optional: true
  },
];

const ROUND_TYPES = ['aptitude', 'coding', 'technical', 'hr', 'group_discussion', 'case_study', 'other'];

const ROUND_STEPS = [
  { field: 'roundName',    question: (i, total) => `**Round ${i+1} of ${total}** — What is the **name** of this round?`,   type: 'text',     placeholder: 'e.g. Aptitude Test, Technical Round...' },
  { field: 'roundType',    question: ()          => `What **type** is this round?`,                                          type: 'choice',   options: ROUND_TYPES },
  { field: 'description',  question: ()          => `Describe what happened in this round:`,                                 type: 'textarea', placeholder: 'What questions were asked, what was the format...' },
  { field: 'tips',         question: ()          => `Any **tips** for this round?\n\n_(Optional — type 'skip' to skip)_`,   type: 'text',     placeholder: 'What to focus on... or skip', optional: true },
];

// ─── Helper: render bold markdown ─────────────────────────────────────────
const renderText = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
};

const ChatBubble = ({ msg }) => (
  <div className={`chat-msg ${msg.role}`}>
    <div className="chat-avatar-icon">
      {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
    </div>
    <div className="chat-bubble-text">
      {msg.text.split('\n').map((line, i, arr) => (
        <span key={i}>{renderText(line)}{i < arr.length - 1 && <br />}</span>
      ))}
    </div>
  </div>
);

// ─── Main Chatbot Component ────────────────────────────────────────────────
const Chatbot = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [phase, setPhase]               = useState('main');   // 'main' | 'rounds' | 'done'
  const [mainStep, setMainStep]         = useState(0);
  const [roundIndex, setRoundIndex]     = useState(0);
  const [roundStep, setRoundStep]       = useState(0);
  const [formData, setFormData]         = useState({});
  const [roundsData, setRoundsData]     = useState([]);
  const [currentRound, setCurrentRound] = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [createdPost, setCreatedPost]   = useState(null);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const initialized = useRef(false);

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true;
      setTimeout(() => addBot(STEPS[0].question), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, phase, mainStep, roundStep]);

  const addBot  = (text) => setMessages(prev => [...prev, { role: 'bot',  text }]);
  const addUser = (text) => setMessages(prev => [...prev, { role: 'user', text }]);

  // ── Current step info ───────────────────────────────────────────────────
  const currentMainStep  = STEPS[mainStep];
  const currentRoundStep = ROUND_STEPS[roundStep];

  const isChoiceStep = () => {
    if (phase === 'main')   return currentMainStep?.type === 'choice';
    if (phase === 'rounds') return currentRoundStep?.type === 'choice';
    return false;
  };

  const getChoices = () => {
    if (phase === 'main')   return currentMainStep?.options  || [];
    if (phase === 'rounds') return currentRoundStep?.options || [];
    return [];
  };

  const isOptional = () => {
    if (phase === 'main')   return !!currentMainStep?.optional;
    if (phase === 'rounds') return !!currentRoundStep?.optional;
    return false;
  };

  // ── Process main step answer ────────────────────────────────────────────
  const processMainStep = (raw) => {
    const step = STEPS[mainStep];
    const value = raw.trim();
    const skipVal = value.toLowerCase() === 'skip';

    // Validate
    if (!skipVal && step.validate) {
      const err = step.validate(value);
      if (err) { setError(err); addBot(`⚠️ ${err}`); return; }
    }
    setError('');

    // Coerce value
    let stored = value;
    if (step.key === 'isSelected')          stored = value.includes('✅') || value.toLowerCase().includes('selected') && !value.toLowerCase().includes('not');
    if (step.key === 'driveType')           stored = value.toLowerCase();
    if (step.key === 'driveYear')           stored = parseInt(value);
    if (step.key === 'studentPassingYear')  stored = parseInt(value);
    if (step.key === 'cgpa'   && skipVal)   stored = '';
    if (step.key === 'package'&& skipVal)   stored = '';
    if (step.key === 'resourcesUsed' && skipVal) stored = [];
    if (step.key === 'resourcesUsed' && !skipVal) stored = value.split(',').map(s => s.trim()).filter(Boolean);
    if (step.key === 'otherInsights' && skipVal) stored = '';

    const newData = { ...formData, [step.key]: stored };
    setFormData(newData);

    const next = mainStep + 1;

    // After roundsCount — decide to collect rounds or skip
    if (step.key === 'roundsCount') {
      const count = parseInt(value);
      if (count > 0) {
        setFormData({ ...newData });
        setPhase('rounds');
        setRoundIndex(0);
        setRoundStep(0);
        setCurrentRound({});
        addUser(value);
        addBot(ROUND_STEPS[0].question(0, count));
        return;
      }
    }

    addUser(skipVal ? '(skipped)' : value);

    if (next < STEPS.length) {
      setMainStep(next);
      addBot(STEPS[next].question);
    } else {
      // All main steps done, submit
      submitPost(newData, roundsData);
    }
  };

  // ── Process round step answer ───────────────────────────────────────────
  const processRoundStep = (raw) => {
    const value = raw.trim();
    const skipVal = value.toLowerCase() === 'skip';
    const rStep   = ROUND_STEPS[roundStep];
    const total   = parseInt(formData.roundsCount) || 0;

    addUser(skipVal ? '(skipped)' : value);

    const updatedRound = { ...currentRound, [rStep.field]: skipVal ? '' : value };
    setCurrentRound(updatedRound);

    const nextRoundStep = roundStep + 1;

    if (nextRoundStep < ROUND_STEPS.length) {
      // Next field in this round
      setRoundStep(nextRoundStep);
      addBot(ROUND_STEPS[nextRoundStep].question(roundIndex, total));
    } else {
      // Round complete
      const newRounds = [...roundsData, updatedRound];
      setRoundsData(newRounds);
      setCurrentRound({});
      setRoundStep(0);

      const nextRoundIndex = roundIndex + 1;

      if (nextRoundIndex < total) {
        setRoundIndex(nextRoundIndex);
        addBot(ROUND_STEPS[0].question(nextRoundIndex, total));
      } else {
        // All rounds done — continue main steps after roundsCount
        const afterRounds = STEPS.findIndex(s => s.key === 'preparationTips');
        setPhase('main');
        setMainStep(afterRounds);
        setRoundsData(newRounds);
        addBot(`✅ All ${total} round${total > 1 ? 's' : ''} recorded!\n\n` + STEPS[afterRounds].question);
      }
    }
  };

  // ── Handle send ─────────────────────────────────────────────────────────
  const handleSend = (value) => {
    const val = (value !== undefined ? value : input).trim();

    if (!val && !isOptional()) return;
    if (!val && isOptional()) {
      // treat empty as skip
      if (phase === 'main')   processMainStep('skip');
      if (phase === 'rounds') processRoundStep('skip');
      setInput('');
      return;
    }

    setInput('');
    if (phase === 'main')   processMainStep(val);
    if (phase === 'rounds') processRoundStep(val);
  };

  // ── Submit post ──────────────────────────────────────────────────────────
  const submitPost = async (data, rounds) => {
    setPhase('done');
    setSubmitting(true);

    addBot("🚀 Submitting your experience...");

    try {
      const payload = {
        companyName:        data.companyName,
        driveType:          data.driveType,
        driveYear:          data.driveYear,
        role:               data.role,
        studentBranch:      data.studentBranch,
        studentPassingYear: data.studentPassingYear,
        cgpa:               data.cgpa || '',
        isSelected:         data.isSelected,
        package:            data.package || '',
        title:              data.title,
        overview:           data.overview,
        rounds:             rounds || [],
        preparationTips:    data.preparationTips || '',
        resourcesUsed:      Array.isArray(data.resourcesUsed) ? data.resourcesUsed : [],
        otherInsights:      data.otherInsights || '',
        tags:               [],
      };

      const res = await api.post('/posts', payload);
      setCreatedPost(res.data.post);
      setSubmitting(false);

      addBot(
        `🎉 **Experience submitted successfully!**\n\n` +
        `Your post is now **pending admin verification**.\n` +
        `Once approved by admin/TPO/Principal, it will be visible to all students.\n\n` +
        `You can track its status in **My Posts**.`
      );

      toast.success('Experience submitted! Pending admin approval.');
    } catch (err) {
      setSubmitting(false);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      addBot(`❌ **Error:** ${msg}\n\nPlease try again.`);
      toast.error(msg);
      setPhase('main'); // allow retry
    }
  };

  // ── Reset chatbot ────────────────────────────────────────────────────────
  const resetChat = () => {
    setMessages([]);
    setInput('');
    setPhase('main');
    setMainStep(0);
    setRoundIndex(0);
    setRoundStep(0);
    setFormData({});
    setRoundsData([]);
    setCurrentRound({});
    setSubmitting(false);
    setError('');
    setCreatedPost(null);
    initialized.current = false;
    setTimeout(() => { initialized.current = true; addBot(STEPS[0].question); }, 100);
  };

  // ── Close handler ────────────────────────────────────────────────────────
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const showInput  = phase !== 'done' && !submitting && !isChoiceStep();
  const showSubmit = phase !== 'done' && !submitting && !isChoiceStep();
  const isTextarea = phase === 'main'
    ? currentMainStep?.type === 'textarea'
    : currentRoundStep?.type === 'textarea';

  return (
    <div className="chatbot-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="chatbot-window">

        {/* ── Header ── */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <div className="chatbot-header-icon"><MessageSquarePlus size={18} /></div>
            <div>
              <span className="chatbot-name">Share Your Experience</span>
              <span className="chatbot-status">
                {phase === 'done' ? 'Submitted ✓' :
                 phase === 'rounds' ? `Round ${roundIndex + 1} of ${formData.roundsCount} · Step ${roundStep + 1}/${ROUND_STEPS.length}` :
                 `Step ${mainStep + 1} of ${STEPS.length}`}
              </span>
            </div>
          </div>
          <button className="chatbot-close" onClick={handleClose}><X size={18} /></button>
        </div>

        {/* ── Progress bar ── */}
        <div className="chatbot-progress">
          <div
            className="chatbot-progress-fill"
            style={{ width: phase === 'done' ? '100%' : `${(mainStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* ── Messages ── */}
        <div className="chatbot-messages">
          {!user && (
            <div className="chatbot-login-wall">
              <Bot size={32} />
              <p>Please <a href="/login">login</a> to share your experience.</p>
            </div>
          )}

          {user && messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}

          {submitting && (
            <div className="chat-msg bot">
              <div className="chat-avatar-icon"><Bot size={14} /></div>
              <div className="chat-bubble-text loading-dots">
                <Loader size={14} className="spin-icon" /> Submitting...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ── */}
        {user && phase !== 'done' && !submitting && (
          <div className="chatbot-input-area">

            {/* Choice buttons */}
            {isChoiceStep() && (
              <div className="chatbot-choices">
                {getChoices().map(opt => (
                  <button
                    key={opt}
                    className="choice-btn"
                    onClick={() => handleSend(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Text / textarea input */}
            {!isChoiceStep() && (
              <div className="chatbot-text-row">
                {isTextarea ? (
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={
                      phase === 'main'
                        ? (currentMainStep?.placeholder || 'Type your answer...')
                        : (currentRoundStep?.placeholder || 'Type your answer...')
                    }
                    rows={3}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSend(); }}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={
                      phase === 'main'
                        ? (currentMainStep?.placeholder || 'Type your answer...')
                        : (currentRoundStep?.placeholder || 'Type your answer...')
                    }
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  />
                )}

                <button
                  className="send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() && !isOptional()}
                  title={isTextarea ? 'Send (or Ctrl+Enter)' : 'Send (or Enter)'}
                >
                  <Send size={16} />
                </button>
              </div>
            )}

            {isOptional() && !isChoiceStep() && (
              <p className="optional-hint">This field is optional — type 'skip' or leave empty and press Send to skip</p>
            )}
            {isTextarea && !isChoiceStep() && (
              <p className="optional-hint">Press <kbd>Ctrl+Enter</kbd> to send</p>
            )}
          </div>
        )}

        {/* ── Done state ── */}
        {user && phase === 'done' && !submitting && createdPost && (
          <div className="chatbot-done-area">
            <div className="done-icon"><CheckCircle size={22} /></div>
            <div className="done-text">
              <strong>Experience Submitted!</strong>
              <span>Pending admin verification</span>
            </div>
            <div className="done-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { handleClose(); navigate('/my-posts'); }}
              >
                View My Posts
              </button>
              <button className="btn btn-primary btn-sm" onClick={resetChat}>
                + Share Another
              </button>
            </div>
          </div>
        )}

        {/* ── Error hint ── */}
        {error && <div className="chatbot-error">{error}</div>}

      </div>
    </div>
  );
};

export default Chatbot;
