"use client";

import React, { useState, useMemo } from 'react';
import styles from './Calendar.module.css';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateOverlaps, Session, parseTime } from './calendarUtils';

import { FeedbackSection } from '@/components/feedback/FeedbackSection';

const HOUR_HEIGHT = 80; // pixels per hour

type ViewType = 'Day' | 'Week';

export const Calendar: React.FC = () => {
    const [view, setView] = React.useState<'Day' | 'Week' | 'Month'>('Day');
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [scheduleData, setScheduleData] = React.useState<Session[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [activeMobileDay, setActiveMobileDay] = React.useState<string>('');

    React.useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.from('sessions').select('*');
                if (error) throw error;
                if (data) setScheduleData(data as Session[]);
            } catch (err) {
                console.error('Supabase fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, []);
    const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const mobileScrollRef = React.useRef<HTMLDivElement>(null);
    const dayRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDates = useMemo(() => {
        const start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() - selectedDate.getDay());
        return daysOfWeek.map((day, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return {
                name: day,
                dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
        });
    }, [selectedDate]);


    // Filter and process data based on current view
    const currentViewData = useMemo(() => {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const daySessions = (scheduleData as Session[]).filter(s => s.day === dayName && !s.hidden);
        return calculateOverlaps(daySessions);
    }, [selectedDate, scheduleData]);

    React.useEffect(() => {
        if (view === 'Day' && scrollContainerRef.current) {
            if (currentViewData.length > 0) {
                const earliestStart = Math.min(...currentViewData.map(s => s.start));
                const scrollTarget = Math.max(0, earliestStart - 30);
                scrollContainerRef.current.scrollTop = (scrollTarget / 60) * HOUR_HEIGHT;
            } else {
                scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT;
            }
        } else if (view === 'Week' && mobileScrollRef.current) {
            // Wait for DOM to be ready
            requestAnimationFrame(() => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const todayName = days[new Date().getDay()];
                const todayElement = dayRefs.current[todayName];
                if (todayElement && mobileScrollRef.current) {
                    // Check if we are on desktop (horizontal scroll) or mobile (vertical scroll)
                    const isDesktop = window.innerWidth > 768;
                    if (isDesktop) {
                        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    } else {
                        mobileScrollRef.current.scrollTop = todayElement.offsetTop;
                    }
                }
            });
        }
    }, [view, currentViewData, scheduleData]);


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
                    <h2 className={`${styles.currentDateDisplay} ${styles.desktopDate}`}>
                        {view === 'Day'
                            ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                            : getWeekRange()
                        }
                    </h2>
                    <h2 className={`${styles.currentDateDisplay} ${styles.mobileDate}`}>
                        {view === 'Day'
                            ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            : 'Weekly Schedule'
                        }
                    </h2>
                    <Button variant="glass" size="sm" onClick={() => navigate(1)}>→</Button>
                </div>
            </div>

            <div className={styles.viewContent}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Syncing with Pepper Database...</p>
                    </div>
                ) : (
                    <>
                        {view === 'Day' && (
                            <>
                                <div className={`${styles.scrollWrapper} ${styles.desktopOnly}`} ref={scrollContainerRef}>
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
                                <div className={`${styles.mobileListView} ${styles.mobileOnly}`}>
                                    {currentViewData.length > 0 ? (
                                        currentViewData.map((session, i) => (
                                            <Card key={i} className={styles.mobileSessionCard} onClick={() => setSelectedSession(session)}>
                                                <div className={styles.mobileSessionHeader}>
                                                    <div className={styles.mobileSessionMeta}>
                                                        <span className={styles.mobileSessionTime}>{session.time}</span>
                                                        <span className={styles.mobileSessionDayLabel}>{session.day}</span>
                                                    </div>
                                                    <span className={styles.mobileSessionGym}>{session.gym}</span>
                                                </div>
                                                <p className={styles.mobileSessionAddress}>{session.address}</p>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className={styles.noSessions}>No sessions scheduled for this day.</p>
                                    )}
                                </div>
                            </>
                        )}
                        {view === 'Week' && (
                            <div className={`${styles.mobileListView} ${styles.unifiedListView} ${styles.mobileScrollWrapper}`} ref={mobileScrollRef}>
                                {weekDates.map(wd => {
                                    const daySessions = (scheduleData as Session[])
                                        .filter(s => s.day === wd.name && !s.hidden)
                                        .map(s => {
                                            const { start, end } = parseTime(s.time);
                                            return { ...s, start, end };
                                        })
                                        .sort((a, b) => a.start - b.start);

                                    if (daySessions.length === 0) return null;
                                    return (
                                        <div
                                            key={wd.name}
                                            className={styles.mobileDayGroup}
                                            ref={el => { dayRefs.current[wd.name] = el; }}
                                            data-day={wd.name}
                                            data-date={wd.dateLabel}
                                        >
                                            <h3 className={styles.mobileDayHeader}>{wd.name} ({wd.dateLabel})</h3>
                                            <div className={styles.mobileDaySessions}>
                                                {daySessions.map((session, i) => (
                                                    <Card key={i} className={styles.mobileSessionCard} onClick={() => setSelectedSession(session)}>
                                                        <div className={styles.mobileSessionHeader}>
                                                            <div className={styles.mobileSessionMeta}>
                                                                <span className={styles.mobileSessionTime}>{session.time}</span>
                                                                <span className={styles.mobileSessionDayLabel}>{session.day}</span>
                                                            </div>
                                                            <span className={styles.mobileSessionGym}>{session.gym}</span>
                                                        </div>
                                                        <p className={styles.mobileSessionAddress}>{session.address}</p>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
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
