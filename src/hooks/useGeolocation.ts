"use client";

import { useState, useEffect } from 'react';

export interface Location {
    latitude: number;
    longitude: number;
}

export const useGeolocation = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const loc = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setLocation(loc);

                // Reverse geocoding for summary
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`);
                    const data = await res.json();
                    setAddress(data.address.city || data.address.town || data.address.village || 'Unknown Location');
                } catch (e) {
                    setAddress(`${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`);
                }

                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    };

    return { location, address, error, loading, getLocation };
};
