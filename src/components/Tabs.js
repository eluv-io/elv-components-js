import "../stylesheets/tabs.scss";

import React from "react";
import PropTypes from "prop-types";

const Tabs = ({options, selected, onChange, className=""}) => {
  const tabs = options.map(([label, value]) => {
    return (
      <li
        tabIndex={0}
        className={
          "-elv-tab " + className +
          (selected === value ? " selected" : "")
        }
        onClick={() => onChange(value)}
        onKeyPress={() => onChange(value)}
        key={"-elv-tab-" + value}
      >
        { label }
      </li>
    );
  });

  return (
    <ul className={"-elv-tab-container " + className}>
      { tabs }
    </ul>
  );
};

Tabs.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
      ])
    )).isRequired,
  selected: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default Tabs;
