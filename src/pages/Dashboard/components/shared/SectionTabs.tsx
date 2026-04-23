// src/pages/Dashboard/components/shared/SectionTabs.tsx
interface Tab { id: string; label: string; count?: number }

interface SectionTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`
          px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150
          ${active === tab.id
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'}
        `}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
            active === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
          }`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);