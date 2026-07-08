'use client';

import { useState } from 'react';
import { CAREERS_BY_FACULTY, getFacultyByCareer } from '@/lib/careers';
import { Label } from '@/components/ui/label';

interface CareerSelectProps {
  id?: string;
  value: string;
  onChange: (career: string) => void;
  label?: string;
}

export function CareerSelect({ id = 'career', value, onChange, label = 'Carrera' }: CareerSelectProps) {
  // La facultad se deriva de la carrera elegida; el override solo aplica
  // mientras el usuario cambia de facultad y aún no elige carrera.
  const [facultyOverride, setFacultyOverride] = useState('');
  const faculty = (value ? getFacultyByCareer(value) : undefined) ?? facultyOverride;

  const faculties = Object.keys(CAREERS_BY_FACULTY);
  const careers = faculty ? (CAREERS_BY_FACULTY[faculty] ?? []) : [];

  const handleFacultyChange = (newFaculty: string) => {
    setFacultyOverride(newFaculty);
    onChange('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-faculty`}>Facultad</Label>
        <select
          id={`${id}-faculty`}
          value={faculty}
          onChange={(e) => handleFacultyChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecciona tu facultad...</option>
          {faculties.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!faculty}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{faculty ? 'Selecciona tu carrera...' : 'Primero elige una facultad'}</option>
          {careers.map((career) => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
