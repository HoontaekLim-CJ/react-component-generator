import { useEffect, useRef, useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const sameBox = (a: Box | null, b: Box | null) =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h);

export function LivePreview({ code }: LivePreviewProps) {
  const drawingRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  // 렌더된 컴포넌트의 실제 크기를 재서 치수선으로 표시한다.
  useEffect(() => {
    const drawing = drawingRef.current;
    const stage = stageRef.current;
    if (!drawing || !stage) return;

    let target: Element | null = null;

    const measure = () => {
      const el = stage.firstElementChild?.firstElementChild ?? null;
      if (el !== target) {
        if (target) resize.unobserve(target);
        target = el;
        if (el) resize.observe(el);
      }
      if (!el) {
        setBox(null);
        return;
      }
      const d = drawing.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const next =
        r.width > 0 && r.height > 0
          ? {
              x: Math.round(r.left - d.left + drawing.scrollLeft),
              y: Math.round(r.top - d.top + drawing.scrollTop),
              w: Math.round(r.width),
              h: Math.round(r.height),
            }
          : null;
      setBox((prev) => (sameBox(prev, next) ? prev : next));
    };

    const resize = new ResizeObserver(measure);
    resize.observe(drawing);
    const mutation = new MutationObserver(measure);
    mutation.observe(stage, { childList: true, subtree: true });
    measure();

    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  return (
    <LiveProvider code={code} noInline>
      <div className="drawing" ref={drawingRef}>
        <div className="drawing-stage" ref={stageRef}>
          <ReactLivePreview />
        </div>
        {box && (
          <div className="dimensions" aria-hidden="true">
            <div
              className="dim dim--h"
              style={{ left: box.x, top: box.y - 26, width: box.w }}
            >
              <span>{box.w}</span>
            </div>
            <div
              className="dim dim--v"
              style={{ left: box.x + box.w + 18, top: box.y, height: box.h }}
            >
              <span>{box.h}</span>
            </div>
          </div>
        )}
        {box && (
          <p className="visually-hidden">
            렌더링 크기 가로 {box.w}px, 세로 {box.h}px
          </p>
        )}
      </div>
      <LiveError className="preview-error" />
    </LiveProvider>
  );
}
