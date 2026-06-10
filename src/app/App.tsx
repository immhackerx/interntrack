import { useState, useEffect, FormEvent, FC } from "react";
import { Header } from "./components/Header";
import { FloatingMockup } from "./components/FloatingMockup";
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import pd from 'pandas'; // Ensured environment consistency
import { ListingDetailPanel } from './components/ListingDetailPanel';
import { ListingGrid } from './components/ListingGrid';
import { KanbanBoard } from './components/KanbanBoard';
import { useAppContext } from './store/AppContext';
// Define the structure for an internship object for type-safety
export interface Internship {
  id: number;
  role: string;
  company: string;
  location: string;
  tags: string[];
  logo: string;
  daysAgo: number;
  is_new?: boolean;
  link?: string;
  apply_count?: number;
}

import { ListingCard } from './components/ListingCard';

// Modal component for submitting a new internship
const SubmissionModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formState: { [key: string]: string };
  setFormState: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}> = ({ isOpen, onClose, handleSubmit, formState, setFormState }) => {
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(45, 55, 72, 0.4)', backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', border: '1px solid #EAE8DF',
          borderRadius: '1.5rem', padding: '2rem', width: '100%',
          maxWidth: '500px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        }}
      >
        <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#2D3748', marginBottom: '0.5rem' }}>
          Submit Internship
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", color: '#718096', marginBottom: '2rem' }}>
          Your listing will be reviewed by our team before going live.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {(['Company', 'Title', 'Location', 'Stipend', 'Link'] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field.toLowerCase()} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem', display: 'block' }}>
                {field}
              </label>
              <input
                id={field.toLowerCase()}
                name={field.toLowerCase()}
                value={formState[field.toLowerCase()]}
                onChange={handleInputChange}
                type={field === 'Stipend' ? 'number' : 'text'}
                placeholder={
                  field === 'Company' ? 'e.g., Google' :
                    field === 'Title' ? 'e.g., Software Engineer Intern' :
                      field === 'Location' ? 'e.g., San Francisco, CA or Remote' :
                        field === 'Stipend' ? 'e.g., 5000' :
                          'https://apply-here.com'
                }
                required
                style={{
                  width: '100%', background: '#FDFBD4', border: '1.5px solid #EAE8DF',
                  borderRadius: '0.5rem', padding: '0.75rem 1rem',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#2D3748', outline: 'none',
                  transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
          <button type="submit" style={{
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#FDFBD4",
            background: "#2D3748", borderRadius: "0.5rem", padding: "0.85rem", marginTop: "1rem",
            border: "none", cursor: "pointer", transition: "opacity 0.2s"
          }}>
            Submit Listing for Review
          </button>
        </form>
      </div>
    </div>
  );
};

const FILTERS = ["All", "Remote", "On-site", "Paid", "Tech", "Design", "Marketing"];

export default function App() {
  const [listings, setListings] = useState<Internship[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    company: "",
    title: "",
    location: "",
    stipend: "",
    link: ""
  });
  const [view, setView] = useState<"public" | "admin" | "kanban">("public");
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { activeListing } = useAppContext();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching listings:', error);
          setIsLoading(false);
        } else if (data) {
          const mappedData = data.map((item: any) => {

            // ⚡ DYNAMIC AUTOMATED CATEGORIZATION ENGINE
            const dynamicTags: string[] = [];
            const roleTitle = (item.role || "").toLowerCase();
            const locString = (item.location || "").toLowerCase();

            // 1. Financial Classification
            if (item.stipend && item.stipend > 0) {
              dynamicTags.push("Paid");
            }

            // 2. Workplace Environment Classification
            if (locString.includes("remote")) {
              dynamicTags.push("Remote");
            } else {
              dynamicTags.push("On-site");
            }

            // 3. Domain Functional Classification
            const isDesign = roleTitle.includes("design") || roleTitle.includes("ux") || roleTitle.includes("ui") || roleTitle.includes("graphic");
            const isMarketing = roleTitle.includes("marketing") || roleTitle.includes("social media") || roleTitle.includes("seo") || roleTitle.includes("content");

            if (isDesign) {
              dynamicTags.push("Design");
            } else if (isMarketing) {
              dynamicTags.push("Marketing");
            } else {
              // Default fallback handles development, data science, cyber, devops, cloud, and engineering
              dynamicTags.push("Tech");
            }

            return {
              id: item.id,
              role: item.role,
              company: item.company,
              location: item.location,
              tags: dynamicTags, // ⚡ Injects dynamically computed categories matching your filter pills perfectly!
              logo: item.company ? item.company.substring(0, 2) : "IT",
              daysAgo: 0,
              is_new: item.is_verified === false,
              link: item.link,
              apply_count: item.apply_count || 0
            };
          });

          setListings(mappedData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
        setIsLoading(false);
      }
    };
    fetchListings();

    const listingsSubscription = supabase
      .channel('public:listings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings' },
        (payload) => {
          setListings(currentListings => 
            currentListings.map(listing => 
              listing.id === payload.new.id 
                ? { ...listing, apply_count: payload.new.apply_count }
                : listing
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsSubscription);
    };
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/interntrack/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase OAuth Error:", error.message);
      alert(`Sign in failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('public');
    showNotification("Logged out successfully! 👋");
  };

  const handleOpenPostModal = () => {
    if (!session) {
      alert("Authentication Required: Please sign in with Google to post an internship listing.");
      handleGoogleSignIn();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          role: formState.title,
          company: formState.company,
          location: formState.location,
          stipend: formState.stipend,
          link: formState.link,
          is_verified: false
        }
      ]).select();

    if (error) {
      console.error("Supabase Error during insert:", error.message, error.details);
      alert(`Submission blocked by database: ${error.message}`);
    } else if (data) {
      const newListing = {
        id: data[0].id,
        role: data[0].role,
        company: data[0].company,
        location: data[0].location,
        tags: data[0].stipend ? ["Paid", "Tech"] : ["Tech"],
        logo: data[0].company ? data[0].company.substring(0, 2) : "IT",
        daysAgo: 0,
        is_new: true,
        link: data[0].link
      };
      setListings([newListing, ...listings]);
      setFormState({ company: "", title: "", location: "", stipend: "", link: "" });
      setIsModalOpen(false);
      alert("Listing submitted successfully! It will appear on the dashboard after review.");
    }
  };

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('listings')
      .update({ is_verified: true })
      .eq('id', id);

    if (error) {
      console.error("Error approving listing:", error);
    } else {
      setListings(listings.map(l => l.id === id ? { ...l, is_new: false } : l));
      showNotification("Listing Approved & Pushed Live! 🚀");
    }
  };

  // ⚡ NEW: MASS BATCH APPROVAL CONTROLLER
  const handleApproveAll = async () => {
    const pendingIds = listings.filter(l => l.is_new).map(l => l.id);

    if (pendingIds.length === 0) {
      alert("No pending roles to approve, bro!");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve all ${pendingIds.length} pending internships at once?`)) {
      return;
    }

    const { error } = await supabase
      .from('listings')
      .update({ is_verified: true })
      .in('id', pendingIds); // Executes high-speed batch rewrite index query

    if (error) {
      console.error("Error batch-approving listings:", error);
      alert(`Batch update failed: ${error.message}`);
    } else {
      setListings(listings.map(l => pendingIds.includes(l.id) ? { ...l, is_new: false } : l));
      showNotification(`Successfully Approved All ${pendingIds.length} Internships! 🚀🔥`);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting listing:", error);
    } else {
      setListings(listings.filter(l => l.id !== id));
      showNotification("Spam Entry Permanently Vaporized! ❌");
    }
  };

  const handleAdminAccess = () => {
    const password = prompt("Enter Master Admin Access Key:");
    const secretKey = "priyanshu2026";

    if (password === secretKey) {
      setView('admin');
    } else {
      alert("Access Denied: Invalid Master Credentials.");
    }
  };

  const downloadCSV = () => {
    const headers = "ID,Company,Role,Location,Tags,Status";
    const rows = listings.map(l =>
      [
        l.id,
        `"${l.company.replace(/"/g, '""')}"`,
        `"${l.role.replace(/"/g, '""')}"`,
        `"${l.location.replace(/"/g, '""')}"`,
        `"${l.tags.join('; ')}"`,
        l.is_new ? "Pending" : "Live"
      ].join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "interntrack_database_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const publicListings = listings.filter(l => !l.is_new).filter((l) => {
    const matchesFilter = activeFilter === "All" || l.tags.includes(activeFilter);
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      l.role.toLowerCase().includes(query) ||
      l.company.toLowerCase().includes(query) ||
      l.location.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const adminListings = listings.filter(l => l.is_new);

  const totalLive = listings.filter(l => !l.is_new).length;
  const totalPending = adminListings.length;
  const totalDatabase = listings.length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#FDFBD4", minHeight: "100vh", color: "#2D3748", overflowX: "hidden" }}>

      <Header
        onOpenModal={handleOpenPostModal}
        session={session}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
      />

      {view !== 'admin' ? (
        <div>
          <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EAE8DF', padding: '0.75rem 2rem', marginTop: '70px' }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "monospace", fontSize: '0.75rem', color: '#718096' }}>⚡ Database Status: Sync Active</span>
              <button
                onClick={handleAdminAccess}
                style={{
                  background: '#2D3748', color: '#FDFBD4', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '0.75rem',
                  padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                🔧 Enter Admin Panel
              </button>
            </div>
          </div>

          <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 px-6 md:px-12 xl:px-20 pt-16 pb-24"
            style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(ellipse at center, rgba(189,185,106,0.05) 0%, transparent 70%)", zIndex: 0 }} />
            <div className="relative z-10 flex-1 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1"
                style={{ background: "#FFFFFF", border: "1px solid #EAE8DF" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#2D3748" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.72rem", color: '#718096', letterSpacing: "0.04em" }}>
                  NOW IN BETA — {publicListings.length} internships live
                </span>
              </div>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06, marginBottom: "1.25rem", fontSize: "clamp(2.6rem, 6vw, 4.2rem)", color: "#2D3748" }}>
                Track Your Dream Internship
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "1.05rem", color: '#718096', lineHeight: 1.7, marginBottom: "2.25rem", maxWidth: "480px" }}>
                InternTrack helps students discover, filter, and organize internship
                opportunities from top companies — all in one elegant dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {session ? (
                  <a
                    href="#listings-grid"
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#FFFFFF",
                      background: "#2D3748",
                      borderRadius: "999px",
                      padding: "0.75rem 1.9rem",
                      textDecoration: "none",
                      display: "inline-block",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
                  >
                    Open Dashboard 👇
                  </a>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#FFFFFF",
                      background: "#2D3748",
                      borderRadius: "999px",
                      padding: "0.75rem 1.9rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  >
                    Get Started
                  </button>
                )}

                {!session && (
                  <a href="#listings-grid" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.875rem", color: '#718096', textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                    Explore Listings →
                  </a>
                )}
              </div>
            </div>
            <div className="relative z-10 flex-1 flex justify-center lg:justify-end">
              <FloatingMockup />
            </div>
          </section>

          <div className="sticky top-[70px] z-40 px-6 md:px-12 py-4"
            style={{ background: "rgba(253, 251, 212, 0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #EAE8DF" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#718096" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search internships by role, company, or location..."
                  style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid #EAE8DF", borderRadius: "999px", padding: "0.85rem 1.25rem 0.85rem 2.75rem", fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.9rem", color: "#2D3748", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 py-5" style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`font-inter font-medium text-[0.78rem] rounded-full px-4 py-1.5 cursor-pointer border-[1.5px] transition-colors
                      ${activeFilter === f 
                        ? 'bg-slate-800 text-[#FDFBD4] border-slate-800 dark:bg-emerald-500 dark:text-slate-900 dark:border-emerald-500' 
                        : 'bg-white text-slate-500 border-[#EAE8DF] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl self-start">
                <button
                  onClick={() => setView('public')}
                  className={`px-4 py-2 rounded-lg font-manrope font-bold text-sm transition-all ${view === 'public' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`px-4 py-2 rounded-lg font-manrope font-bold text-sm transition-all ${view === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  My Application Tracker
                </button>
              </div>
            </div>
          </div>

          <section id="workspace" className="px-6 md:px-12 pb-24" style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {view === 'public' && (
              <div className="flex flex-col lg:flex-row gap-6 relative">
                <ListingGrid 
                  isLoading={isLoading} 
                  publicListings={publicListings} 
                  search={search} 
                  setActiveFilter={setActiveFilter} 
                  setSearch={setSearch} 
                />
                
                {/* Right Split Pane / Detail Drawer */}
                {activeListing && (
                  <div className="hidden lg:block lg:w-1/3 shrink-0">
                    <ListingDetailPanel />
                  </div>
                )}
              </div>
            )}

            {view === 'kanban' && (
              <KanbanBoard />
            )}
          </section>
        </div>
      ) : (
        <div>
          <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EAE8DF', padding: '0.75rem 2rem', marginTop: '70px' }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "monospace", fontSize: '0.75rem', color: '#718096' }}>🔧 Admin Control Workspace</span>
              <button
                onClick={() => setView('public')}
                style={{
                  background: '#2D3748', color: '#FDFBD4', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '0.75rem',
                  padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer'
                }}
              >
                🚀 Return to Dashboard
              </button>
            </div>
          </div>

          <section id="admin-deck" className="px-6 md:px-12 py-16" style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "#2D3748", letterSpacing: "-0.03em" }}>
                  Admin Control Deck
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", color: '#718096', marginTop: '0.25rem' }}>
                  Manage, approve, and delete new student-submitted internship roles.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'stretch', sm: { alignSelf: 'auto' } }}>
                {/* ⚡ THE BATCH MULTI-APPROVE ACTION TRIGGER BUTTON */}
                <button
                  onClick={handleApproveAll}
                  style={{
                    background: '#2D3748',
                    color: '#FDFBD4',
                    fontSize: '0.75rem',
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 800,
                    padding: '0.6rem 1.2rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(45, 55, 72, 0.15)',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ⚡ Approve All Pending ({totalPending})
                </button>
                <button onClick={downloadCSV} style={{ background: '#FFFFFF', border: '1px solid #EAE8DF', color: '#2D3748', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', height: 'fit-content' }}>
                  📥 Export Database (.CSV)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div style={{ background: '#FFFFFF', border: '1px solid #EAE8DF', padding: '1.25rem', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Directories</p>
                <p style={{ fontSize: '1.75rem', fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: '#2D3748', marginTop: '0.25rem' }}>{totalLive}</p>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #EAE8DF', padding: '1.25rem', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Reviews</p>
                <p style={{ fontSize: '1.75rem', fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: '#2D3748', marginTop: '0.25rem' }}>{totalPending}</p>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #EAE8DF', padding: '1.25rem', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Database Rows</p>
                <p style={{ fontSize: '1.75rem', fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: '#718096', marginTop: '0.25rem' }}>{totalDatabase}</p>
              </div>
            </div>

            {adminListings.length > 0 ? (
              <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
                {adminListings.map((listing) => (
                  <div key={listing.id} className="flex flex-col gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <ListingCard {...listing} searchQuery={search} />
                    <div className="flex items-center gap-2 px-2 pb-2">
                      <button onClick={() => handleApprove(listing.id)}
                        style={{ flex: 1, background: 'rgba(0, 0, 0, 0.04)', border: '1px solid rgba(0, 0, 0, 0.08)', color: '#2D3748', fontSize: '0.8rem', padding: '0.6rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                        Approve & Go Live
                      </button>
                      <button onClick={() => handleDelete(listing.id)}
                        style={{ flex: 1, background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.1)', color: '#DC2626', fontSize: '0.8rem', padding: '0.6rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                        Delete Spam
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20" style={{ background: '#FFFFFF', borderRadius: '1rem', border: '1px solid #EAE8DF' }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#2D3748" }}>All clear!</p>
                <p style={{ fontFamily: "'Inter', sans-serif", color: '#718096', fontSize: "0.85rem" }}>There are no unverified roles pending review.</p>
              </div>
            )}
          </section>
        </div>
      )}

      <footer className="px-6 md:px-12 py-8" style={{ borderTop: "1px solid #EAE8DF" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#718096" }}>InternTrack</span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#A0AEC0" }}>
            © 2026 InternTrack. Built for ambitious students.
          </p>
        </div>
      </footer>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleSubmit={handleSubmit}
        formState={formState}
        setFormState={setFormState}
      />

      {notification && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
          background: '#2D3748', color: '#FDFBD4',
          padding: '1rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.85rem',
          fontFamily: "'Inter', sans-serif", fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {notification}
        </div>
      )}
    </div>
  );
}