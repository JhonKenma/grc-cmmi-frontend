// src/pages/Dashboard/components/shared/DashboardSkeleton.tsx
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="card">
      <div className="h-7 bg-gray-200 rounded w-64 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-40" />
    </div>
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    {/* Charts placeholder */}
    <div className="card h-64">
      <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
      <div className="h-44 bg-gray-100 rounded" />
    </div>
  </div>
);