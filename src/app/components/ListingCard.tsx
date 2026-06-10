import { FC } from 'react';
import { Internship } from '../App';
import { useAppContext } from '../store/AppContext';
import { calculateMatchScore } from '../utils/skillMatcher';
import { Flame } from 'lucide-react';

// Minimal Highlighter Helper using soft olive grey tints
export const HighlightText = ({ text, search }: { text: string; search: string }) => {
  if (!search.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-[rgba(189,185,106,0.25)] text-slate-800 dark:bg-emerald-400/20 dark:text-emerald-300 rounded px-1 font-semibold">{part}</mark>
          : part
      )}
    </span>
  );
};

export const ListingCard: FC<Internship & { searchQuery: string }> = ({ 
  id, role, company, location, tags, logo, is_new, searchQuery, link, apply_count 
}) => {
  const { activeListing, setActiveListing, userSkills } = useAppContext();
  const isActive = activeListing?.id === id;

  const matchScore = calculateMatchScore(userSkills, role, tags);

  const getSourceLabel = (url?: string) => {
    if (!url) return "Direct";
    if (url.includes("linkedin.com")) return "LinkedIn";
    if (url.includes("indeed.com")) return "Indeed";
    if (url.includes("glassdoor.com")) return "Glassdoor";
    return "Job Board";
  };

  const sourcePlatform = getSourceLabel(link);

  return (
    <div 
      onClick={() => setActiveListing({ id, role, company, location, tags, logo, is_new, link, apply_count, daysAgo: 0 })}
      className={`
        relative overflow-hidden flex flex-col justify-between gap-3 p-5 rounded-xl cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' 
          : 'bg-white border-[#EAE8DF] dark:bg-slate-900 dark:border-slate-800 hover:shadow-lg dark:hover:border-slate-700'
        }
      `}
      style={{ minHeight: '200px', borderStyle: 'solid', borderWidth: '1px' }}
    >
      {is_new && (
        <div className="absolute top-4 right-4 bg-[rgba(189,185,106,0.15)] text-[#BDB96A] dark:bg-amber-400/10 dark:text-amber-400 px-2 py-1 rounded-full text-[0.65rem] font-bold tracking-wider font-inter">
          PENDING
        </div>
      )}

      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F4F3ED] dark:bg-slate-800 flex items-center justify-center font-bold font-manrope text-slate-800 dark:text-slate-200">
            {logo}
          </div>
          <div>
            <h3 className="font-manrope font-bold text-slate-800 dark:text-slate-100 text-[0.95rem] m-0 pr-16 line-clamp-2">
              <HighlightText text={role} search={searchQuery} />
            </h3>
            <p className="font-inter text-slate-500 dark:text-slate-400 text-[0.8rem] m-0">
              <HighlightText text={company} search={searchQuery} />
            </p>
          </div>
        </div>
        <p className="font-inter text-slate-500 dark:text-slate-400 text-[0.8rem] ml-[calc(40px+0.75rem)] mt-2 mb-0">
          <HighlightText text={location} search={searchQuery} />
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <span key={tag} className="bg-[#FAF9F3] dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-[0.7rem] font-medium border border-[#EAE8DF] dark:border-slate-700">
              {tag}
            </span>
          ))}
          <span className="bg-slate-800/5 dark:bg-emerald-400/5 text-slate-800 dark:text-emerald-400 px-3 py-1 rounded-full text-[0.68rem] font-semibold border border-[#EAE8DF] dark:border-emerald-400/20 font-mono">
            🌐 Via {sourcePlatform}
          </span>
        </div>

        {(matchScore > 0 || (apply_count !== undefined && apply_count > 0)) && (
          <div className="flex items-center gap-3 mt-1 pt-3 border-t border-[#EAE8DF] dark:border-slate-800/50">
            {matchScore > 0 && (
              <span className="flex items-center gap-1 font-inter font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 rounded-md">
                ⚡ {matchScore}% Match
              </span>
            )}
            {apply_count !== undefined && apply_count > 0 && (
              <span className="flex items-center gap-1 font-inter font-medium text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-1 rounded-md">
                <Flame size={12} className="text-amber-500 animate-pulse" /> {apply_count} tracking this role
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
