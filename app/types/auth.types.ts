export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateAdminUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}
