import { useState, useRef } from "react";

const QUESTIONS = [
  { id: "q1", emoji: "⏱️", text: "What took longer than it should have today?", hint: "Work or leisure. A task, a conversation, a decision." },
  { id: "q2", emoji: "🔁", text: "What did you do today that you've done many times before?", hint: "Things you could do in your sleep — but still have to do." },
  { id: "q3", emoji: "🫵", text: "What happened today that only you could have done?", hint: "Your judgment, your relationships, your creativity." },
  { id: "q4", emoji: "😩", text: "What did you do today that you genuinely didn't want to do?", hint: "Work or leisure. The thing you kept putting off." },
  { id: "q5", emoji: "✨", text: "What made you lose track of time today?", hint: "Even briefly. At work, at home, anywhere." }
];

function downloadDoc(answers, dayLabel) {
  const date = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const escape = str => (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  const rows = QUESTIONS.map(q => {
    const answer = answers[q.id] || "";
    return `
      <w:p><w:pPr><w:spacing w:before="280" w:after="60"/></w:pPr>
        <w:r><w:rPr><w:b/><w:color w:val="6B21A8"/><w:sz w:val="24"/></w:rPr>
          <w:t>${escape(q.emoji + "  " + q.text)}</w:t>
        </w:r>
      </w:p>
      <w:p><w:pPr><w:ind w:left="360"/><w:spacing w:before="0" w:after="80"/></w:pPr>
        <w:r><w:rPr><w:i/><w:color w:val="6B7280"/><w:sz w:val="20"/></w:rPr>
          <w:t>${escape(q.hint)}</w:t>
        </w:r>
      </w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="240"/><w:shd w:val="clear" w:color="auto" w:fill="F3E8FF"/></w:pPr>
        <w:r><w:rPr><w:sz w:val="22"/><w:color w:val="1E1B2E"/></w:rPr>
          <w:t xml:space="preserve">${escape(answer)}</w:t>
        </w:r>
      </w:p>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    <w:p><w:pPr><w:spacing w:before="0" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="1E1B2E"/></w:rPr>
        <w:t>Stay Relevant in an AI World</w:t>
      </w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="24"/><w:color w:val="6B7280"/></w:rPr>
        <w:t>${escape(dayLabel)}  —  ${escape(date)}</w:t>
      </w:r>
    </w:p>
    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="E9D5FF"/></w:pBdr><w:spacing w:before="120" w:after="320"/></w:pPr>
      <w:r><w:t></w:t></w:r>
    </w:p>
    ${rows}
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="0"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="9CA3AF"/></w:rPr>
        <w:t>Stay Relevant in an AI World — Daily Reflection</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:wordDocument>`;

  const blob = new Blob([xml], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reflection-${dayLabel.toLowerCase().replace(/\s+/g, "-")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const ref = useRef(null);
  const toggle = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input isn't supported in this browser. Try Chrome or Safari, or simply type your answer.");
      return;
    }
    if (listening) { ref.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true; r.interimResults = false; r.lang = navigator.language || "en-US";
    r.onresult = e => onTranscript(Array.from(e.results).map(r => r[0].transcript).join(" "));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); ref.current = r; setListening(true);
  };
  return (
    <button onClick={toggle} title={listening ? "Stop recording" : "Speak your answer"} style={{
      width: 46, height: 46, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0,
      background: listening ? "rgba(239,68,68,0.2)" : "rgba(168,85,247,0.15)",
      color: listening ? "#ef4444" : "#c084fc", fontSize: 20,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: listening ? "0 0 0 3px rgba(239,68,68,0.3)" : "none",
      transition: "all 0.2s"
    }}>{listening ? "⏹" : "🎙️"}</button>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState("");
  const [dayLabel, setDayLabel] = useState("Day 1");
  const [fadeIn, setFadeIn] = useState(true);

  const transition = (fn) => {
    setFadeIn(false);
    setTimeout(() => { fn(); setFadeIn(true); }, 200);
  };

  const currentQ = QUESTIONS[step - 1];
  const isLast = step === QUESTIONS.length;

  const next = () => {
    if (!draft.trim()) return;
    // Build the complete answers object including the current draft
    const updatedAnswers = { ...answers, [currentQ.id]: draft.trim() };
    if (isLast) {
      // Set answers explicitly before moving to done screen so download has all 5
      setAnswers(updatedAnswers);
      transition(() => { setStep(6); setDraft(""); });
    } else {
      setAnswers(updatedAnswers);
      const nextAnswer = updatedAnswers[QUESTIONS[step].id] || "";
      transition(() => { setStep(step + 1); setDraft(nextAnswer); });
    }
  };

  const S = {
    app: { minHeight: "100vh", background: "#0c0c0f", color: "#e2e2ea", fontFamily: "'Georgia','Times New Roman',serif", display: "flex", flexDirection: "column" },
    header: { padding: "18px 28px", borderBottom: "1px solid #2a2a38", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontSize: 13, fontStyle: "italic", color: "#c0c0d8" },
    badge: { fontSize: 11, fontFamily: "monospace", color: "#a855f7", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", padding: "4px 10px", borderRadius: 20, letterSpacing: "0.08em" },
    main: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", opacity: fadeIn ? 1 : 0, transition: "opacity 0.2s ease" },
    card: { width: "100%", maxWidth: 560, background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 20, padding: "40px 44px", boxShadow: "0 4px 40px rgba(0,0,0,0.5)" },
    eyebrow: { fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9090b0", marginBottom: 20 },
    h1: { fontSize: 26, fontWeight: "normal", fontStyle: "italic", color: "#f4f4fc", lineHeight: 1.35, marginBottom: 12 },
    body: { fontSize: 15, lineHeight: 1.85, color: "#c0c0d8", marginBottom: 28 },
    hint: { fontSize: 13, color: "#9090a8", fontStyle: "italic", marginBottom: 20, lineHeight: 1.6 },
    textarea: { width: "100%", minHeight: 140, background: "#0c0c0f", border: "1px solid #3a3a4a", borderRadius: 12, padding: 16, color: "#f0f0f8", fontSize: 15, fontFamily: "'Georgia',serif", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" },
    row: { display: "flex", gap: 10, alignItems: "flex-start" },
    btn: { padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'Georgia',serif", fontStyle: "italic", background: "#a855f7", color: "#fff", transition: "all 0.15s" },
    btnGhost: { background: "transparent", border: "1px solid #3a3a4a", color: "#c0c0d8" },
    progressBar: { height: 3, background: "#2a2a38", borderRadius: 2, overflow: "hidden", marginBottom: 0 },
    progressFill: { height: "100%", background: "linear-gradient(90deg,#a855f7,#ec4899)", borderRadius: 2, transition: "width 0.4s ease", width: `${(Math.max(0, step - 1) / QUESTIONS.length) * 100}%` },
    downloadBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px 32px", borderRadius: 12, border: "1px solid rgba(168,85,247,0.4)", background: "rgba(168,85,247,0.1)", color: "#c084fc", cursor: "pointer", fontSize: 15, fontFamily: "'Georgia',serif", fontStyle: "italic", transition: "all 0.15s" },
    dots: { display: "flex", gap: 8, marginBottom: 28 },
    dot: (i) => ({ width: 8, height: 8, borderRadius: "50%", background: i < step - 1 ? "#a855f7" : i === step - 1 ? "#ec4899" : "#2a2a3a", transition: "background 0.3s" }),
    nudge: { background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 22, display: "flex", gap: 10, alignItems: "flex-start" },
  };

  // ── WELCOME ───────────────────────────────────────────────────────────────────

  if (step === 0) return (
    <div style={S.app}>
      <div style={S.header}>
        <span style={S.logo}>Stay Relevant in an AI World</span>
        <span style={S.badge}>DAILY REFLECTION</span>
      </div>
      <div style={S.main}>
        <div style={S.card}>
          <div style={S.eyebrow}>Welcome</div>
          <h1 style={S.h1}>Five questions. Five minutes.<br />One honest look at your day.</h1>
          <p style={S.body}>
            Answer five short questions about your day — work and leisure both.
            Write as much or as little as feels natural. At the end, you'll download
            your answers as a document to keep.
          </p>
          <p style={{ ...S.hint, marginBottom: 28 }}>
            🌍 Answer in any language. Use the microphone button to speak instead of type.
          </p>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, color: "#9090b0", display: "block", marginBottom: 8, fontStyle: "italic" }}>What day is this for you?</label>
            <input
              type="text"
              value={dayLabel}
              onChange={e => setDayLabel(e.target.value)}
              placeholder="e.g. Day 1, Monday, Week 2 Day 3…"
              style={{ ...S.textarea, minHeight: "unset", padding: "12px 16px", fontSize: 14 }}
            />
          </div>
          <button style={S.btn} onClick={() => transition(() => { setStep(1); setDraft(""); })}>
            Begin →
          </button>
        </div>
      </div>
    </div>
  );

  // ── QUESTIONS ─────────────────────────────────────────────────────────────────

  if (step >= 1 && step <= QUESTIONS.length) return (
    <div style={S.app}>
      <div style={S.header}>
        <span style={S.logo}>Stay Relevant in an AI World</span>
        <span style={S.badge}>{step} / {QUESTIONS.length}</span>
      </div>
      <div style={S.main}>
        <div style={{ width: "100%", maxWidth: 560, marginBottom: 8 }}>
          <div style={S.progressBar}><div style={S.progressFill} /></div>
        </div>
        <div style={S.card}>
          <div style={S.dots}>
            {QUESTIONS.map((_, i) => <div key={i} style={S.dot(i)} />)}
          </div>
          <div style={S.nudge}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>📅</span>
            <p style={{ margin: 0, fontSize: 13, color: "#c8c0e0", lineHeight: 1.65, fontStyle: "italic" }}>
              Keep your calendar open nearby — let it remind you what actually happened. Nothing in it? Walk your day back by time, by place, by who you spoke to.
            </p>
          </div>
          <div style={{ fontSize: 32, marginBottom: 14 }}>{currentQ.emoji}</div>
          <h1 style={{ ...S.h1, fontSize: 21 }}>{currentQ.text}</h1>
          <p style={S.hint}>{currentQ.hint}</p>
          <div style={S.row}>
            <textarea
              key={step}
              style={{ ...S.textarea, marginBottom: 0, flex: 1 }}
              placeholder="A paragraph or two is ideal…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
            />
            <MicButton onTranscript={t => setDraft(p => p ? p + " " + t : t)} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              style={{ ...S.btn, opacity: draft.trim() ? 1 : 0.4, cursor: draft.trim() ? "pointer" : "not-allowed" }}
              onClick={next}
              disabled={!draft.trim()}
            >
              {isLast ? "Finish →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DONE ──────────────────────────────────────────────────────────────────────

  return (
    <div style={S.app}>
      <div style={S.header}>
        <span style={S.logo}>Stay Relevant in an AI World</span>
        <span style={S.badge}>DONE</span>
      </div>
      <div style={S.main}>
        <div style={S.card}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <div style={S.eyebrow}>All five questions answered</div>
          <h1 style={S.h1}>Your reflection for {dayLabel} is complete.</h1>
          <p style={S.body}>
            Download your answers now as a Word document. Keep it somewhere safe —
            after five days of reflections, you'll use them all for your analysis.
          </p>
          <button style={S.downloadBtn} onClick={() => downloadDoc(answers, dayLabel)}>
            ↓ Download {dayLabel} answers
          </button>
          <div style={{ marginTop: 16 }}>
            <button
              style={{ ...S.btn, ...S.btnGhost, width: "100%", textAlign: "center" }}
              onClick={() => transition(() => { setStep(0); setAnswers({}); setDraft(""); setDayLabel("Day 1"); })}
            >
              Start a new reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
