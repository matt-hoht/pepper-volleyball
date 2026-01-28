export interface Session {
    gym: string;
    day: string;
    time: string;
    address: string;
    lat?: number;
    lng?: number;
    cost: string;
    notes?: string;
    status: string;
    image?: string;
    hidden?: boolean;
}

export const parseTime = (timeStr: string) => {
    const [start, end] = timeStr.split('-').map(t => t.trim());

    const convert = (t: string) => {
        let [time, modifier] = t.split(/(am|pm)/i);
        let [hours, minutes] = time.includes(':') ? time.split(':') : [time, '00'];
        let h = parseInt(hours, 10);
        if (modifier.toLowerCase() === 'pm' && h < 12) h += 12;
        if (modifier.toLowerCase() === 'am' && h === 12) h = 0;
        return h * 60 + parseInt(minutes, 10);
    };

    try {
        return {
            start: convert(start),
            end: convert(end || start) // fallback if end missing
        };
    } catch (e) {
        return { start: 0, end: 60 }; // safety fallback
    }
};

export const calculateOverlaps = (sessions: Session[]) => {
    const parsed = sessions.map(s => ({ ...s, ...parseTime(s.time) }));

    return parsed.map((s1, i) => {
        let overlapCount = 0;
        let position = 0;

        parsed.forEach((s2, j) => {
            if (i === j) return;
            // Simple overlap check
            if (s1.start < s2.end && s1.end > s2.start) {
                overlapCount++;
                if (j < i) position++;
            }
        });

        return {
            ...s1,
            width: 100 / (overlapCount + 1),
            left: (100 / (overlapCount + 1)) * position
        };
    });
};
