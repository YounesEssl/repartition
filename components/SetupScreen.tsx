"use client";

import { useState } from "react";
import { DEFAULT_GUESTS } from "@/lib/data";
import styles from "./SetupScreen.module.css";

interface SetupScreenProps {
  onStart: (input: string) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [input, setInput] = useState(DEFAULT_GUESTS);
  const count = input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.logoWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#1A1714" />
            <path
              d="M14 32V22L24 14L34 22V32H28V26H20V32H14Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Répartition des Chambres</h1>
        <p className={styles.subtitle}>
          Glisse les invités dans les chambres pour organiser le séjour
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Liste des invités</h2>
          <span className={styles.badge}>{count}</span>
        </div>
        <p className={styles.cardDesc}>
          Un nom par ligne. Les doublons seront automatiquement numérotés.
        </p>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={18}
          placeholder="Un nom par ligne..."
          spellCheck={false}
        />
        <div className={styles.actions}>
          <button
            className={styles.btnStart}
            onClick={() => input.trim() && onStart(input)}
            disabled={!input.trim()}
          >
            Commencer la répartition
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10m0 0L9 4m4 4L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
