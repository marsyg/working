'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BarChart3Icon, FlameIcon, TrophyIcon } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import {
  getLeaderboardDataByTokens,
  getLeaderboardDataByStreak,
} from '@/actions/user.action';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

// Define types for user data
interface User {
  username: string;
  avatarUrl: string;
  tokens: number;
  streak: number;
}

// Define the type for the state
interface LeaderboardState {
  tokenData: User[];
  streakData: User[];
  loading: boolean;
  error: string | null;
  activeChart: 'tokens' | 'streaks';
}

// Define props for LeaderboardItem component
interface LeaderboardItemProps {
  user: User;
  icon: React.ReactNode;
  label: 'tokens' | 'streak';
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  user,
  icon,
  label,
}) => (
  <div className="flex items-center gap-4 py-2 border-b last:border-b-0">
    <Avatar>
      <AvatarImage src={user.avatarUrl} alt={user.username} />
      <AvatarFallback>{user.username[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">{user.username}</p>
      <p className="text-sm text-muted-foreground">{`${label}: ${user[label]}`}</p>
    </div>
    {icon}
  </div>
);

const Leaderboard: React.FC = () => {
  const [tokenData, setTokenData] = useState<User[]>([]);
  const [streakData, setStreakData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'tokens' | 'streaks'>('tokens');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tokens = await getLeaderboardDataByTokens();
        const streaks = await getLeaderboardDataByStreak();
        if (!tokens || !streaks) return;
        setTokenData(tokens);
        setStreakData(streaks);
      } catch (err) {
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tokenChartData = {
    labels: tokenData.map(({ username }) => username),
    datasets: [
      {
        label: 'Tokens',
        data: tokenData.map(({ tokens }) => tokens),
        backgroundColor: 'rgba(34, 197, 94, 0.5)', // Green tint
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const streakChartData = {
    labels: streakData.map(({ username }) => username),
    datasets: [
      {
        label: 'Streak',
        data: streakData.map(({ streak }) => streak),
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue tint
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p>Loading Leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Leaderboard Cards */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tokens Leaderboard */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-green-500" />
                Top Tokens Earners
              </h2>
              {tokenData.map((user, index) => (
                <LeaderboardItem
                  key={index}
                  user={user}
                  label="tokens"
                  icon={<TrophyIcon className="w-5 h-5 text-yellow-500" />}
                />
              ))}
            </div>

            {/* Streak Leaderboard */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FlameIcon className="w-5 h-5 text-red-500" />
                Top Streak Holders
              </h2>
              {streakData.map((user, index) => (
                <LeaderboardItem
                  key={index}
                  user={user}
                  label="streak"
                  icon={<FlameIcon className="w-5 h-5 text-red-500" />}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle for Chart Selection */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <div
            className={`relative inline-block w-16 h-8 rounded-full transition-all duration-300 ease-in-out ${
              activeChart === 'tokens' ? 'bg-green-500' : 'bg-blue-500'
            }`}
          >
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0 absolute"
              checked={activeChart === `${Leaderboard}`}
              onChange={() => setActiveChart(activeChart === 'tokens' ? 'streaks' : 'tokens')}
            />
            <span
              className={`absolute top-0 left-0 w-8 h-8 bg-white rounded-full transition-all duration-300 transform ${
                activeChart === 'tokens' ? 'translate-x-8' : ''
              }`}
            ></span>
          </div>
        </label>
      </div>

      {/* Conditional Rendering of Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3Icon className="w-6 h-6 text-blue-500" />
            Leaderboard Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeChart === 'tokens' ? (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Tokens Distribution
              </h2>
              <Bar data={tokenChartData} />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Streak Distribution
              </h2>
              <Line data={streakChartData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
