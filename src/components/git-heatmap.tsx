'use client';

import { useEffect, useState, useRef } from 'react';
import { Activity } from 'lucide-react';

interface DayData {
  date: string;
  count: number;
  level: number;
}

export function CommitHeatmap() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommits, setTotalCommits] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to end on load
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [loading, data]);

  useEffect(() => {
    fetch('/api/git/history')
      .then(res => res.json())
      .then((response) => {
        // Handle error responses or non-array data
        if (!Array.isArray(response)) {
          console.warn('Git history API returned non-array:', response);
          setData([]);
          setTotalCommits(0);
          setLoading(false);
          return;
        }
        const days = response as DayData[];
        setData(days);
        setTotalCommits(days.reduce((acc, day) => acc + day.count, 0));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load git history', err);
        setData([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full h-40 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
    );
  }

  // Group by weeks for the grid
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  // Pad the first week if the data doesn't start on Sunday
  if (data.length > 0) {
    const startDate = new Date(data[0].date);
    const dayOfWeek = startDate.getUTCDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: `pad-${i}`, count: 0, level: -1 });
    }
  }

  data.forEach((day) => {
    if (new Date(day.date).getUTCDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getLevelColor = (level: number) => {
    switch (level) {
      case -1: return 'invisible';
      case 0: return 'bg-[#ebedf0] dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-slate-700';
      case 1: return 'bg-[#9be9a8] dark:bg-[#0e4429] hover:bg-[#40c463] dark:hover:bg-[#006d32]';
      case 2: return 'bg-[#40c463] dark:bg-[#006d32] hover:bg-[#30a14e] dark:hover:bg-[#26a641]';
      case 3: return 'bg-[#30a14e] dark:bg-[#26a641] hover:bg-[#216e39] dark:hover:bg-[#39d353]';
      case 4: return 'bg-[#216e39] dark:bg-[#39d353] hover:bg-[#0e4429] dark:hover:bg-[#4ae168]';
      default: return 'bg-[#ebedf0] dark:bg-[#161b22]';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Repository Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {totalCommits} commits in the last year
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22]" />
            <div className="h-3 w-3 rounded-sm bg-[#9be9a8] dark:bg-[#0e4429]" />
            <div className="h-3 w-3 rounded-sm bg-[#40c463] dark:bg-[#006d32]" />
            <div className="h-3 w-3 rounded-sm bg-[#30a14e] dark:bg-[#26a641]" />
            <div className="h-3 w-3 rounded-sm bg-[#216e39] dark:bg-[#39d353]" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1 pt-6 text-xs text-slate-400 dark:text-slate-500">
          <div className="h-3 leading-3"></div>
          <div className="h-3 leading-3">Mon</div>
          <div className="h-3 leading-3"></div>
          <div className="h-3 leading-3">Wed</div>
          <div className="h-3 leading-3"></div>
          <div className="h-3 leading-3">Fri</div>
          <div className="h-3 leading-3"></div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto pb-2 scroll-smooth"
        >
          <div className="flex mb-2 text-xs text-slate-400 dark:text-slate-500 min-w-max">
            {weeks.map((week, index) => {
              const firstDay = week.find(d => d.level !== -1);
              if (!firstDay) return <div key={index} className="w-3 mx-[2px]" />;

              const date = new Date(firstDay.date);
              const showMonth = date.getDate() <= 7;

              return (
                <div key={index} className="w-3 mx-[2px] overflow-visible whitespace-nowrap">
                  {showMonth ? date.toLocaleString('default', { month: 'short' }) : ''}
                </div>
              );
            })}
          </div>

          <div className="min-w-max flex gap-1">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`h-3 w-3 rounded-sm transition-colors border border-transparent ${getLevelColor(day.level)}`}
                    title={day.level >= 0 ? `${day.count} commits on ${day.date}` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
