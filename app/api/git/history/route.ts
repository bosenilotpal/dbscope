import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    // Get commit dates from git log
    const { stdout } = await execPromise('git log --pretty=format:"%aI"');
    
    const commits = stdout.split('\n').filter(Boolean);
    const activityMap: Record<string, number> = {};

    commits.forEach(dateStr => {
      // Extract YYYY-MM-DD
      const date = dateStr.split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    // Fill in the last 365 days
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const result = [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      result.push({
        date: dayStr,
        count: activityMap[dayStr] || 0,
        level: Math.min(4, Math.ceil((activityMap[dayStr] || 0) / 2))
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching git history:', error);
    return NextResponse.json({ error: 'Failed to fetch git history' }, { status: 500 });
  }
}
