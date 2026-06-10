import { FC } from 'react';
import { Internship } from '../App';
import { ListingCard } from './ListingCard';
import { useAppContext } from '../store/AppContext';

interface ListingGridProps {
  isLoading: boolean;
  publicListings: Internship[];
  search: string;
  setActiveFilter: (f: string) => void;
  setSearch: (s: string) => void;
}

export const ListingGrid: FC<ListingGridProps> = ({ isLoading, publicListings, search, setActiveFilter, setSearch }) => {
  const { activeListing } = useAppContext();

  return (
    <div className={`transition-all duration-300 ${activeListing ? 'w-full lg:w-2/3 pr-0 lg:pr-6' : 'w-full'}`}>
      {isLoading ? (
        <div className={`grid gap-4 ${activeListing ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-white dark:bg-slate-900 border border-[#EAE8DF] dark:border-slate-800 rounded-xl h-[140px] w-full" />
          ))}
        </div>
      ) : publicListings.length > 0 ? (
        <div className={`grid gap-4 ${activeListing ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {publicListings.map((listing) => (<ListingCard key={listing.id} {...listing} searchQuery={search} />))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE8DF] dark:border-slate-800 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#FDFBD4] dark:bg-amber-400/10 border border-[#EAE8DF] dark:border-amber-400/20">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-500 dark:text-amber-400" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div>
            <h3 className="font-manrope font-bold text-lg text-slate-800 dark:text-slate-100">
              No internships found matching your criteria
            </h3>
            <p className="font-inter text-slate-500 dark:text-slate-400 text-sm max-w-[380px] mx-auto mt-2">
              Try checking your spelling, adjusting your keywords, or clearing your active filters to see more roles.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setActiveFilter('All');
            }}
            className="mt-2 font-inter font-semibold text-sm text-slate-800 dark:text-slate-900 bg-[#FDFBD4] dark:bg-emerald-400 rounded-lg px-5 py-2.5 border border-[#EAE8DF] dark:border-emerald-500 transition-colors hover:bg-[#F4F3ED] dark:hover:bg-emerald-300"
          >
            Clear Search Queries
          </button>
        </div>
      )}
    </div>
  );
};
