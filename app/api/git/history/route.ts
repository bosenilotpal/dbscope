import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Generate empty year data as fallback
function generateEmptyYearData() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const result = [];
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().split('T')[0];
    result.push({
      date: dayStr,
      count: 0,
      level: 0
    });
  }
  return result;
}

export async function GET() {
  try {
    // Check if we're in a serverless environment (no git available)
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isServerless) {
      // Return empty data in serverless environments
      return NextResponse.json(generateEmptyYearData());
    }

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
    // Return empty year data instead of error object to prevent client-side crashes
    return NextResponse.json(generateEmptyYearData());
  }
}
