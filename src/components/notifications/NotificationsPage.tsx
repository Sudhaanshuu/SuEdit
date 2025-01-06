import { Bell } from 'lucide-react';

export function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <div className="bg-dark-100 rounded-lg p-6 border border-primary-800/20">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="text-primary-500" size={24} />
          <h2 className="text-xl font-cyber">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-400 text-center py-8">
            No notifications yet
          </p>
        </div>
      </div>
    </div>
  );
}