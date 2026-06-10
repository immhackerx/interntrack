import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
  onOpenModal: () => void;
  session: Session | null;
  onGoogleSignIn: () => void;
  onLogout: () => void;
}

export function Header({ onOpenModal, session, onGoogleSignIn, onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
      style={{ background: "var(--accent)", borderBottom: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: "var(--foreground)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="var(--background)" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="var(--background)" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="var(--background)" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" style={{ opacity: 0.3 }} />
          </svg>
        </div>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          InternTrack
        </span>
      </div>

      {/* Nav links — desktop */}
      <nav className="hidden md:flex items-center gap-8">
        {["Browse", "Companies", "Saved", "About"].map((link) => (
          <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.8, transition: "opacity 0.2s", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}>
            {link}
          </a>
        ))}
      </nav>

      {/* CTAs — desktop */}
      <div className="hidden md:flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem",
              marginRight: "0.5rem", color: "var(--foreground)"
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
        {session ? (
          <div className="flex items-center gap-4">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "var(--foreground)", fontWeight: 700 }}>
              👤 {session.user?.user_metadata?.full_name || session.user?.email}
            </span>
            <button 
              onClick={onLogout}
              style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.875rem",
                color: "var(--destructive)", border: "1px solid var(--destructive)", background: "transparent",
                borderRadius: "999px", padding: "0.45rem 1.25rem", cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--destructive)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--destructive-foreground)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--destructive)"; }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={onGoogleSignIn}
            style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.875rem",
              color: "var(--foreground)", border: "1px solid var(--foreground)", background: "transparent",
              borderRadius: "999px", padding: "0.45rem 1.25rem", cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--foreground)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--background)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
          >
            Sign In
          </button>
        )}

        <button
          onClick={onOpenModal}
          style={{
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.875rem",
            color: "var(--background)", background: "var(--foreground)", borderRadius: "999px",
            padding: "0.55rem 1.25rem", cursor: "pointer", border: "none",
            transition: "transform 0.2s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          + Post Role
        </button>
      </div>

      {/* Mobile menu button and CTA */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={onOpenModal}
          style={{
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#2D3748",
            background: "#FFFFFF", borderRadius: "999px", padding: "0.4rem 0.8rem",
            border: "none", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
          }}
        >
          Post
        </button>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: "#2D3748", background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu panel dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden flex flex-col gap-4 px-6 py-5"
          style={{ background: "#BDB96A", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
          {["Browse", "Companies", "Saved", "About"].map((link) => (
            <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#2D3748", textDecoration: "none" }}>{link}</a>
          ))}
          <hr style={{ borderColor: "rgba(45, 55, 72, 0.15)" }} />
          
          {session ? (
            <div className="flex flex-col gap-3">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: "#2D3748", fontWeight: 700 }}>
                👤 {session.user?.user_metadata?.full_name || session.user?.email}
              </span>
              <button 
                onClick={() => { onLogout(); setMobileOpen(false); }}
                style={{ textAlign: "left", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#DC2626", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { onGoogleSignIn(); setMobileOpen(false); }}
              style={{ textAlign: "left", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#2D3748", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}