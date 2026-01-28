import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, onClick }) => {
  return (
    <div
      className={`glass ${styles.card} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
    >
      {children}
    </div>
  );
};
