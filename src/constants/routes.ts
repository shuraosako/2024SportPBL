// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/New-Account',
  FORGOT_PASSWORD: '/forgot_pass',
  VERIFY_CODE: '/verify_code',
  NEW_PASSWORD: '/NewPass',
  DASHBOARD: '/home',
  ANALYSIS: '/analysis',
  PROFILE: '/profile',
  SETTINGS: '/setting',
  CREATE_PLAYER: '/create_player',
  PLAYER_DETAIL: (id: string) => `/player/${id}`,
  DATA_TABLE: '/data-table',
} as const;
