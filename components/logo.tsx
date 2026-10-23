type LogoProps = { variant?: "dark" | "light"; className?: string };
import SparkleIcon from "./sparkle";

export default function Logo({ variant = "dark", className }: LogoProps) {
  const light = variant === "light";
  return <svg className={className} viewBox="0 0 128 36" role="img" aria-label="Lagur" xmlns="http://www.w3.org/2000/svg">
    <text x="1" y="27" fill={light ? "#FFFFFF" : "#101010"} fontFamily="var(--font-outfit), sans-serif" fontSize="27" fontWeight="800" letterSpacing="-1.6">lagur</text>
    <g color={light ? "#3DFF9A" : "#00A651"} fill={light ? "#3DFF9A" : "#00A651"} filter={light ? "url(#logo-glow)" : undefined}>
      <SparkleIcon x={101} y={1} size={17} /><SparkleIcon x={116} y={2} size={8} />
    </g>
    <defs><filter id="logo-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  </svg>;
}
