export type UserProfile = {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  accentColor: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile | null;
  providers: Array<'EMAIL' | 'GOOGLE' | 'APPLE'>;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
