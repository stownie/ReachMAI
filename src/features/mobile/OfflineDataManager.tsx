import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Download, Upload, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { OfflineData, SyncStatus, OfflineQueue } from '../../types';

interface OfflineDataManagerProps {
  userId: string;
  onDataSync?: (syncStatus: SyncStatus) => void;
  onOfflineStatusChange?: (isOffline: boolean) => void;
}

export function OfflineDataManager({
  userId,
  onDataSync,
  onOfflineStatusChange
}: OfflineDataManagerProps) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncQueue, setSyncQueue] = useState<OfflineQueue[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [showDataManager, setShowDataManager] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      onOfflineStatusChange?.(false);
      // Auto-sync when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      onOfflineStatusChange?.(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOfflineStatusChange]);

  // Load offline data from localStorage
  useEffect(() => {
    loadOfflineData();
    loadSyncQueue();
    calculateStorageUsage();
  }, [userId]);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem(`offlineData_${userId}`);
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const loadSyncQueue = () => {
    try {
      const stored = localStorage.getItem(`syncQueue_${userId}`);
      if (stored) {
        setSyncQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  };

  const calculateStorageUsage = () => {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.includes(userId)) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      });
      
      setStorageUsage(totalSize);
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }
  };



  const syncOfflineData = useCallback(async () => {
    if (isOffline || syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    onDataSync?.('syncing');

    try {
      // Simulate API sync operations
      for (const operation of syncQueue) {
        await simulateApiSync(operation);
        
        // Remove from queue after successful sync
        setSyncQueue(prev => prev.filter(item => item.id !== operation.id));
      }

      // Update localStorage
      localStorage.setItem(`syncQueue_${userId}`, JSON.stringify([]));
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
      onDataSync?.('success');

      // Clear sync status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      onDataSync?.('error');
      
      // Clear error status after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [isOffline, syncStatus, syncQueue, userId, onDataSync]);

  const simulateApiSync = async (_operation: OfflineQueue): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Sync operation failed'));
        }
      }, 1000 + Math.random() * 2000);
    });
  };

  const clearOfflineData = () => {
    try {
      localStorage.removeItem(`offlineData_${userId}`);
      localStorage.removeItem(`syncQueue_${userId}`);
      setOfflineData([]);
      setSyncQueue([]);
      calculateStorageUsage();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return isOffline ? <WifiOff className="h-4 w-4 text-gray-500" /> : <Wifi className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return isOffline ? 'Offline' : 'Online';
    }
  };

  return (
    <>
      {/* Status Indicator */}
      <div 
        className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white rounded-lg shadow-lg px-3 py-2 cursor-pointer border"
        onClick={() => setShowDataManager(true)}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {syncQueue.length > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
            {syncQueue.length}
          </span>
        )}
      </div>

      {/* Data Manager Modal */}
      {showDataManager && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Offline Data Manager
                </h2>
                <button
                  onClick={() => setShowDataManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Connection Status */}
              <div className="mb-6 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isOffline ? (
                      <WifiOff className="h-5 w-5 text-red-500 mr-2" />
                    ) : (
                      <Wifi className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <span className="font-medium">
                      {isOffline ? 'Offline Mode' : 'Online'}
                    </span>
                  </div>
                  {!isOffline && syncQueue.length > 0 && (
                    <button
                      onClick={syncOfflineData}
                      disabled={syncStatus === 'syncing'}
                      className="flex items-center px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Sync Now
                    </button>
                  )}
                </div>
                {lastSyncTime && (
                  <p className="text-sm text-gray-500 mt-2">
                    Last sync: {lastSyncTime.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Storage Usage */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Storage Usage</h3>
                <p className="text-sm text-gray-600">
                  {formatStorageSize(storageUsage)} used
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((storageUsage / (5 * 1024 * 1024)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Limit: 5 MB
                </p>
              </div>

              {/* Sync Queue */}
              {syncQueue.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Pending Sync ({syncQueue.length})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {syncQueue.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div>
                          <p className="text-sm font-medium">{item.operation}</p>
                          <p className="text-xs text-gray-500">{item.entity}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Data */}
              {offlineData.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Cached Data ({offlineData.length})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {offlineData.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-green-50 rounded border-l-4 border-green-400">
                        <div>
                          <p className="text-sm font-medium">{item.type}</p>
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(item.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Download className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                    {offlineData.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        ... and {offlineData.length - 5} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={clearOfflineData}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50"
                >
                  Clear Data
                </button>
                <button
                  onClick={() => setShowDataManager(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for using offline data management
export function useOfflineData(userId: string) {
  const [isOffline] = useState(!navigator.onLine);
  const [syncStatus] = useState<SyncStatus>('idle');

  const saveForOffline = useCallback((data: any, type: string, ttl: number = 24 * 60 * 60 * 1000) => {
    try {
      const offlineData: OfflineData = {
        id: `${type}_${Date.now()}`,
        type,
        data,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + ttl),
        userId
      };

      const existing = JSON.parse(localStorage.getItem(`offlineData_${userId}`) || '[]');
      existing.push(offlineData);
      localStorage.setItem(`offlineData_${userId}`, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, [userId]);

  const getOfflineData = useCallback((type: string) => {
    try {
      const stored = localStorage.getItem(`offlineData_${userId}`);
      if (!stored) return null;

      const offlineData: OfflineData[] = JSON.parse(stored);
      const now = new Date();
      
      // Filter for requested type and not expired
      const validData = offlineData.filter(item => 
        item.type === type && new Date(item.expiresAt) > now
      );

      return validData.length > 0 ? validData[validData.length - 1].data : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }, [userId]);

  const queueForSync = useCallback((operation: string, entity: string, data: any) => {
    try {
      const queueItem: OfflineQueue = {
        id: `${operation}_${entity}_${Date.now()}`,
        operation,
        entity,
        data,
        timestamp: new Date(),
        userId,
        retryCount: 0
      };

      const existing = JSON.parse(localStorage.getItem(`syncQueue_${userId}`) || '[]');
      existing.push(queueItem);
      localStorage.setItem(`syncQueue_${userId}`, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to queue for sync:', error);
    }
  }, [userId]);

  return {
    isOffline,
    syncStatus,
    saveForOffline,
    getOfflineData,
    queueForSync
  };
}