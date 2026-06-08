interface ListingCardProps {
  role: string;
  company: string;
  location: string;
  tags: string[];
  logo: string;
  daysAgo: number;
}

export function ListingCard({ role, company, location, tags, logo, daysAgo }: ListingCardProps) {
  return (
    <div className="group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300"
      style={{
        background: "#1E293B",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}>
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold"
          style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontFamily: "'Manrope', sans-serif", fontWeight: 800 }}>
          {logo}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.7rem", color: "#475569" }}>{daysAgo}d ago</span>
      </div>

      <div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF", lineHeight: 1.3, marginBottom: "2px" }}>{role}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.8rem", color: "#94A3B8" }}>{company} · {location}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.68rem",
            color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px",
            padding: "0.2rem 0.65rem"
          }}>{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.72rem", color: "#475569" }}>Deadline in 14 days</span>
        <button style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.75rem",
          color: "#0F172A", background: "#FFFFFF", borderRadius: "999px",
          padding: "0.3rem 1rem", border: "none", cursor: "pointer", transition: "opacity 0.2s"
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}>
          Apply
        </button>
      </div>
    </div>
  );
}
