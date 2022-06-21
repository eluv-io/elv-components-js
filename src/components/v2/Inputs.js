import React, {useState} from "react";
import Action from "../Action";

export const ToggleSection = ({sectionName, showInitially=false, children, className=""}) => {
  const [show, setShow] = useState(showInitially);

  const toggleButton = (
    <Action className="toggle-section-button secondary" onClick={() => setShow(!show)}>
      { show ? `Hide ${sectionName}` : `Show ${sectionName}`}
    </Action>
  );

  return (
    <div className={`toggle-section toggle-section-${show ? "show" : "hide"} ${className}`}>
      { toggleButton }

      { show ? <div className="toggle-section-content">{ children }</div> : null }
    </div>
  );
};
