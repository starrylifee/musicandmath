import type { FC } from 'react';
import type { Division } from '../types';

interface DivisionToggleProps {
  division: Division;
  onChange: (division: Division) => void;
}

export const DivisionToggle: FC<DivisionToggleProps> = ({
  division,
  onChange,
}) => {
  const divisions: { value: Division; label: string; description: string }[] = [
    { value: 4, label: '1/4', description: '4분음표' },
    { value: 8, label: '1/8', description: '8분음표' },
    { value: 16, label: '1/16', description: '16분음표' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-gray-600">분할 단위</span>
      <div className="flex bg-gray-100 p-1 rounded-full">
        {divisions.map((d) => (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            className={`
              px-4 py-2 rounded-full font-bold text-sm transition-all
              ${division === d.value 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-200'}
            `}
            title={d.description}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DivisionToggle;
