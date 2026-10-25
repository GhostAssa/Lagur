import BlurText from "@/components/react-bits/BlurText";
import { BLUR_DEFAULTS } from "@/lib/motion";

/**
 * Visual heading with the React Bits BlurText reveal. A real, screen-reader-only heading
 * keeps SEO and accessibility intact (BlurText renders a <p>, so it is aria-hidden).
 */
export function RevealHeading({
  text, level = 2, className = "",
}: { text: string; level?: 1 | 2 | 3; className?: string }) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  return (
    <>
      <Tag className="sr-only">{text}</Tag>
      <div aria-hidden="true" className={`font-heading font-normal ${className}`}>
        <BlurText text={text} {...BLUR_DEFAULTS} />
      </div>
    </>
  );
}
