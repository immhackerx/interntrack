import { FC, useState } from 'react';
import { useAppContext, ApplicationStatus } from '../store/AppContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Internship } from '../App';

const COLUMNS: ApplicationStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer Received'];

const KanbanCard: FC<{ internship: Internship; status: ApplicationStatus }> = ({ internship, status }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'KANBAN_CARD',
    item: { id: internship.id, status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef}
      className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-[#EAE8DF] dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#F4F3ED] dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200">
          {internship.logo}
        </div>
        <div>
          <h4 className="font-manrope font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{internship.role}</h4>
          <p className="font-inter text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{internship.company}</p>
        </div>
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500 font-inter line-clamp-1">
        📍 {internship.location}
      </div>
    </div>
  );
};

const KanbanColumn: FC<{ title: ApplicationStatus }> = ({ title }) => {
  const { userApplications, updateApplicationStatus } = useAppContext();
  
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'KANBAN_CARD',
    drop: (item: { id: number; status: ApplicationStatus }) => {
      if (item.status !== title) {
        updateApplicationStatus(item.id, title);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const columnApps = userApplications.filter(app => app.status === title);

  return (
    <div 
      ref={dropRef} 
      className={`flex flex-col gap-3 min-h-[500px] p-4 rounded-2xl transition-colors border-2 border-transparent
        ${isOver ? 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-emerald-300 dark:border-emerald-500/50' : 'bg-slate-50/50 dark:bg-slate-900/50'}
      `}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-manrope font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">{title}</h3>
        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">
          {columnApps.length}
        </span>
      </div>
      {columnApps.map(app => (
        <KanbanCard key={app.internship.id} internship={app.internship} status={app.status} />
      ))}
      {columnApps.length === 0 && (
        <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-inter border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          Drop here
        </div>
      )}
    </div>
  );
};

export const KanbanBoard: FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {COLUMNS.map(col => (
          <KanbanColumn key={col} title={col} />
        ))}
      </div>
    </DndProvider>
  );
};
