import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  sender: "user" | "agent";
  text: string;
}
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [sessionId] = useState("web-session-1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages((m) => [...m, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {

        session_id: sessionId,
          message: userText,

      });

      setMessages((m) => [...m, { sender: "agent", text: res.data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          sender: "agent",
          text:
            "[Error: Could not reach the server. Is the backend running on port 8000?]",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const starterPrompts = [
    "Help me figure out which area of AI suits me best.",
    "Find beginner-friendly AI/web dev competitions for a Class 11 student.",
    "Explain why my neural network loss is not going down.",
    "I feel overwhelmed juggling exams and projects. What should I do?",
    "Create a 6-month roadmap for AI + web development.",
  ];

  const handleStarterClick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="min-h-screen bg-[#020b0a] text-slate-100 flex flex-col">
      {/* Top nav bar */}
      <header className="h-12 border-b border-slate-800 bg-[#020b0a] flex items-center">
        <div className="w-full px-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-xs font-semibold text-black">
              PE
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-400">
                Personal Career Guide
              </span>
              <span className="text-sm font-semibold text-slate-50">
                Multi‑Agent Career Guide and Coach
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-slate-400">
            <span>Docs</span>
            <span>Agents</span>
            <span>Status</span>
          </div>
        </div>
      </header>

      {/* Main content: full viewport height minus header */}
      <main className="flex-1 bg-[#020b0a]">
        <div className="w-full h-[calc(100vh-48px)] flex">

          {/* Left sidebar */}
          <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#040f0e]">
            <div className="px-4 py-4 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Quick starters
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterClick(p)}
                  className="w-full text-left text-xs rounded-md border border-transparent hover:border-emerald-500/40 hover:bg-[#071814] px-3 py-2 text-slate-200 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="px-4 py-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p className="font-medium text-slate-300">Powered by</p>
              <p>Gemini · Google ADK · Multi‑agent orchestration</p>
            </div>
          </aside>

          {/* Center chat column */}
          <section className="flex-1 flex flex-col min-h-0">
            {/* Chat header row */}
            <div className="h-10 border-b border-slate-800 bg-[#040f0e] px-4 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Session active</span>
              </div>
              <span className="font-mono text-slate-500">{sessionId}</span>
            </div>

            {/* Messages area (scrollable) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4 bg-[#020b0a]">
              {messages.length === 0 && (
                <div className="text-sm text-slate-400 max-w-xl space-y-2">
                  <p className="font-medium text-slate-100">
                    Welcome. This space is your control panel for AI learning,
                    opportunities, and growth.
                  </p>
                  <p>
                    Type naturally. The orchestrator will route to interest
                    discovery, research, opportunities, debugging, mindset, or
                    planning agents as needed.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tip: Start with a concrete goal or problem, like
                    “I want to win a hackathon in 3 months”.
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] px-3 py-2.5 rounded-md text-sm leading-relaxed border ${

                    m.sender === "user"
                      ? "ml-auto bg-emerald-500 text-black border-emerald-400 shadow-sm shadow-emerald-900/60"
                      : "mr-auto bg-[#040f0e] text-slate-100 border-slate-800"
                  }`}
                >
                  {m.sender === "agent" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-auto text-xs text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
                  Agent is thinking…
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input bar (fixed at bottom of column, no extra gap) */}
            <div className="border-t border-slate-800 bg-[#040f0e] px-4 py-3">
              <div className="w-full flex gap-2 items-end">

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  className="flex-1 resize-none text-sm bg-[#020b0a] border border-slate-700 rounded-md px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ask anything — interests, research, opportunities, debugging, mindset, planning. Enter to send, Shift+Enter for new line."
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 rounded-md bg-emerald-500 text-sm font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
                >
                  {loading ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
