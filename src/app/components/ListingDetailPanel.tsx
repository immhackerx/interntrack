import { FC } from 'react';
import { Internship } from '../App';
import { useAppContext } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, ExternalLink } from 'lucide-react';

import { supabase } from '../supabaseClient';

export const ListingDetailPanel: FC = () => {
  const { activeListing, setActiveListing, userApplications, setUserApplications } = useAppContext();

  if (!activeListing) return null;

  const isBookmarked = userApplications.some(app => app.internship.id === activeListing.id);

  const handleBookmark = () => {
    if (isBookmarked) return;
    setUserApplications(prev => [...prev, { internship: activeListing, status: 'Wishlist' }]);
  };

  const handleApplyClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // We increment count in DB, but don't prevent default link behavior.
    if (activeListing.id) {
      try {
        await supabase.rpc('increment_apply_count', { row_id: activeListing.id });
      } catch (err) {
        console.error("Failed to increment apply count:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bg-white dark:bg-slate-900 border border-[#EAE8DF] dark:border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 w-[380px]"
        style={{ 
          position: 'fixed',
          top: '100px', 
          right: '2rem', 
          bottom: '2rem',
          height: 'calc(100vh - 140px)', 
          overflowY: 'auto',
          zIndex: 40
        }}
      >
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 rounded-xl bg-[#F4F3ED] dark:bg-slate-800 flex items-center justify-center font-bold font-manrope text-slate-800 dark:text-slate-200 text-2xl">
            {activeListing.logo}
          </div>
          <button 
            onClick={() => setActiveListing(null)}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <h2 className="font-manrope font-extrabold text-2xl text-slate-800 dark:text-slate-100 leading-tight">
            {activeListing.role}
          </h2>
          <p className="font-inter text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {activeListing.company} &middot; {activeListing.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeListing.tags.map(tag => (
            <span key={tag} className="bg-[#FAF9F3] dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium border border-[#EAE8DF] dark:border-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="border-t border-[#EAE8DF] dark:border-slate-800 pt-6 mt-2 flex-grow">
          <h3 className="font-manrope font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">About the Role</h3>
          <p className="font-inter text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            This is a dynamic opportunity to join {activeListing.company} as a {activeListing.role}. 
            You will be working with cutting-edge technologies to build scalable solutions.
            <br/><br/>
            (Full job description would be dynamically loaded here in production.)
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {activeListing.link && (
            <a 
              href={activeListing.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="flex items-center justify-center gap-2 w-full bg-slate-800 dark:bg-emerald-500 text-[#FDFBD4] dark:text-slate-900 font-manrope font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Apply Externally <ExternalLink size={18} />
            </a>
          )}
          <button 
            onClick={handleBookmark}
            disabled={isBookmarked}
            className={`flex items-center justify-center gap-2 w-full font-manrope font-bold py-3.5 rounded-xl transition-all border-2
              ${isBookmarked 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 cursor-not-allowed' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#EAE8DF] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
              }
            `}
          >
            {isBookmarked ? '✓ Saved to Tracker' : 'Save to Application Tracker'} <Bookmark size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
