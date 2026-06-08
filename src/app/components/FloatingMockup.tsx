export function FloatingMockup() {
  return (
    <div className="relative w-full max-w-sm xl:max-w-md" style={{ perspective: "1000px" }}>
      {/* Main dashboard card */}
      <div className="relative rounded-3xl p-5 shadow-2xl"
        style={{
          background: "#1E293B",
          border: "1px solid rgba(255,255,255,0.12)",
          transform: "rotateY(-8deg) rotateX(4deg)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
        }}>
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
              S
            </div>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#FFFFFF" }}>Sheldon</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.7rem", color: "#94A3B8" }}>@sheldon.design</p>
            </div>
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.65rem",
            color: "#0F172A", background: "#FFFFFF", borderRadius: "999px", padding: "0.2rem 0.6rem", letterSpacing: "0.05em"
          }}>PRO</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Listings", value: "16" },
            { label: "Applied", value: "312" },
            { label: "Saved", value: "24" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#FFFFFF" }}>{value}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.65rem", color: "#94A3B8" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Smart match highlight card */}
        <div className="rounded-2xl p-4 mb-3"
          style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "#0F172A" }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="3" fill="white" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#0F172A" }}>InternTrack AI</span>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.6rem", color: "#64748B", background: "#F1F5F9", borderRadius: "999px", padding: "0.15rem 0.5rem" }}>Smart Match</span>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.7rem", color: "#475569", lineHeight: 1.5 }}>
            3 new roles matching your profile in Product Design & UX Research.
          </p>
        </div>

        {/* Mini listing item */}
        {[
          { role: "Product Design Intern", company: "Figma", tag: "Remote · Paid" },
          { role: "UX Research Intern", company: "Notion", tag: "Hybrid · Paid" },
        ].map((item) => (
          <div key={item.role} className="flex items-center justify-between py-2.5 px-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
                {item.company[0]}
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.72rem", color: "#FFFFFF" }}>{item.role}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.63rem", color: "#64748B" }}>{item.company} · {item.tag}</p>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#94A3B8" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Floating secondary card — bottom right */}
      <div className="absolute -bottom-6 -right-4 rounded-2xl px-4 py-3 shadow-xl"
        style={{
          background: "#0F172A",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          minWidth: "160px"
        }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: "#FFFFFF" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.7rem", color: "#FFFFFF" }}>Applications</span>
        </div>
        <div className="flex items-end gap-1">
          {[3, 5, 4, 7, 6, 9, 8].map((h, i) => (
            <div key={i} className="rounded-sm w-3 transition-all"
              style={{ height: `${h * 3}px`, background: i === 5 ? "#FFFFFF" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.6rem", color: "#64748B", marginTop: "4px" }}>Last 7 days</p>
      </div>

      {/* Floating chip — top right */}
      <div className="absolute -top-4 -right-6 rounded-full px-3 py-1.5 shadow-lg"
        style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#0F172A" }}>
          ✦ 94% Match
        </span>
      </div>
    </div>
  );
}
