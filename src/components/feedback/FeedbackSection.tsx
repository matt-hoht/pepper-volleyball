"use client";

import React, { useState } from 'react';
import styles from './FeedbackSection.module.css';

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
        fetch(`/api/feedback?gymId=${encodeURIComponent(gymId)}`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setStats(data);
            });
    }, [gymId]);

    const submitFeedback = async (type: 'skill' | 'crowd', value: any) => {
        if (hasVoted[type] || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gymId,
                    skillLevel: type === 'skill' ? value : undefined,
                    crowdLevel: type === 'crowd' ? value : undefined,
                }),
            });
            const updated = await res.json();
            setStats(updated);

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
            console.error('Failed to submit feedback');
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
