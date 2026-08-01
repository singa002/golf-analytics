import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  createLiquidButton,
  type LiquidButtonEventMap,
  type LiquidButtonHandle,
  type LiquidButtonOptions,
} from "@avenra/liquid-glass";
import "@avenra/liquid-glass/styles";

type LiquidButtonEvents = {
  [K in keyof LiquidButtonEventMap]?: (event: LiquidButtonEventMap[K]) => void;
};

export interface LiquidButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label: string;
  options?: LiquidButtonOptions;
  events?: LiquidButtonEvents;
  /**
   * Leading content (icon, avatar). Rendered into a portal mount the library
   * does not own, so React never fights injected `.lg-inner` / SVG filter nodes.
   */
  children?: ReactNode;
}

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ label, options, events, children, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const handleRef = useRef<LiquidButtonHandle | null>(null);
    const leadingRootRef = useRef<Root | null>(null);
    const childrenRef = useRef(children);
    childrenRef.current = children;

    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

    useEffect(() => {
      const el = buttonRef.current;
      if (!el) return;

      handleRef.current = createLiquidButton(el, {
        label,
        glassThickness: 100,
        bezelWidth: 12,
        refractiveIndex: 1.5,
        profile: "convexSquircle",
        ...options,
      });

      if (childrenRef.current != null) {
        const mount = document.createElement("span");
        mount.className = "lg-nav-leading";
        mount.style.cssText =
          "position:relative;z-index:5;display:inline-flex;align-items:center;justify-content:center;";
        const labelSpan = el.querySelector(".lg-button-text");
        el.insertBefore(mount, labelSpan);
        leadingRootRef.current = createRoot(mount);
        leadingRootRef.current.render(<>{childrenRef.current}</>);
      }

      return () => {
        leadingRootRef.current?.unmount();
        leadingRootRef.current = null;
        handleRef.current?.destroy();
        handleRef.current = null;
      };
      // One-shot mount — options applied at init only (library rebuilds via ResizeObserver).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      handleRef.current?.setLabel(label);
    }, [label]);

    useEffect(() => {
      leadingRootRef.current?.render(<>{children}</>);
    }, [children]);

    useEffect(() => {
      if (!handleRef.current || !events) return;
      (Object.keys(events) as (keyof LiquidButtonEventMap)[]).forEach((event) => {
        const handler = events[event];
        if (handler) {
          handleRef.current?.on(
            event,
            handler as (e: LiquidButtonEventMap[typeof event]) => void,
          );
        }
      });

      return () => {
        if (!handleRef.current || !events) return;
        (Object.keys(events) as (keyof LiquidButtonEventMap)[]).forEach((event) => {
          handleRef.current?.off?.(event);
        });
      };
    }, [events]);

    // Intentionally empty — label/icon are mounted imperatively so React does not
    // reconcile against library-injected glass layers.
    return <button ref={buttonRef} type="button" {...props} />;
  },
);

LiquidButton.displayName = "LiquidButton";
