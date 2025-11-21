// src/types/auth.ts
export interface Teen {
  id: string;
  email: string;
  name: string;
  age: number;
  gender?: string;
  state?: string;
  country?: string;
  profilePhoto?: string;
  parentEmail?: string;
  isActive: boolean;
  optInPublic: boolean;
  createdAt: string;
  updatedAt: string;
  isEmailVerified?: boolean;
  needsProfileSetup?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  gender?: string;
  state?: string;
  country?: string;
  parentEmail?: string;
}

export interface LoginResponse {
  teen: Teen;
  token: string;
}

export interface UpdateProfileData {
  name?: string;
  age?: number;
  gender?: string;
  state?: string;
  country?: string;
  optInPublic?: boolean;
}
