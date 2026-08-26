export interface Empresa {
  id: number;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface CreateEmpresaDTO {
  nome: string;
  cnpj?: string;
}

export interface UpdateEmpresaDTO {
  nome?: string;
  cnpj?: string;
  ativo?: boolean;
}
