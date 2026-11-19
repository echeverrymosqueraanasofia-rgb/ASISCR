export interface EstudianteCsvRow {
  nombre: string;
  grado: string;
  documento: string;
  nombre_acudiente: string;
  telefono_acudiente: string;
  line: number;
}

export interface EstudianteCsvResult {
  rows: EstudianteCsvRow[];
  error?: string;
}

function normalizeHeader(value: string): string {
  return value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function detectDelimiter(header: string): string {
  const counts = new Map<string, number>([[';', 0], [',', 0], ['\t', 0]]);
  let insideQuotes = false;
  for (let index = 0; index < header.length; index += 1) {
    const character = header[index];
    if (character === '"') {
      if (insideQuotes && header[index + 1] === '"') index += 1;
      else insideQuotes = !insideQuotes;
    } else if (!insideQuotes && counts.has(character)) {
      counts.set(character, (counts.get(character) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function parseRecords(content: string, delimiter: string): Array<{ values: string[]; line: number }> {
  const records: Array<{ values: string[]; line: number }> = [];
  let values: string[] = [];
  let value = '';
  let quoted = false;
  let line = 1;
  let recordLine = 1;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
        if (character === '\n') line += 1;
      }
    } else if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      values.push(value.trim());
      value = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && content[index + 1] === '\n') index += 1;
      values.push(value.trim());
      if (values.some(cell => cell !== '')) records.push({ values, line: recordLine });
      values = [];
      value = '';
      line += 1;
      recordLine = line;
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  if (values.some(cell => cell !== '')) records.push({ values, line: recordLine });
  return records;
}

export function parseEstudiantesCsv(content: string): EstudianteCsvResult {
  const normalizedContent = content.replace(/^\uFEFF/, '');
  const headerLine = normalizedContent.split(/\r?\n/, 1)[0] || '';
  const records = parseRecords(normalizedContent, detectDelimiter(headerLine));
  if (records.length === 0) {
    return { rows: [], error: 'El archivo CSV está vacío.' };
  }

  const headerIndexes = new Map<string, number>();
  records[0].values.forEach((value, index) => {
    headerIndexes.set(normalizeHeader(value), index);
  });

  const aliases: Record<keyof Omit<EstudianteCsvRow, 'line'>, string[]> = {
    nombre: ['nombre', 'estudiante', 'nombrecompleto'],
    grado: ['grado', 'grupo', 'curso'],
    documento: ['documento', 'identificacion', 'numerodedocumento', 'cedula'],
    nombre_acudiente: ['nombreacudiente', 'acudiente', 'responsable'],
    telefono_acudiente: ['telefonoacudiente', 'telefonodelacudiente', 'telefonocontacto'],
  };
  const columns = {} as Record<keyof Omit<EstudianteCsvRow, 'line'>, number | undefined>;
  (Object.keys(aliases) as Array<keyof Omit<EstudianteCsvRow, 'line'>>).forEach(field => {
    columns[field] = aliases[field]
      .map(alias => headerIndexes.get(alias))
      .find(index => index !== undefined);
  });

  const requiredFields: Array<keyof Omit<EstudianteCsvRow, 'line'>> = ['nombre', 'grado', 'documento'];
  const missingFields = requiredFields.filter(field => columns[field] === undefined);
  if (missingFields.length > 0) {
    return {
      rows: [],
      error: `Faltan columnas obligatorias: ${missingFields.join(', ')}. Usa los encabezados nombre, grado y documento.`,
    };
  }

  const rows = records.slice(1).map(record => {
    const getValue = (field: keyof Omit<EstudianteCsvRow, 'line'>) => {
      const column = columns[field];
      return column === undefined ? '' : record.values[column] || '';
    };
    return {
      nombre: getValue('nombre'),
      grado: getValue('grado'),
      documento: getValue('documento'),
      nombre_acudiente: getValue('nombre_acudiente'),
      telefono_acudiente: getValue('telefono_acudiente'),
      line: record.line,
    };
  });

  return { rows };
}
