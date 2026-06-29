export interface CareerEntry {
  career: string;
  faculty: string;
}

export const CAREERS: CareerEntry[] = [
  { career: 'Antropología', faculty: 'Facultad de Ciencias Sociales' },
  { career: 'Ciencia Política y Gobierno', faculty: 'Facultad de Ciencias Sociales' },
  { career: 'Economía', faculty: 'Facultad de Ciencias Sociales' },
  { career: 'Finanzas', faculty: 'Facultad de Ciencias Sociales' },
  { career: 'Relaciones Internacionales', faculty: 'Facultad de Ciencias Sociales' },
  { career: 'Sociología', faculty: 'Facultad de Ciencias Sociales' },

  { career: 'Arqueología', faculty: 'Facultad de Letras y Ciencias Humanas' },
  { career: 'Ciencias de la Información', faculty: 'Facultad de Letras y Ciencias Humanas' },
  { career: 'Filosofía', faculty: 'Facultad de Letras y Ciencias Humanas' },
  { career: 'Geografía y Medio Ambiente', faculty: 'Facultad de Letras y Ciencias Humanas' },
  { career: 'Historia', faculty: 'Facultad de Letras y Ciencias Humanas' },
  { career: 'Humanidades', faculty: 'Facultad de Letras y Ciencias Humanas' },
  { career: 'Lingüística y Literatura', faculty: 'Facultad de Letras y Ciencias Humanas' },

  { career: 'Estadística', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Física', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Ambiental y Sostenible', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Biomédica PUCP', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Civil', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería de las Telecomunicaciones', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería de Minas', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Electrónica', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Geológica', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Industrial', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Informática', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Mecánica', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Mecatrónica', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Ingeniería Química', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Matemáticas', faculty: 'Facultad de Ciencias e Ingeniería' },
  { career: 'Química', faculty: 'Facultad de Ciencias e Ingeniería' },

  { career: 'Arte, moda y diseño textil', faculty: 'Facultad de Arte y Diseño' },
  { career: 'Diseño Gráfico', faculty: 'Facultad de Arte y Diseño' },
  { career: 'Diseño Industrial', faculty: 'Facultad de Arte y Diseño' },
  { career: 'Educación Artística', faculty: 'Facultad de Arte y Diseño' },
  { career: 'Escultura', faculty: 'Facultad de Arte y Diseño' },
  { career: 'Grabado', faculty: 'Facultad de Arte y Diseño' },
  { career: 'Pintura', faculty: 'Facultad de Arte y Diseño' },

  { career: 'Comunicación Audiovisual', faculty: 'Facultad de Ciencias y Artes de la Comunicación' },
  { career: 'Comunicación para el desarrollo', faculty: 'Facultad de Ciencias y Artes de la Comunicación' },
  { career: 'Periodismo', faculty: 'Facultad de Ciencias y Artes de la Comunicación' },
  { career: 'Publicidad', faculty: 'Facultad de Ciencias y Artes de la Comunicación' },

  { career: 'Creación y Producción Escénica', faculty: 'Facultad de Artes Escénicas' },
  { career: 'Danza', faculty: 'Facultad de Artes Escénicas' },
  { career: 'Música', faculty: 'Facultad de Artes Escénicas' },
  { career: 'Teatro', faculty: 'Facultad de Artes Escénicas' },

  { career: 'Educación Inicial', faculty: 'Facultad de Educación' },
  { career: 'Educación Primaria', faculty: 'Facultad de Educación' },
  { career: 'Educación Secundaria', faculty: 'Facultad de Educación' },

  { career: 'Arquitectura', faculty: 'Facultad de Arquitectura y Urbanismo' },
  { career: 'Contabilidad', faculty: 'Facultad de Ciencias Contables' },
  { career: 'Derecho', faculty: 'Facultad de Derecho' },
  { career: 'Gestión', faculty: 'Facultad de Gestión y Alta Dirección' },
  { career: 'Psicología', faculty: 'Facultad de Psicología' },

  { career: 'Gastronomía', faculty: 'Facultad de Gastronomía, Hotelería y Turismo' },
  { career: 'Hotelería', faculty: 'Facultad de Gastronomía, Hotelería y Turismo' },
  { career: 'Turismo', faculty: 'Facultad de Gastronomía, Hotelería y Turismo' },
];

export const CAREERS_BY_FACULTY = CAREERS.reduce<Record<string, string[]>>((acc, { career, faculty }) => {
  if (!acc[faculty]) acc[faculty] = [];
  acc[faculty].push(career);
  return acc;
}, {});

export function getFacultyByCareer(career: string): string | undefined {
  return CAREERS.find((c) => c.career === career)?.faculty;
}
