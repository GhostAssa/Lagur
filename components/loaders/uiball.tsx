import type { CSSProperties } from "react";
import "./uiball.css";

type BaseProps = { size?: number; color?: string; speed?: number; className?: string };

function vars(size: number, color: string, speed: number, extra: Record<string, string | number> = {}) {
  return {
    "--uib-size": `${size}px`,
    "--uib-color": color,
    "--uib-speed": `${speed}s`,
    ...extra,
  } as CSSProperties;
}

/** Page and button loader. Default colour follows the current text colour. */
export function Ring2({
  size = 40, color = "currentColor", speed = 0.8, stroke = 5, strokeLength = 0.25, bgOpacity = 0.1, className = "",
}: BaseProps & { stroke?: number; strokeLength?: number; bgOpacity?: number }) {
  const half = size / 2;
  const r = Math.max(0, size / 2 - stroke / 2);
  return (
    <div
      className={`uib-ring2 ${className}`}
      aria-hidden="true"
      style={vars(size, color, speed, {
        "--uib-dash": 100 * strokeLength,
        "--uib-gap": 100 - 100 * strokeLength,
        "--uib-bg-opacity": bgOpacity,
      })}
    >
      <svg className="uib-ring2__inner" viewBox={`${half} ${half} ${size} ${size}`} height={size} width={size}>
        <circle className="uib-ring2__track" cx={size} cy={size} r={r} pathLength="100" strokeWidth={`${stroke}px`} fill="none" />
        <circle className="uib-ring2__car" cx={size} cy={size} r={r} pathLength="100" strokeWidth={`${stroke}px`} fill="none" />
      </svg>
    </div>
  );
}

/** Three pulsing dots: "agent is typing". */
export function DotPulse({ size = 43, color = "currentColor", speed = 1.3, className = "" }: BaseProps) {
  return (
    <div className={`uib-dotpulse ${className}`} aria-hidden="true" style={vars(size, color, speed)}>
      <div className="uib-dotpulse__inner"><div className="uib-dotpulse__dot" /></div>
    </div>
  );
}

/** Four bars: "the AI is thinking". */
export function Waveform({ size = 35, color = "currentColor", speed = 1, stroke = 3.5, className = "" }: BaseProps & { stroke?: number }) {
  return (
    <div className={`uib-waveform ${className}`} aria-hidden="true" style={vars(size, color, speed, { "--uib-stroke": `${stroke}px` })}>
      <div className="uib-waveform__inner">
        <div className="uib-waveform__bar" /><div className="uib-waveform__bar" /><div className="uib-waveform__bar" /><div className="uib-waveform__bar" />
      </div>
    </div>
  );
}

/** Expanding rings: searching a location, finding recommendations. */
export function Ripples({ size = 45, color = "currentColor", speed = 2, className = "" }: BaseProps) {
  return (
    <div className={`uib-ripples ${className}`} aria-hidden="true" style={vars(size, color, speed)}>
      <div className="uib-ripples__inner"><div className="uib-ripples__dot" /></div>
    </div>
  );
}

/** Two pulsing discs: dashboard and empty-state loading. */
export function Pulsar({ size = 40, color = "currentColor", speed = 1.75, className = "" }: BaseProps) {
  return (
    <div className={`uib-pulsar ${className}`} aria-hidden="true" style={vars(size, color, speed)}>
      <div className="uib-pulsar__inner" />
    </div>
  );
}
