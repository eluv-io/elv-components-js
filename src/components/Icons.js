import "../stylesheets/icons.scss";

import InlineSVG from "svg-inline-react";
import React from "react";

export const CroppedIcon = ({icon, title, className, iconClassName}) => {
  return (
    <div className={className || ""}>
      <div className="-elv-cropped-icon">
        <ImageIcon icon={icon} title={title} className={iconClassName || ""} />
      </div>
    </div>
  );
};

export const ImageIcon = ({icon, title, className}) => {
  className = "-elv-icon " + (className || "");

  if(icon.startsWith("<svg")) {
    return (
      <InlineSVG title={title} className={className} src={icon}/>
    );
  } else {
    return (
      <img title={title} className={className} src={icon} />
    );
  }
};

export const IconButton = ({icon, title, onClick, disabled=false, className}) => {
  className = "-elv-icon-button " + (className || "");

  return (
    <button className={className} type="button" role="button" title={title} onClick={onClick} disabled={disabled}>
      <InlineSVG className="-elv-icon" src={icon} />
    </button>
  );
};
