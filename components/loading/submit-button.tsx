"use client";

import { useEffect, type ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Ring2 } from "@/components/loaders/uiball";
import { useLagurLoading } from "./loading-provider";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Show the full-screen Lagur loader while the server action runs. Default true. */
  fullScreen?: boolean;
  loadingLabel?: string;
  /** Skip the default green button styles and use only className (for outline or Google buttons). */
  unstyled?: boolean;
};

/**
 * Must be rendered INSIDE a <form action={serverAction}>.
 * While the action runs it shows an inline Ring2 spinner in the button and,
 * optionally, the full-screen Lagur loading screen. Use for sign in, sign up, Google buttons.
 */
export function SubmitButton({ children, fullScreen = true, loadingLabel, unstyled = false, className = "", disabled, ...rest }: Props) {
  const { pending } = useFormStatus();
  const { show, hide } = useLagurLoading();

  useEffect(() => {
    if (!fullScreen) return;
    if (pending) show(loadingLabel);
    else hide();
  }, [pending, fullScreen, loadingLabel, show, hide]);

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={
        unstyled
          ? className
          : `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#19E57A] to-[#00C95F] px-6 font-semibold text-[#101010] shadow-[0_10px_30px_rgba(25,229,122,0.45)] transition disabled:cursor-not-allowed disabled:opacity-70 ${className}`
      }
      {...rest}
    >
      {pending ? (
        <>
          <Ring2 size={18} stroke={3} color="currentColor" speed={0.8} />
          <span>{loadingLabel ?? "Please wait"}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
