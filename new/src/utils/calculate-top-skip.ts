export const calculateTopAndSkip = (page: number, pageSize: number): { top: number, skip: number } => {
  // Validaciones (opcional):
  if (page <= 0) {
    throw new Error('La página debe ser mayor que 0');
  }
  if (pageSize <= 0) {
    throw new Error('El tamaño de página debe ser mayor que 0');
  }

  // Cálculo:
  const top = pageSize;
  const skip = (page - 1) * pageSize;

  return { top, skip };
}