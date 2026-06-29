'use client';

import { CAREERS_BY_FACULTY } from '@/lib/careers';
import { Label } from '@/components/ui/label';

interface CareerSelectProps {
  id?: string;
  value: string;
  onChange: (career: string) => void;
  label?: string;
}

export function CareerSelect({ id = 'career', value, onChange, label = 'Carrera' }: CareerSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Selecciona tu carrera...</option>
        {Object.entries(CAREERS_BY_FACULTY).map(([faculty, careers]) => (
          <optgroup key={faculty} label={faculty}>
            {careers.map((career) => (
              <option key={career} value={career}>{career}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
