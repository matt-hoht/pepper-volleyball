"use client";

import React, { useState, useMemo } from 'react';
import styles from './Calendar.module.css';
import scheduleData from '@/data/schedule.json';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateOverlaps, Session } from './calendarUtils';

import { FeedbackSection } from '@/components/feedback/FeedbackSection';

const HOUR_HEIGHT = 80; // pixels per hour

type ViewType = 'Day' | 'Week';

export const Calendar: React.FC = () => {
    const [view, setView] = useState<ViewType>('Day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Filter and process data based on current view
    const currentViewData = useMemo(() => {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const daySessions = (scheduleData as Session[]).filter(s => s.day === dayName && !s.hidden);
        return calculateOverlaps(daySessions);
    }, [selectedDate]);

    React.useEffect(() => {
        if (scrollContainerRef.current && view === 'Day') {
            // Find the earliest start time in currentViewData
            if (currentViewData.length > 0) {
                const earliestStart = Math.min(...currentViewData.map(s => s.start));
                // Scroll to earliest session - 30 mins buffer for context, but not before 12am
                const scrollTarget = Math.max(0, earliestStart - 30);
                scrollContainerRef.current.scrollTop = (scrollTarget / 60) * HOUR_HEIGHT;
            } else {
                // Fallback to 8 AM if no sessions
                scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT;
            }
        }
    }, [view, currentViewData]);

    const navigate = (direction: number) => {
        const diff = view === 'Day' ? 86400000 : 7 * 86400000;
        setSelectedDate(new Date(selectedDate.getTime() + direction * diff));
    };

    const getWeekRange = () => {
        const start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() - selectedDate.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${format(start)} - ${format(end)}`;
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={`${styles.calendarContainer} glass`}>
            <div className={styles.controls}>
                <div className={styles.viewTabs}>
                    {(['Day', 'Week'] as ViewType[]).map(v => (
                        <Button
                            key={v}
                            variant={view === v ? 'primary' : 'glass'}
                            size="sm"
                            onClick={() => setView(v)}
                        >
                            {v}
                        </Button>
                    ))}
                </div>
                <div className={styles.navigation}>
                    <Button variant="glass" size="sm" onClick={() => navigate(-1)}>←</Button>
                    <Button variant="glass" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
                    <h2 className={styles.currentDateDisplay}>
                        {view === 'Day'
                            ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                            : getWeekRange()
                        }
                    </h2>
                    <Button variant="glass" size="sm" onClick={() => navigate(1)}>→</Button>
                </div>
            </div>

            <div className={styles.viewContent}>
                {view === 'Day' && (
                    <div className={styles.scrollWrapper} ref={scrollContainerRef}>
                        <div className={styles.dayGrid}>
                            <div className={styles.timeColumn}>
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} className={styles.timeSlot} style={{ height: HOUR_HEIGHT }}>
                                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                    </div>
                                ))}
                            </div>
                            <div
                                className={styles.eventsColumn}
                                style={{ height: 24 * HOUR_HEIGHT }}
                            >
                                {currentViewData.map((session, i) => (
                                    <Card
                                        key={i}
                                        className={styles.eventCard}
                                        onClick={() => setSelectedSession(session)}
                                        style={{
                                            position: 'absolute',
                                            top: `${(session.start / 60) * HOUR_HEIGHT}px`,
                                            height: `${((session.end - session.start) / 60) * HOUR_HEIGHT}px`,
                                            left: `${session.left}%`,
                                            width: `${session.width}%`,
                                            padding: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <p className={styles.eventTimeShadow}>{session.time}</p>
                                        <p className={styles.eventGymSmall}>{session.gym}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {view === 'Week' && (
                    <div className={styles.weekGrid}>
                        {daysOfWeek.map(day => (
                            <div key={day} className={styles.weekDayColumn}>
                                <div className={styles.weekDayHeader}>{day}</div>
                                <div className={styles.weekEvents}>
                                    {calculateOverlaps((scheduleData as Session[]).filter(s => s.day === day && !s.hidden)).map((s, i) => (
                                        <div
                                            key={i}
                                            className={styles.miniEvent}
                                            onClick={() => setSelectedSession(s)}
                                            style={{
                                                top: (s.start / 1440) * 100 + '%',
                                                left: s.left + '%',
                                                width: s.width + '%',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span className={styles.miniTime}>{s.time.split('-')[0]}</span>
                                            {s.gym}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedSession && (
                <div className={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
                    <div className={`${styles.modal} glass`} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{selectedSession.gym}</h3>
                            <Button variant="glass" size="sm" onClick={() => setSelectedSession(null)}>✕</Button>
                        </div>
                        <div className={styles.modalInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Time:</span>
                                <span>{selectedSession.time} ({selectedSession.day})</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Address:</span>
                                <span>{selectedSession.address}</span>
                            </div>
                            {selectedSession.notes && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Notes:</span>
                                    <span>{selectedSession.notes}</span>
                                </div>
                            )}
                        </div>
                        <FeedbackSection gymId={selectedSession.gym} />
                        <div className={styles.modalFooter}>
                            <Button variant="primary" style={{ width: '100%' }} onClick={() => setSelectedSession(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
