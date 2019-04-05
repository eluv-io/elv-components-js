import "../stylesheets/icons.scss";

import InlineSVG from "svg-inline-react";
import React from "react";
import Link from "react-router-dom/es/Link";
import {onEnterPressed} from "../utils/Events";

export const CroppedIcon = ({icon, alternateIcon, title, className, iconClassName}) => {
  return (
    <div className={className || ""}>
      <div className="-elv-cropped-icon">
        <ImageIcon icon={icon} alternateIcon={alternateIcon} title={title} className={iconClassName || ""} />
      </div>
    </div>
  );
};

export const CroppedIconWithAction = ({icon, alternateIcon, title, actionText, onClick, className, children}) => {
  return (
    <div
      tabIndex="0"
      title={title}
      aria-label={title}
      onClick={onClick}
      onKeyPress={onEnterPressed(onClick)}
      className={className || ""}
    >
      <div className="-elv-cropped-icon -elv-cropped-icon-with-action">
        <ImageIcon icon={icon} alternateIcon={alternateIcon} title={title} />
        <div className="-elv-hover-action">
          <span>{actionText}</span>
          { children }
        </div>
      </div>
    </div>
  );
};

export const ImageIcon = ({icon, alternateIcon, title, className}) => {
  const [error, setError] = React.useState(false);

  className = "-elv-icon " + (className || "");

  const currentIcon = error ? alternateIcon : icon;
  const handleError = error ? undefined : () => setError(true);

  if(!currentIcon) { return null; }

  if(currentIcon.startsWith("<svg")) {
    return (
      <InlineSVG title={title} alt={title} className={className} src={currentIcon}/>
    );
  } else {
    return (
      <img title={title} alt={title} className={className} src={currentIcon} onError={handleError} />
    );
  }
};

export const IconButton = ({icon, title, onClick, disabled=false, className}) => {
  className = "-elv-icon-button " + (className || "");

  return (
    <button className={className} type="button" role="button" title={title} aria-label={title} onClick={onClick} disabled={disabled}>
      <InlineSVG className="-elv-icon" alt={title} src={icon} />
    </button>
  );
};

export const IconLink = ({icon, title, to, className}) => {
  className = "-elv-icon-link " + (className || "");

  return (
    <Link to={to} title={title} tabIndex={0} className={className}>
      <div className="-elv-icon-wrapper">
        <ImageIcon icon={icon} className={className} title={title}/>
      </div>
    </Link>
  );
};
