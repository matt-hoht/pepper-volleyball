"use client";

import React, { useState, useEffect } from 'react';
import styles from './AdminBoard.module.css';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Session } from '../calendar/calendarUtils';


export const AdminBoard: React.FC = () => {
    const [schedule, setSchedule] = useState<Session[]>([]);
    const [editingSession, setEditingSession] = useState<{ index: number; data: Session } | null>(null);
    const [isAdding, setIsAdding] = useState<{ day: string } | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            const { data } = await supabase.from('sessions').select('*').order('day');
            if (data) setSchedule(data as Session[]);
        }
        fetchSchedule();
    }, []);
    const [showConfirm, setShowConfirm] = useState<{ type: 'single' | 'recurring', data: Session, original: Session, index: number } | null>(null);
    const [showModal, setShowModal] = useState(false);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleEditClick = (index: number) => {
        // This function is now replaced by the new card structure's edit button logic
        // and the editingSession state structure.
        // Keeping it here for now as the original code had it, but it's not directly used
        // in the new JSX for displaying sessions.
        // The new logic uses setEditingSession({ index: session.originalIndex, data: { ...session } })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editingSession) return;
        setEditingSession({
            ...editingSession,
            data: {
                ...editingSession.data,
                [e.target.name]: e.target.value
            }
        });
    };

    const initiateSave = () => {
        // This function is for the old confirmation modal.
        // The new flow uses showConfirm state directly.
        setShowModal(true);
    };

    const saveSchedule = async (newSchedule: Session[]) => {
        // We'll update the logic below to handle individual row updates
    };

    const confirmSave = async (isRecurring: boolean) => {
        if (!editingSession) return;

        const originalSession = schedule[editingSession.index];
        const editedData = editingSession.data;

        try {
            if (isRecurring) {
                // Update all sessions with same gym and day (using gym/day as keys if no ID)
                const { error } = await supabase
                    .from('sessions')
                    .update({
                        time: editedData.time,
                        address: editedData.address,
                        cost: editedData.cost,
                        notes: editedData.notes
                    })
                    .eq('gym', originalSession.gym)
                    .eq('day', originalSession.day);

                if (error) throw error;
            } else {
                // Update single session. Using id if exists, fallback to gym/day/time
                const query = supabase.from('sessions').update(editedData);
                if ((originalSession as any).id) {
                    query.eq('id', (originalSession as any).id);
                } else {
                    query.eq('gym', originalSession.gym).eq('day', originalSession.day).eq('time', originalSession.time);
                }
                const { error } = await query;
                if (error) throw error;
            }

            // Refresh local state
            const { data } = await supabase.from('sessions').select('*').order('day');
            if (data) setSchedule(data as Session[]);

            setEditingSession(null);
            setShowModal(false);
            alert('Updated successfully!');
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save change');
        }
    };

    const handleToggleVisibility = async (index: number) => {
        const session = schedule[index];
        const newHidden = !session.hidden;

        try {
            const query = supabase.from('sessions').update({ hidden: newHidden });
            if ((session as any).id) {
                query.eq('id', (session as any).id);
            } else {
                query.eq('gym', session.gym).eq('day', session.day).eq('time', session.time);
            }
            const { error } = await query;
            if (error) throw error;

            const updated = [...schedule];
            updated[index] = { ...session, hidden: newHidden };
            setSchedule(updated);
        } catch (err) {
            alert('Failed to update visibility');
        }
    };

    const handleAddNew = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdding) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const newSession: Session = {
            gym: formData.get('gym') as string,
            day: isAdding.day,
            time: formData.get('time') as string,
            address: formData.get('address') as string,
            cost: formData.get('cost') as string,
            notes: formData.get('notes') as string,
            status: 'Admin Added',
            hidden: false
        };

        try {
            const { error } = await supabase.from('sessions').insert([newSession]);
            if (error) throw error;

            const { data } = await supabase.from('sessions').select('*').order('day');
            if (data) setSchedule(data as Session[]);
            setIsAdding(null);
        } catch (err) {
            alert('Failed to add session');
        }
    };


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="title-gradient">Admin Schedule Editor</h1>
                <p className={styles.subtitle}>Modify gym times and days</p>
            </header>

            <div className={styles.listWrapper}>
                {days.map((day) => (
                    <div key={day} className={styles.daySection}>
                        <div className={styles.dayHeader}>
                            <h3 className={styles.dayTitle}>{day}</h3>
                            <Button size="sm" variant="glass" onClick={() => setIsAdding({ day })}>+ Add Session</Button>
                        </div>
                        <div className={styles.sessionGrid}>
                            {schedule
                                .map((s, idx) => ({ ...s, originalIndex: idx }))
                                .filter(s => s.day === day)
                                .map((session) => (
                                    <Card key={session.originalIndex} className={`${styles.adminCard} ${session.hidden ? styles.hiddenCard : ''}`}>
                                        {editingSession?.index === session.originalIndex ? (
                                            <div className={styles.editForm}>
                                                <div className={styles.formGroup}>
                                                    <label>Time</label>
                                                    <input
                                                        name="time"
                                                        value={editingSession.data.time}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. 6pm-9pm"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Day</label>
                                                    <select name="day" value={editingSession.data.day} onChange={handleInputChange}>
                                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Gym</label>
                                                    <input
                                                        name="gym"
                                                        value={editingSession.data.gym}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. Gym Name"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Address</label>
                                                    <input
                                                        name="address"
                                                        value={editingSession.data.address}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. 123 Main St"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Cost</label>
                                                    <input
                                                        name="cost"
                                                        value={editingSession.data.cost}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. $10"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Notes</label>
                                                    <input
                                                        name="notes"
                                                        value={editingSession.data.notes || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Optional notes"
                                                    />
                                                </div>
                                                <div className={styles.formActions}>
                                                    <Button size="sm" variant="glass" onClick={() => setEditingSession(null)}>Cancel</Button>
                                                    <Button size="sm" variant="primary" onClick={initiateSave}>Save</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.displayInfo}>
                                                <div className={styles.mainInfo}>
                                                    <span className={styles.sessionTime}>{session.time}</span>
                                                    <span className={styles.sessionGym}>{session.gym}</span>
                                                </div>
                                                <div className={styles.cardActions}>
                                                    <button
                                                        className={styles.hideBtn}
                                                        onClick={() => handleToggleVisibility(session.originalIndex)}
                                                        title={session.hidden ? "Show in Calendar" : "Hide from Calendar"}
                                                    >
                                                        {session.hidden ? '👁️' : '🚫'}
                                                    </button>
                                                    <Button size="sm" variant="glass" onClick={() => setEditingSession({ index: session.originalIndex, data: { ...session } })}>Edit</Button>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} glass`}>
                        <h3>Confirm Update</h3>
                        <p>Would you like to apply this change as a one-time update, or to all recurring sessions for this gym?</p>
                        <div className={styles.modalActions}>
                            <Button variant="glass" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => confirmSave(false)}>Just Once</Button>
                            <Button variant="primary" onClick={() => confirmSave(true)}>All Recurring</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
