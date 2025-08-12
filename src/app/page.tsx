// app/page.tsx
import React from "react";
import he from "he";

type Repo = {
  author: string;
  repositoryName: string;
  url: string;
  stars: number;
};

type RSSItem = {
  title: string;
  link: string;
};

async function fetchGitHubTrending(): Promise<Repo[]> {
  const query = encodeURIComponent("language:javascript");
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();

  return data.items.map((repo: any) => ({
    author: repo.owner.login,
    repositoryName: repo.name,
    url: repo.html_url,
    stars: repo.stargazers_count,
  }));
}


async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
  const res = await fetch(proxy + encodeURIComponent(url), { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).slice(0, 5).map((item: any) => ({
    title: item.title,
    link: item.link,
  }));
}

export default async function Home() {
  const [trendingRepos, cssNews, toolingNews] = await Promise.all([
    fetchGitHubTrending(),
    fetchRSSFeed("https://css-tricks.com/feed/"),
    fetchRSSFeed("https://www.smashingmagazine.com/feed/"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Frontend Trends Tracker</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">🔥 Trending JavaScript GitHub Repos</h2>
        {trendingRepos.length ? (
          <ul className="list-disc list-inside space-y-2">
            {trendingRepos.map((repo) => (
              <li key={repo.repositoryName}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {repo.repositoryName}
                </a>{" "}
                by {repo.author} ⭐{repo.stars}
              </li>
            ))}
          </ul>
        ) : (
          <p>No trending repos found.</p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">🖌️ Latest CSS & Webdev News (CSS-Tricks)</h2>
        {cssNews.length ? (
          <ul className="list-disc list-inside space-y-2">
            {cssNews.map(({ title, link }) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {he.decode(title)}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No CSS news found.</p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">⚡ Tooling & Design News (Smashing Magazine)</h2>
        {toolingNews.length ? (
          <ul className="list-disc list-inside space-y-2">
            {toolingNews.map(({ title, link }) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {he.decode(title)}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tooling news found.</p>
        )}
      </section>

      <footer className="text-center text-gray-500 mt-20 text-sm">
        Frontend Trends Tracker &mdash; powered by public APIs and RSS feeds
      </footer>
    </div>
  );
}
