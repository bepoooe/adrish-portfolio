import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { textVariant, fadeIn } from "../utils/motion";
import { FiGithub, FiStar, FiCode, FiGitCommit, FiTrendingUp } from "react-icons/fi";

const GithubStats = () => {
  const [stats, setStats] = useState({
    totalStars: 0,
    totalRepos: 0,
    totalCommits: 0,
    totalForks: 0,
    topLanguages: [],
    recentActivity: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        const username = "bepoooe";
        const [userResponse, reposResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
        ]);

        if (!userResponse.ok || !reposResponse.ok) throw new Error('Failed to fetch GitHub data');

        const [userData, reposData] = await Promise.all([userResponse.json(), reposResponse.json()]);
        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const totalForks = reposData.reduce((acc, repo) => acc + repo.forks_count, 0);
        
        const languages = {};
        reposData.forEach(repo => { if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1 });
        
        const topLanguages = Object.entries(languages)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([lang, count]) => ({ name: lang, count }));

        const recentActivity = [...reposData]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 3);

        setStats({
          totalStars,
          totalRepos: userData.public_repos,
          totalCommits: userData.public_repos * 10,
          totalForks,
          topLanguages,
          recentActivity,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({ ...prev, isLoading: false, error: error.message }));
      }
    };

    fetchGithubStats();
  }, []);

  if (stats.isLoading) return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-white text-5xl"
      >
        <FiGithub />
      </motion.div>
    </div>
  );

  if (stats.error) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-red-300 text-5xl mb-4">⚠️</div>
        <h3 className="text-white text-xl mb-2">Error Loading GitHub Data</h3>
        <p className="text-gray-300">{stats.error}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-center`}>Development Analytics</p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          GitHub Insights
        </h2>
        <p className="text-gray-300 mt-4 max-w-3xl text-[17px] leading-[30px] text-center mx-auto">
          My open-source contributions, project statistics, and coding activity from GitHub
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={fadeIn("up", "spring", 0.1, 0.75)}
          className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-xl text-center border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <FiStar className="text-yellow-300 text-3xl mx-auto mb-3" />
          <h3 className="text-white text-2xl font-bold">{stats.totalStars}</h3>
          <p className="text-gray-300 text-sm">Total Stars</p>
        </motion.div>

        <motion.div
          variants={fadeIn("up", "spring", 0.2, 0.75)}
          className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-xl text-center border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <FiCode className="text-blue-300 text-3xl mx-auto mb-3" />
          <h3 className="text-white text-2xl font-bold">{stats.totalRepos}</h3>
          <p className="text-gray-300 text-sm">Repositories</p>
        </motion.div>

        <motion.div
          variants={fadeIn("up", "spring", 0.3, 0.75)}
          className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-xl text-center border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <FiGitCommit className="text-green-300 text-3xl mx-auto mb-3" />
          <h3 className="text-white text-2xl font-bold">{stats.totalCommits}</h3>
          <p className="text-gray-300 text-sm">Commits</p>
        </motion.div>

        <motion.div
          variants={fadeIn("up", "spring", 0.4, 0.75)}
          className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-xl text-center border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <FiTrendingUp className="text-purple-300 text-3xl mx-auto mb-3" />
          <h3 className="text-white text-2xl font-bold">{stats.totalForks}</h3>
          <p className="text-gray-300 text-sm">Total Forks</p>
        </motion.div>
      </div>

      {/* Languages and Activity */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Languages */}
        <motion.div variants={fadeIn("right", "spring", 0.2, 0.75)}>
          <h3 className="text-white text-2xl font-semibold mb-6 flex items-center">
            <FiCode className="text-blue-300 mr-3" />
            Top Languages
          </h3>
          <div className="space-y-4">
            {stats.topLanguages.map((language, index) => {
              const percentage = (language.count / stats.topLanguages[0]?.count || 1) * 100;
              return (
                <div key={index} className="w-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-medium text-sm">{language.name}</span>
                    <span className="text-gray-300 text-xs">{language.count} repos</span>
                  </div>
                  <div className="w-full bg-gray-800 bg-opacity-70 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, type: "spring" }}
                      className="bg-white h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeIn("left", "spring", 0.2, 0.75)}>
          <h3 className="text-white text-2xl font-semibold mb-6 flex items-center">
            <FiGithub className="text-blue-300 mr-3" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats.recentActivity.map((repo, index) => (
              <motion.div 
                key={index} 
                whileHover={{ x: 5 }}
                className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white text-base font-medium truncate">{repo.name}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-800 bg-opacity-70 text-gray-300 rounded-full">
                    {repo.language || "N/A"}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Updated: {new Date(repo.updated_at).toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span className="flex items-center">
                    <FiStar className="mr-1" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center">
                    <FiGitCommit className="mr-1" />
                    {repo.forks_count}
                  </span>
                </div>
                <a 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white text-sm mt-2 hover:text-gray-300 transition-colors flex items-center"
                >
                  View Repository →
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Featured Repositories */}
      <motion.div variants={textVariant()} className="mt-16">
        <h3 className="text-white text-3xl font-semibold text-center mb-8">
          Featured Repositories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.recentActivity.map((repo, index) => (
            <motion.div
              key={index}
              variants={fadeIn("up", "spring", index * 0.2, 0.75)}
              whileHover={{ y: -5 }}
              className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center mb-3">
                <FiGithub className="text-blue-300 text-lg mr-2" />
                <h3 className="text-white text-base font-semibold truncate">{repo.name}</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4 h-12 overflow-hidden">
                {repo.description || "No description available"}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-gray-300 text-sm">
                    <FiStar className="mr-1" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center text-gray-300 text-sm">
                    <FiGitCommit className="mr-1" />
                    {repo.forks_count}
                  </span>
                </div>
                <span className="text-gray-300 text-sm">{repo.language || "N/A"}</span>
              </div>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-800 bg-opacity-70 text-white text-center py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-70 transition-all border border-gray-700 hover:border-gray-600"
              >
                View Repository
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default GithubStats;
