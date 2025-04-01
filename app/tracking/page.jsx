"use client";
import { useState, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, GeoPoint } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Header from '../components/Header';

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth();

export default function LocationTracker() {
    const [tracking, setTracking] = useState(false);
    const [message, setMessage] = useState('Click on the button to start tracking the route.');
    const [position, setPosition] = useState(null);
    const watchIdRef = useRef(null);

    // Save location with geohash (stored using Firestore GeoPoint)
    const saveLocationWithGeohash = async (latitude, longitude) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage('User not authenticated.');
            return;
        }

        // Collection reference: users -> userId -> locations
        const locationsRef = collection(db, 'users', user.uid, 'locations');

        const locationData = {
            coordinates: new GeoPoint(latitude, longitude),
            timestamp: new Date().toISOString(),
        };

        // Log the location data before saving to Firestore
        console.log("Location Data to Save:", locationData);

        try {
            await addDoc(locationsRef, locationData); // Add location to Firestore
            setMessage('Location saved with geohash!');
        } catch (error) {
            setMessage(`Error saving location: ${error.message}`);
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setMessage('Geolocation is not supported by your browser.');
            return;
        }

        setTracking(true);
        setMessage('Tracking your location...');

        // Watch position and save each location to Firestore
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ latitude, longitude });
                saveLocationWithGeohash(latitude, longitude); // Save location with geohash
            },
            (error) => {
                setMessage(`Error: ${error.message}`);
            }
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTracking(false);
        setMessage('Tracking stopped. Click to start again.');
        setPosition(null);
    };

    return (
        <div className="min-h-screen bg-white from-blue-500 to-purple-600 text-white">
            <Header />
            <div className="flex flex-col justify-center items-center min-h-screen p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-500 md:text-4xl">{message}</h2>
                {position && (
                    <p className="mb-6 text-lg">📍 Latitude: {position.latitude}, Longitude: {position.longitude}</p>
                )}
                <button
                    onClick={tracking ? stopTracking : startTracking}
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-md transition-colors text-center ${tracking ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'}`}
                >
                    {tracking ? 'Stop Tracking' : 'Start Tracking'}
                </button>
            </div>
        </div>
    );
}
