"use client";

import React, { useState } from 'react';
import styles from './FeedbackSection.module.css';
import { supabase } from '@/lib/supabase';

interface FeedbackSectionProps {
    gymId: string;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ gymId }) => {
    const [skillLevel, setSkillLevel] = useState(3); // 1 = Rec, 5 = Comp
    const [crowdLevel, setCrowdLevel] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState({ skill: false, crowd: false });

    // Load user's previous votes from localStorage
    React.useEffect(() => {
        const stored = localStorage.getItem(`voted_${gymId}`);
        if (stored) {
            const data = JSON.parse(stored);
            setHasVoted(data);
            if (data.skillValue) setSkillLevel(data.skillValue);
            if (data.crowdLabel) setCrowdLevel(data.crowdLabel);
        }
    }, [gymId]);

    // Fetch current stats on mount
    React.useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('skill_level, crowd_level')
                .eq('gym_name', gymId);

            if (data) {
                const skillVotes = data.filter(d => d.skill_level !== null);
                const skillSum = skillVotes.reduce((acc, curr) => acc + curr.skill_level, 0);
                const skillCount = skillVotes.length;

                const crowdVotes: { [key: string]: number } = { 'Empty': 0, 'Moderate': 0, 'Full': 0 };
                data.forEach(d => {
                    if (d.crowd_level && crowdVotes[d.crowd_level] !== undefined) {
                        crowdVotes[d.crowd_level]++;
                    }
                });

                setStats({
                    skillSum,
                    skillCount,
                    crowdVotes
                });
            }
        };
        fetchStats();
    }, [gymId]);

    const submitFeedback = async (type: 'skill' | 'crowd', value: any) => {
        if (hasVoted[type] || submitting) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert([{
                    gym_name: gymId,
                    skill_level: type === 'skill' ? value : null,
                    crowd_level: type === 'crowd' ? value : null,
                }]);

            if (error) throw error;

            // Update stats locally
            const newStats = { ...stats };
            if (type === 'skill') {
                newStats.skillSum = (newStats.skillSum || 0) + value;
                newStats.skillCount = (newStats.skillCount || 0) + 1;
            } else {
                newStats.crowdVotes = { ...newStats.crowdVotes };
                newStats.crowdVotes[value] = (newStats.crowdVotes[value] || 0) + 1;
            }
            setStats(newStats);

            // Persist the vote locally
            const newVoted = {
                ...hasVoted,
                [type]: true,
                [`${type}Value`]: type === 'skill' ? value : undefined,
                [`${type}Label`]: type === 'crowd' ? value : undefined
            };
            setHasVoted(newVoted);
            localStorage.setItem(`voted_${gymId}`, JSON.stringify(newVoted));
        } catch (e) {
            console.error('Failed to submit feedback:', e);
        }
        setSubmitting(false);
    };

    const avgSkill = stats?.skillCount > 0 ? (stats.skillSum / stats.skillCount).toFixed(1) : null;

    const crowdOptions = [
        { label: 'Empty', icon: '🍃' },
        { label: 'Moderate', icon: '🏐' },
        { label: 'Full', icon: '🔥' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.metric}>
                <div className={styles.metricHeader}>
                    <span>Skill Level</span>
                    <span className={styles.valueLabel}>
                        {skillLevel <= 2 ? 'Recreational' : skillLevel >= 4 ? 'Competitive' : 'Intermediate'}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                    onMouseUp={() => submitFeedback('skill', skillLevel)}
                    onTouchEnd={() => submitFeedback('skill', skillLevel)}
                    className={styles.slider}
                    disabled={submitting || hasVoted.skill}
                />
                <div className={styles.rangeLabels}>
                    <span>Rec</span>
                    {avgSkill && <span className={styles.avgBadge}>Avg: {avgSkill}</span>}
                    <span>Comp</span>
                </div>
            </div>

            <div className={styles.metric}>
                <div className={styles.metricHeader}>
                    <span>Crowd Meter</span>
                </div>
                <div className={styles.crowdOptions}>
                    {crowdOptions.map((opt) => (
                        <button
                            key={opt.label}
                            className={`${styles.crowdBtn} ${crowdLevel === opt.label ? styles.active : ''}`}
                            onClick={() => {
                                setCrowdLevel(opt.label);
                                submitFeedback('crowd', opt.label);
                            }}
                            disabled={submitting || hasVoted.crowd}
                        >
                            <span className={styles.icon}>{opt.icon}</span>
                            <span className={styles.label}>{opt.label}</span>
                            {stats?.crowdVotes?.[opt.label] > 0 && (
                                <span className={styles.voteCount}>{stats.crowdVotes[opt.label]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
