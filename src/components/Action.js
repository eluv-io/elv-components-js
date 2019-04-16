import "../stylesheets/buttons.scss";

import React from "react";
import PropTypes from "prop-types";
import Link from "react-router-dom/es/Link";

const Action = ({label, type, to, onClick, className, disabled=false, children, button=true}) => {
  className = className || "";
  if(button) { className = className + " -elv-button"; }

  const content = children;

  if(!type) { type = "button"; }

  if(type === "link") {
    return (
      <Link
        to={to}
        aria-label={label}
        tabIndex={0}
        className={className}
      >
        { content }
      </Link>
    );
  } else {
    // Button
    return (
      <button
        aria-label={label}
        tabIndex={0}
        type={type}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        { content }
      </button>
    );
  }
};

Action.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  to: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default Action;
