import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
export function ScrollList({
  children,
  label,
  count,
}: {
  children: ReactNode;
  label: string;
  count: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const list = ref.current;
    if (!list || count <= 4) {
      setHeight(undefined);
      return;
    }
    const first = list.children[0] as HTMLElement;
    const fourth = list.children[3] as HTMLElement;
    const measure = () =>
      setHeight(fourth.offsetTop + fourth.offsetHeight - first.offsetTop);
    const observer = new ResizeObserver(measure);
    Array.from(list.children)
      .slice(0, 4)
      .forEach((item) => observer.observe(item));
    measure();
    return () => observer.disconnect();
  }, [count]);
  return (
    <>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={count > 4 ? 0 : undefined}
        className="relative overflow-y-auto overscroll-contain pr-3 [scrollbar-color:#515c87_transparent] [scrollbar-width:thin] focus-visible:outline focus-visible:outline-[#91a0ff]"
        style={{ maxHeight: count > 4 ? (height ?? "44rem") : undefined }}
      >
        {children}
      </div>
      {count > 4 && (
        <p className="mt-3 text-[11px] text-[#9ba3aa]">
          Scroll to view all {count} records.
        </p>
      )}
    </>
  );
}
