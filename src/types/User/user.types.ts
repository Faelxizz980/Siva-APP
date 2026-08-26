import type { Nivel } from '../Nivel/nivel.types';

export interface User {
  id: number;
  nome: string;
  email: string;
  empresa_id: number | null;
  nivel_id: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface UserResponse extends User {
  nivel: Nivel;
}

export interface CreateUserDTO {
  nome: string;
  email: string;
  senha: string;
  empresa_id: number | null;
  nivel_id: number;
}

export interface UpdateUserDTO {
  nome?: string;
  email?: string;
  empresa_id?: number | null;
  nivel_id?: number;
  ativo?: boolean;
}
