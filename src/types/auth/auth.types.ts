import type { Nivel } from '../Nivel/nivel.types';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  empresa_id: number | null;
  nivel: Nivel;
  ativo: boolean;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}
