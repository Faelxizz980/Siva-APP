export type NivelTipo = 'super_admin' | 'admin' | 'gestor' | 'tecnico' | 'funcionario';

export interface Nivel {
  id: number;
  tipo: NivelTipo;
  cargo: string;
}
