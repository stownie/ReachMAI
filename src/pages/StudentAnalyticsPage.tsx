import { ArrowLeft } from 'lucide-react';
import StudentPerformanceAnalyticsView from '../features/analytics/StudentPerformanceAnalytics';

export default function StudentAnalyticsPage() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Student Performance Analytics
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        <StudentPerformanceAnalyticsView />
      </main>
    </div>
  );
}