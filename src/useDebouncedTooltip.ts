import { map, filter, debounceTime, mergeMap } from "rxjs/operators";
import { RefObject, useState, useEffect } from "react";
import { fromEvent, BehaviorSubject } from "rxjs";

export const useDebouncedTooltip = (
  containerRef: RefObject<HTMLElement>,
  elementClass: string
) => {
  const [currentElementId, setCurrentElementId] = useState("");
  const [availableTooltipSubject$] = useState(new BehaviorSubject(true));

  useEffect(() => {
    if (containerRef === null || containerRef.current === null) return;

    const mouseOverSubscription = fromEvent(containerRef.current, "mouseover")
      .pipe(
        mergeMap((event) =>
          availableTooltipSubject$.pipe(
            map((availableTooltip) => ({
              event,
              availableTooltip,
            }))
          )
        ),
        debounceTime(1000),
        filter(({ event, availableTooltip }) => {
          const target = event.target as EventTarget & HTMLSpanElement;
          return target?.classList?.contains(elementClass) && availableTooltip;
        }),
        map(({ event }) => {
          const target = event.target as EventTarget & HTMLSpanElement;
          return target.id;
        })
      )
      .subscribe((id) => {
        setCurrentElementId(id);
      });

    const mouseOutSubscription = fromEvent(containerRef?.current, "mouseout")
      .pipe(
        filter((event) => {
          const target = event.target as EventTarget & HTMLSpanElement;
          return target?.classList?.contains(elementClass);
        })
      )
      .subscribe(() => {
        setCurrentElementId("");
      });

    return () => {
      mouseOutSubscription.unsubscribe();
      mouseOverSubscription.unsubscribe();
    };
  }, [containerRef, availableTooltipSubject$, elementClass]);

  useEffect(() => {
    if (containerRef === null || containerRef.current === null) return;

    const mouseLeaveSubscription = fromEvent(
      containerRef?.current,
      "mouseleave"
    )
      .pipe()
      .subscribe((id) => {
        setCurrentElementId("");
        availableTooltipSubject$.next(false);
      });

    const mouseEnterSubscription = fromEvent(
      containerRef?.current,
      "mouseenter"
    ).subscribe(() => {
      availableTooltipSubject$.next(true);
    });

    return () => {
      mouseLeaveSubscription.unsubscribe();
      mouseEnterSubscription.unsubscribe();
    };
  }, [containerRef, availableTooltipSubject$]);

  useEffect(() => {
    return () => {
      availableTooltipSubject$.unsubscribe();
    };
  }, [availableTooltipSubject$]);

  return currentElementId;
};
