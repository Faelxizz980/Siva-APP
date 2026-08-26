export type NivelTipo = 'admin' | 'gestor' | 'tecnico' | 'funcionario';

export interface Nivel {
  id: number;
  tipo: NivelTipo;
  cargo: string;
}
