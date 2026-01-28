"use client";

import React, { useState } from 'react';
import { AdminBoard } from '@/features/admin/AdminBoard';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '555') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password');
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top, #1e293b, #0f172a)'
            }}>
                <div className="glass" style={{ padding: '3rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h1 className="title-gradient" style={{ textAlign: 'center', fontSize: '2rem' }}>Admin Access</h1>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', opacity: 0.8 }}>Enter Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                autoFocus
                            />
                        </div>
                        {error && <p style={{ color: '#ff4444', fontSize: '0.85rem' }}>{error}</p>}
                        <Button type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                            Unlock Editor
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return <AdminBoard />;
}
