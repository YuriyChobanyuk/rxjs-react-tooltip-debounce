import { map, filter, debounceTime, takeUntil, tap } from "rxjs/operators";
import { RefObject, useState, useEffect } from "react";
import { fromEvent, Subject } from "rxjs";

export const useDebouncedTooltip = (
  containerRef: RefObject<HTMLElement>,
  elementClass: string
) => {
  const [currentElementId, setCurrentElementId] = useState("");

  useEffect(() => {
    if (containerRef === null || containerRef.current === null) return;
    let availableTooltip = false;
    const destroy$ = new Subject();

    fromEvent(containerRef.current, "mouseover")
      .pipe(
        tap(() => {
          availableTooltip = true;
        }),
        debounceTime(1000),
        filter((event) => {
          const target = event.target as EventTarget & HTMLSpanElement;
          return target?.classList?.contains(elementClass) && availableTooltip;
        }),
        map((event) => {
          const target = event.target as EventTarget & HTMLSpanElement;
          return target.id;
        }),
        takeUntil(destroy$)
      )
      .subscribe((id) => {
        setCurrentElementId(id);
      });

    fromEvent(containerRef?.current, "mouseout")
      .pipe(
        filter((event) => {
          const target = event.target as EventTarget & HTMLSpanElement;
          return target?.classList?.contains(elementClass);
        }),
        takeUntil(destroy$)
      )
      .subscribe(() => {
        availableTooltip = false;
        setCurrentElementId("");
      });

    return () => {
      destroy$.next(true);
    };
  }, [containerRef, elementClass]);

  return currentElementId;
};
