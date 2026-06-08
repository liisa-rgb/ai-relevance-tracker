import { useState, useRef } from "react";

const QUESTIONS = [
  { id: "q1", num: "01", text: "What took longer than it should have today?", hint: "Work or leisure. A task, a conversation, a decision." },
  { id: "q2", num: "02", text: "What did you do today that you have done many times before?", hint: "Things you could do in your sleep — but still have to do." },
  { id: "q3", num: "03", text: "What happened today that only you could have done?", hint: "Your judgment, your relationships, your creativity." },
  { id: "q4", num: "04", text: "What did you do today that you genuinely did not want to do?", hint: "Work or leisure. The thing you kept putting off." },
  { id: "q5", num: "05", text: "What made you lose track of time today?", hint: "Even briefly. At work, at home, anywhere." }
];

// N-cut bullet — the brand triangle
const NTriangle = ({ color = "currentColor", size = 10 }) => (
  <svg
    width={size * 2.5} height={size}
    viewBox="0 0 25 10"
    aria-hidden="true"
    style={{ flexShrink: 0, display: "inline-block" }}
  >
    <polygon fill={color} points="25,10 25,0 0,10" />
  </svg>
);

// Arrow right for buttons
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6 }}>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function downloadDoc(answers, dayLabel) {
  const date = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const escape = str => (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  const rows = QUESTIONS.map(q => {
    const answer = answers[q.id] || "";
    return `
      <w:p><w:pPr><w:spacing w:before="280" w:after="60"/></w:pPr>
        <w:r><w:rPr><w:b/><w:color w:val="230064"/><w:sz w:val="24"/></w:rPr>
          <w:t>${escape(q.num + "  " + q.text)}</w:t>
        </w:r>
      </w:p>
      <w:p><w:pPr><w:ind w:left="360"/><w:spacing w:before="0" w:after="80"/></w:pPr>
        <w:r><w:rPr><w:i/><w:color w:val="6b6480"/><w:sz w:val="20"/></w:rPr>
          <w:t>${escape(q.hint)}</w:t>
        </w:r>
      </w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="240"/><w:shd w:val="clear" w:color="auto" w:fill="c8e1ff"/></w:pPr>
        <w:r><w:rPr><w:sz w:val="22"/><w:color w:val="230064"/></w:rPr>
          <w:t xml:space="preserve">${escape(answer)}</w:t>
        </w:r>
      </w:p>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    <w:p><w:pPr><w:spacing w:before="0" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="230064"/></w:rPr>
        <w:t>Where Does Your Time Go</w:t>
      </w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="22"/><w:color w:val="6b6480"/></w:rPr>
        <w:t>${escape(dayLabel)}  —  ${escape(date)}</w:t>
      </w:r>
    </w:p>
    <w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="c8e1ff"/></w:pBdr><w:spacing w:before="120" w:after="320"/></w:pPr>
      <w:r><w:t></w:t></w:r>
    </w:p>
    ${rows}
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="0"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="6b6480"/></w:rPr>
        <w:t>Where Does Your Time Go — Daily Reflection</w:t>
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
      alert("Voice input is not supported in this browser. Try Chrome or Safari, or simply type your answer.");
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
    <button
      onClick={toggle}
      title={listening ? "Stop recording" : "Speak your answer"}
      style={{
        width: 46, height: 46, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0,
        background: listening ? "#ff3787" : "#c8e1ff",
        color: "#230064", fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 160ms",
      }}
    >
      {listening ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="10" height="10" rx="2" fill="white" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="6" y="1" width="6" height="10" rx="3" stroke="#230064" strokeWidth="1.5" />
          <path d="M2 9a7 7 0 0014 0" stroke="#230064" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="16" x2="9" y2="18" stroke="#230064" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
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
    setTimeout(() => { fn(); setFadeIn(true); }, 160);
  };

  const currentQ = QUESTIONS[step - 1];
  const isLast = step === QUESTIONS.length;

  const next = () => {
    if (!draft.trim()) return;
    const updatedAnswers = { ...answers, [currentQ.id]: draft.trim() };
    if (isLast) {
      setAnswers(updatedAnswers);
      transition(() => { setStep(6); setDraft(""); });
    } else {
      setAnswers(updatedAnswers);
      const nextAnswer = updatedAnswers[QUESTIONS[step].id] || "";
      transition(() => { setStep(step + 1); setDraft(nextAnswer); });
    }
  };

  const progressPct = Math.max(0, step - 1) / QUESTIONS.length * 100;

  // ── SHARED STYLES ─────────────────────────────────────────────────────────────
  const S = {
    app:    { minHeight: "100vh", background: "#fff", color: "#230064", fontFamily: "var(--font-body)", display: "flex", flexDirection: "column" },
    header: { padding: "16px 28px", borderBottom: "1px solid rgba(35,0,100,0.10)", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo:   { fontSize: 15, fontFamily: "var(--font-headline)", fontWeight: 400, color: "#230064", letterSpacing: "-0.01em" },
    badge:  { fontSize: 11, fontFamily: "var(--font-body)", fontWeight: 700, color: "#230064", background: "#c8e1ff", padding: "4px 12px", borderRadius: 9999, letterSpacing: "0.18em", textTransform: "uppercase" },
    main:   { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", opacity: fadeIn ? 1 : 0, transition: "opacity 160ms ease" },
    card:   { width: "100%", maxWidth: 560, background: "#fff", border: "1px solid rgba(35,0,100,0.10)", borderRadius: 24, padding: "40px 44px" },
    eyebrow: { fontSize: 11, fontFamily: "var(--font-body)", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(35,0,100,0.50)", marginBottom: 16, display: "block" },
    h1:     { fontSize: 26, fontFamily: "var(--font-headline)", fontWeight: 400, color: "#230064", lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 14 },
    body:   { fontSize: 16, lineHeight: 1.6, color: "rgba(35,0,100,0.65)", marginBottom: 24 },
    hint:   { fontSize: 14, lineHeight: 1.6, color: "rgba(35,0,100,0.50)", marginBottom: 20 },
    label:  { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(35,0,100,0.50)", display: "block", marginBottom: 8 },
    input:  { width: "100%", background: "#f5f3fb", border: "1px solid rgba(35,0,100,0.10)", borderRadius: 12, padding: "12px 16px", color: "#230064", fontSize: 15, lineHeight: 1.6 },
    textarea: { width: "100%", minHeight: 140, background: "#f5f3fb", border: "1px solid rgba(35,0,100,0.10)", borderRadius: 12, padding: 16, color: "#230064", fontSize: 15, lineHeight: 1.7, resize: "vertical" },
    row:    { display: "flex", gap: 10, alignItems: "flex-start" },
    // Buttons — always pill (rounded-full)
    btnPrimary:   { padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-body)", background: "#230064", color: "#fff", transition: "background 160ms", display: "inline-flex", alignItems: "center" },
    btnSecondary: { padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-body)", background: "#ff3787", color: "#fff", transition: "background 160ms", display: "inline-flex", alignItems: "center" },
    btnOutline:   { padding: "14px 32px", borderRadius: 9999, border: "2px solid #230064", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-body)", background: "transparent", color: "#230064", transition: "all 160ms", display: "inline-flex", alignItems: "center" },
    // Progress bar
    progressBar:  { height: 3, background: "rgba(35,0,100,0.10)", overflow: "hidden", marginBottom: 0 },
    progressFill: { height: "100%", background: "#ff3787", transition: "width 0.4s ease", width: `${progressPct}%` },
    // Nudge
    nudge: { background: "#c8e1ff", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" },
    // Download button
    downloadBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px 32px", borderRadius: 9999, border: "none", background: "#ff3787", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-body)", transition: "background 160ms" },
  };

  // ── WELCOME ───────────────────────────────────────────────────────────────────

  if (step === 0) return (
    <div style={S.app}>
      <div style={S.header}>
        <span style={S.logo}>Where Does Your Time Go</span>
        <span style={S.badge}>Tracker</span>
      </div>
      <div style={S.main}>
        <div style={S.card}>
          <span style={S.eyebrow}>Welcome</span>
          <h1 style={S.h1}>Five questions. Five minutes.<br />One honest look at your day.</h1>
          <p style={S.body}>
            Answer five short questions about your day — work and leisure both.
            Write as much or as little as feels natural. At the end, you will download
            your answers as a document to keep.
          </p>
          <p style={{ ...S.hint, marginBottom: 28 }}>
            Answer in any language. Use the microphone button to speak instead of type.
          </p>
          <div style={{ marginBottom: 28 }}>
            <label style={S.label}>What day is this for you?</label>
            <input
              type="text"
              value={dayLabel}
              onChange={e => setDayLabel(e.target.value)}
              placeholder="e.g. Day 1, Monday, Week 2 Day 3…"
              style={S.input}
            />
          </div>
          <button style={S.btnPrimary} onClick={() => transition(() => { setStep(1); setDraft(""); })}>
            Begin<ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );

  // ── QUESTIONS ─────────────────────────────────────────────────────────────────

  if (step >= 1 && step <= QUESTIONS.length) return (
    <div style={S.app}>
      <div style={S.header}>
        <span style={S.logo}>Where Does Your Time Go</span>
        <span style={S.badge}>{step} / {QUESTIONS.length}</span>
      </div>
      <div style={{ ...S.progressBar, width: "100%" }}>
        <div style={S.progressFill} />
      </div>
      <div style={S.main}>
        <div style={S.card}>
          {/* N-cut progress indicators */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 28 }}>
            {QUESTIONS.map((_, i) => (
              <NTriangle
                key={i}
                color={i < step - 1 ? "#230064" : i === step - 1 ? "#ff3787" : "rgba(35,0,100,0.15)"}
                size={i === step - 1 ? 11 : 9}
              />
            ))}
          </div>

          <div style={S.nudge}>
            <NTriangle color="#230064" size={10} />
            <p style={{ margin: 0, fontSize: 13, color: "#230064", lineHeight: 1.65 }}>
              Keep your calendar open nearby — let it remind you what actually happened. Nothing in it? Walk your day back by time, by place, by who you spoke to.
            </p>
          </div>

          <span style={{ ...S.eyebrow, color: "#ff3787" }}>Question {currentQ.num}</span>
          <h1 style={{ ...S.h1, fontSize: 20 }}>{currentQ.text}</h1>
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
              style={{ ...S.btnPrimary, opacity: draft.trim() ? 1 : 0.35, cursor: draft.trim() ? "pointer" : "not-allowed" }}
              onClick={next}
              disabled={!draft.trim()}
            >
              {isLast ? "Finish" : "Next"}<ArrowRight />
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
        <span style={S.logo}>Where Does Your Time Go</span>
        <span style={{ ...S.badge, background: "#ff3787", color: "#fff" }}>Done</span>
      </div>
      <div style={S.main}>
        <div style={S.card}>
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {QUESTIONS.map((_, i) => <NTriangle key={i} color="#230064" size={9} />)}
          </div>
          <span style={S.eyebrow}>All five questions answered</span>
          <h1 style={S.h1}>Your reflection for {dayLabel} is complete.</h1>
          <p style={S.body}>
            Download your answers now as a Word document. Keep it somewhere safe —
            after five days of reflections, you will use them all for your analysis.
          </p>
          <button style={S.downloadBtn} onClick={() => downloadDoc(answers, dayLabel)}>
            Download {dayLabel} answers
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginLeft: 8 }}>
              <path d="M8 3v8M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ marginTop: 12 }}>
            <button
              style={{ ...S.btnOutline, width: "100%", justifyContent: "center" }}
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
