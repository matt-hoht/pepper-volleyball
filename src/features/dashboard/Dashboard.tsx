"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, estimateTravelTime } from '@/utils/geoUtils';
import { useToast } from '@/context/ToastContext';
import { FeedbackSection } from '@/components/feedback/FeedbackSection';
import { Session } from '../calendar/calendarUtils';
import styles from './Dashboard.module.css';
import { Card } from '@/components/ui/Card';
import { Calendar } from '@/features/calendar/Calendar';

export const Dashboard = () => {
    const [scheduleData, setScheduleData] = React.useState<Session[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
    const { location, address: originAddress, loading, getLocation } = useGeolocation();
    const { showToast } = useToast();

    React.useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('sessions')
                    .select('*')
                    .order('day', { ascending: true });

                if (data) {
                    setScheduleData(data as Session[]);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, []);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const todaysSessions = (scheduleData as Session[]).filter(session => session.day === today && !session.hidden);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="title-gradient">San Diego Open Gym Schedule</h1>
                <p className={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {!location ? (
                    <button className={styles.geoBtn} onClick={getLocation} disabled={loading}>
                        {loading ? 'Getting Location...' : '📍 Enable Travel Times'}
                    </button>
                ) : (
                    <div className={styles.originIndicator}>
                        📍 Traveling from: <strong>{originAddress}</strong>
                    </div>
                )}
            </header>

            <section className={styles.sessions}>
                <h2 className={styles.sectionTitle}>Happening Today ({todaysSessions.length})</h2>
                <div className={styles.grid}>
                    {todaysSessions.map((session, index) => (
                        <Card key={index} className={styles.sessionCard}>
                            <div className={styles.sessionHeader}>
                                <span className={styles.time}>{session.time}</span>
                                <span className={styles.cost}>{session.cost}</span>
                            </div>
                            <h3 className={styles.gymName}>{session.gym}</h3>
                            <p className={styles.address}>{session.address}</p>
                            {session.notes && <p className={styles.notes}>{session.notes}</p>}
                            <div className={styles.actions}>
                                {location && (
                                    <div className={styles.travelTime}>
                                        🚗 {estimateTravelTime(calculateDistance(location.latitude, location.longitude, session.lat || 0, session.lng || 0))}
                                    </div>
                                )}
                                <button className={styles.copyBtn} onClick={() => {
                                    navigator.clipboard.writeText(session.address);
                                    showToast('Address copied to clipboard! 📋', 'info');
                                }}>
                                    Copy Address
                                </button>
                                <button
                                    className={styles.shareBtn}
                                    onClick={() => {
                                        const shareText = `Check out this volleyball open gym at ${session.gym} (${session.time})! \n📍 ${session.address}`;
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `Volleyball at ${session.gym}`,
                                                text: shareText,
                                                url: window.location.href
                                            }).then(() => {
                                                showToast('Shared successfully! 🏐', 'success');
                                            }).catch(() => {
                                                // User cancelled share usually
                                            });
                                        } else {
                                            navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
                                            showToast('Share link copied to clipboard! 🔗', 'info');
                                        }
                                    }}
                                >
                                    Share
                                </button>
                            </div>
                            <FeedbackSection gymId={session.gym} />
                        </Card>
                    ))}
                    {todaysSessions.length === 0 && (
                        <p className={styles.noSessions}>No open gyms scheduled for today. Check the calendar!</p>
                    )}
                </div>
            </section>

            <section className={styles.calendarSection}>
                <h2 className={styles.sectionTitle}>Full Schedule</h2>
                <Calendar />
            </section>
        </div>
    );
};
