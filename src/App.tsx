import React, { useRef } from "react";
import classes from "./list-item.module.css";
import { useDebouncedTooltip } from "./useDebouncedTooltip";

function App() {
  const listElements = [
    "alpha",
    "beta",
    "gamma",
    "teta",
    "hexa",
    "lambda",
    "ksi",
    "omega",
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const elementClass = "list-item";

  const currentElementId = useDebouncedTooltip(containerRef, elementClass);

  return (
    <div className="App">
      <div>app</div>
      <div className={classes.listItemContainer} ref={containerRef}>
        {listElements.map((element) => (
          <span className={`${classes.listItem} ${elementClass}`} id={element}>
            {element}
            {currentElementId === element && (
              <span className={classes.listItemTooltip}>{element}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
