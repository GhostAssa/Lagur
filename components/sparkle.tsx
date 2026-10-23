type SparkleIconProps = { className?: string; size?: number; x?: number; y?: number };

export default function SparkleIcon({ className, size = 16, x, y }: SparkleIconProps) {
  return <svg className={className} width={size} height={size} x={x} y={y} viewBox="0 0 16 16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M8 0c1.3 4.7 3.3 6.7 8 8-4.7 1.3-6.7 3.3-8 8C6.7 11.3 4.7 9.3 0 8c4.7-1.3 6.7-3.3 8-8Z" fill="currentColor"/></svg>;
}
