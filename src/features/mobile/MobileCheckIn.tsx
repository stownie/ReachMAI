import { useState, useEffect } from 'react';
import { 
  QrCode, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Camera,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';
import type { MobileCheckIn, CheckInLocation, DeviceLocation } from '../../types';

interface MobileCheckInProps {
  userId: string;
  classId: string;
  onCheckIn: (checkIn: Partial<MobileCheckIn>) => void;
  onCheckOut: (checkInId: string) => void;
}

export default function MobileCheckInSystem({ 
  userId, 
  classId, 
  onCheckIn, 
  onCheckOut 
}: MobileCheckInProps) {
  const [checkInMethod, setCheckInMethod] = useState<'qr_code' | 'geolocation' | 'manual'>('qr_code');
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentCheckIn, setCurrentCheckIn] = useState<MobileCheckIn | null>(null);
  // TODO: Replace with real API call
  const [availableLocations] = useState<CheckInLocation[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (checkInMethod === 'geolocation') {
      getCurrentLocation();
    }
  }, [checkInMethod]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please try a different check-in method.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleQRScan = () => {
    setIsScanning(true);
    // In a real app, this would open the camera and scan QR codes
    // For demo purposes, we'll simulate a successful scan after 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      handleCheckIn('qr_code');
    }, 2000);
  };

  const handleLocationCheckIn = () => {
    if (!location) {
      getCurrentLocation();
      return;
    }

    // Check if user is within range of any check-in location
    const nearbyLocation = availableLocations.find(loc => {
      const distance = calculateDistance(
        location.latitude, 
        location.longitude, 
        loc.latitude, 
        loc.longitude
      );
      return distance <= loc.radius;
    });

    if (nearbyLocation) {
      handleCheckIn('geolocation');
    } else {
      alert('You are not within range of a check-in location. Please move closer or use a different method.');
    }
  };

  const handleCheckIn = (method: 'qr_code' | 'geolocation' | 'manual') => {
    const checkInData: Partial<MobileCheckIn> = {
      userId,
      classId,
      checkInMethod: method,
      checkInTime: new Date(),
      location: method === 'geolocation' ? location || undefined : undefined,
      status: 'checked_in',
      deviceId: 'mobile-device-1' // In real app, get actual device ID
    };

    // Store locally first (for offline support)
    const mockCheckIn: MobileCheckIn = {
      ...checkInData as MobileCheckIn,
      id: `checkin-${Date.now()}`,
      locationId: availableLocations[0]?.id || 'default-location',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCurrentCheckIn(mockCheckIn);
    onCheckIn(checkInData);

    // Show success message
    setTimeout(() => {
      alert('Successfully checked in!');
    }, 500);
  };

  const handleCheckOut = () => {
    if (currentCheckIn) {
      onCheckOut(currentCheckIn.id);
      setCurrentCheckIn(null);
      alert('Successfully checked out!');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check In</h1>
        <p className="text-gray-600">Choose your preferred check-in method</p>
        
        {/* Online/Offline Status */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Offline - Data will sync when online</span>
            </>
          )}
        </div>
      </div>

      {/* Current Check-in Status */}
      {currentCheckIn && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">Checked In</p>
                <p className="text-xs text-green-600">
                  {currentCheckIn.checkInTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckOut}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Check Out
            </button>
          </div>
        </div>
      )}

      {!currentCheckIn && (
        <>
          {/* Check-in Method Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 gap-4">
              {/* QR Code Check-in */}
              <button
                onClick={() => setCheckInMethod('qr_code')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  checkInMethod === 'qr_code' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <QrCode className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">QR Code Scan</h3>
                    <p className="text-sm text-gray-600">Scan the QR code at your location</p>
                  </div>
                </div>
              </button>

              {/* Location Check-in */}
              <button
                onClick={() => setCheckInMethod('geolocation')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  checkInMethod === 'geolocation' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Location-Based</h3>
                    <p className="text-sm text-gray-600">Use your location to check in</p>
                  </div>
                </div>
              </button>

              {/* Manual Check-in */}
              <button
                onClick={() => setCheckInMethod('manual')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  checkInMethod === 'manual' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Smartphone className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Manual Check-in</h3>
                    <p className="text-sm text-gray-600">Tap to check in manually</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Check-in Actions */}
          <div className="space-y-4">
            {checkInMethod === 'qr_code' && (
              <div className="text-center">
                {isScanning ? (
                  <div className="py-8">
                    <Camera className="h-16 w-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Scanning...</p>
                    <p className="text-sm text-gray-600">Point your camera at the QR code</p>
                  </div>
                ) : (
                  <button
                    onClick={handleQRScan}
                    className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <QrCode className="h-6 w-6 mx-auto mb-2" />
                    Start QR Scan
                  </button>
                )}
              </div>
            )}

            {checkInMethod === 'geolocation' && (
              <div className="text-center">
                <button
                  onClick={handleLocationCheckIn}
                  disabled={!location}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  {location ? 'Check In Here' : 'Getting Location...'}
                </button>
                
                {location && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Current Location:</strong><br />
                      Lat: {location.latitude.toFixed(6)}<br />
                      Lng: {location.longitude.toFixed(6)}<br />
                      Accuracy: ±{location.accuracy}m
                    </p>
                  </div>
                )}
              </div>
            )}

            {checkInMethod === 'manual' && (
              <div className="text-center">
                <button
                  onClick={() => handleCheckIn('manual')}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Clock className="h-6 w-6 mx-auto mb-2" />
                  Check In Now
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Available Locations */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Check-in Locations</h3>
        <div className="space-y-3">
          {availableLocations.map((location) => (
            <div key={location.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{location.name}</h4>
                  <p className="text-sm text-gray-600">{location.address}</p>
                </div>
                <div className="text-right">
                  {location.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock data removed - use real API data
function getMockCheckInLocations(): CheckInLocation[] {
  return [
    {
      id: 'location-1',
      organizationId: 'org-1',
      name: 'Main Studio',
      address: '123 Music Ave, Arts District',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 50, // 50 meters
      qrCode: 'REACHMAI_MAIN_STUDIO_001',
      isActive: true,
      checkInSettings: {
        allowEarlyCheckIn: true,
        earlyCheckInMinutes: 15,
        allowLateCheckIn: true,
        lateCheckInMinutes: 10,
        requireLocation: true,
        requireQRCode: false,
        allowSelfCheckOut: true,
        requirePhoto: false,
        requireSignature: false
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-10-24')
    },
    {
      id: 'location-2',
      organizationId: 'org-1',
      name: 'Practice Room A',
      address: '123 Music Ave, Room A',
      latitude: 40.7129,
      longitude: -74.0061,
      radius: 30,
      qrCode: 'REACHMAI_PRACTICE_A_002',
      isActive: true,
      checkInSettings: {
        allowEarlyCheckIn: true,
        earlyCheckInMinutes: 10,
        allowLateCheckIn: false,
        lateCheckInMinutes: 0,
        requireLocation: false,
        requireQRCode: true,
        allowSelfCheckOut: true,
        requirePhoto: false,
        requireSignature: false
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-10-24')
    }
  ];
}