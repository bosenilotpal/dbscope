import { NextResponse } from 'next/server';

// GitHub repository info
const GITHUB_OWNER = 'bosenilotpal';
const GITHUB_REPO = 'dbscope';

interface GitHubCommit {
  commit: {
    author: {
      date: string;
    };
  };
}

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

async function fetchAllCommits(): Promise<string[]> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const sinceDate = oneYearAgo.toISOString();

  const allDates: string[] = [];
  let page = 1;
  const perPage = 100;

  // Prepare headers
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DBscope-App',
  };

  // Use GitHub token if available (for higher rate limits)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  while (true) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?since=${sinceDate}&per_page=${perPage}&page=${page}`;

    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      break;
    }

    const commits: GitHubCommit[] = await response.json();

    if (commits.length === 0) {
      break;
    }

    commits.forEach(commit => {
      const date = commit.commit.author.date.split('T')[0];
      allDates.push(date);
    });

    // If we got fewer than per_page, we've reached the end
    if (commits.length < perPage) {
      break;
    }

    page++;

    // Safety limit to prevent infinite loops
    if (page > 20) {
      break;
    }
  }

  return allDates;
}

export async function GET() {
  try {
    const commitDates = await fetchAllCommits();

    // Build activity map
    const activityMap: Record<string, number> = {};
    commitDates.forEach(date => {
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
    console.error('Error fetching git history from GitHub:', error);
    // Return empty year data to prevent client-side crashes
    return NextResponse.json(generateEmptyYearData());
  }
}
