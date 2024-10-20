export interface ImportError {
  row: number;
  reason: string;
}

export interface ImportResult {
  success: boolean;
  totalElements: number;
  importedElements: number;
  errors: ImportError[];
  warnings: ImportError[];
}
