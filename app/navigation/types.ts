export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ProfileSetup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Challenges: undefined;
  Progress: undefined;
  Badges: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Challenge: undefined;
  TaskDetail: { taskId: string };
  Leaderboard: undefined;
};