import "../stylesheets/inputs.scss";
import "react-datetime/css/react-datetime.css";
require("moment-timezone");

import React, {useState} from "react";
import Action from "./Action";
import BrowseWidget from "./BrowseWidget";
import {IconButton} from "./Icons";
import {Settings} from "luxon";
import AddIcon from "../icons/plus-square.svg";
import RemoveIcon from "../icons/trash.svg";
import * as DatePicker from "react-datetime";
import JsonTextArea from "./JsonInput";

import ClearIcon from "../icons/x-circle.svg";

export const FormatName = (name) => {
  return (name || "")
    .replace("-", " ")
    .split(/[_, \s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const Maybe = (value, component) => value ?
  (typeof component === "function" ? component() : component) :
  null;

export const Warning = ({message}) => {
  return (
    <div className="-elv-input -elv-input-warning">
      <label />
      <div className="warning">{ message }</div>
    </div>
  );
};

export const Input = ({type, label, name, value, readonly=false, onChange, hidden=false, required=false, className=""}) => {
  if(hidden) { return null; }

  return (
    <div className={`-elv-input ${className}`}>
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <input
        required={required}
        name={name}
        value={value}
        readOnly={readonly}
        onChange={event => {
          let input = event.target.value.toString();

          if(type === "integer") {
            input = input.replace(/[^0-9]/g, "");
          } else if(type === "number") {
            input = input.replace(/[^0-9.]/g, "").replace(/\.{2,}/g, ".");
          }

          onChange(input);
        }}
      />
    </div>
  );
};

export const ColorSelection = ({label, name, value, readonly=false, onChange, hidden=false, className=""}) => {
  if(hidden) { return null; }

  return (
    <div className={`-elv-input ${className}`}>
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <input
        name={name}
        value={value}
        readOnly={readonly}
        type="color"
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
};

export const Checkbox = ({label, name, value, readonly=false, onChange, className="", disabled=false}) => {
  return (
    <div className={`-elv-input -elv-checkbox-input ${className}`}>
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <div className="checkbox-container">
        <input
          disabled={disabled}
          name={name}
          type="checkbox"
          checked={!!value}
          readOnly={readonly}
          onChange={event => {
            onChange(event.target.checked);
          }}
        />
      </div>
    </div>
  );
};

export const TextArea = ({label, name, value, onChange, className="", json=false}) => {
  return (
    <div className={`-elv-input -elv-textarea ${className}`}>
      <label htmlFor={name}>{label || FormatName(name)}</label>
      { json ?
        <JsonTextArea
          name={name}
          value={value}
          onChange={event => onChange(event.target.value)}
        /> :
        <textarea
          name={name}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      }
    </div>
  );
};

export const Selection = ({label, name, value, onChange, options, className=""}) => {
  return (
    <div className={`-elv-input -elv-select ${className}`}>
      <label htmlFor={name}>{label || FormatName(name)}</label>
      <select
        name={name}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {options.map(option => {
          let name = option;
          let value = option;
          if(Array.isArray(option)) {
            name = option[0];
            value = option[1];
          }

          return <option value={value} key={`asset-info-${name}-${value}`}>{name}</option>;
        })}
      </select>
    </div>
  );
};

export const MultiSelect = ({label, name, values, onChange, options, className=""}) => {
  values = values || [];

  const Update = (index, event) => {
    let newValues = [...values];
    newValues[index] = event.target.value;

    onChange(newValues);
  };

  const Add = () => {
    let newValues = [...values];
    const next = options.find(option => !newValues.includes(option)) || options[0];
    newValues.push(next);

    onChange(newValues);
  };

  const Remove = (index) => {
    let newValues = [...values];

    newValues =
      newValues.filter((_, i) => i !== index);

    onChange(newValues);
  };

  return (
    <div className={`-elv-input -elv-multi-select ${className}`}>
      <label htmlFor={name}>
        {label || FormatName(name)}
      </label>
      <div>
        {(values || []).map((selected, index) =>
          <div className="-elv-multi-select-selections" key={`-elv-multi-select-${name}-${index}`}>
            <select
              name={name}
              value={selected}
              onChange={event => Update(index, event)}
            >
              {options.map(option  =>
                <option value={option} key={`-elv-${name}-${option}-${index}`}>{option}</option>
              )}
            </select>

            <IconButton
              icon={RemoveIcon}
              label={`Remove ${name}`}
              onClick={() => Remove(index)}
            />
          </div>
        )}
        <IconButton
          icon={AddIcon}
          label={`Add ${name}`}
          onClick={() => Add()}
          className="-elv-multi-select-add"
        />
      </div>
    </div>
  );
};

export const DateSelection = ({
  noLabel=false,
  label,
  name,
  value,
  dateOnly=false,
  readOnly=false,
  clearable=true,
  includeOffset=false,
  onChange,
  referenceTimezone,
  useDefaultReferenceTimezone=true,
  className=""
}) => {
  let debounceTimeout;
  return (
    <div className={`-elv-input -elv-date-input ${noLabel ? "-elv-date-input-no-label" : ""} ${className}`}>
      { noLabel ? null : <label htmlFor={name}>{label || FormatName(name)}</label> }
      <div className="-elv-date-container">
        <DatePicker
          value={value}
          input
          inputProps={{readOnly}}
          strictParsing
          timeFormat={dateOnly ? false : `HH:mm:ss z${includeOffset ? "(Z)" : ""}`}
          dateFormat={"YYYY-MM-DD"}
          displayTimeZone={referenceTimezone || (useDefaultReferenceTimezone ? Settings.defaultZoneName || "" : "")}
          onChange={datetime => {
            if(parseInt(datetime.valueOf()) === datetime.valueOf()) {
              clearTimeout(debounceTimeout);
              debounceTimeout = setTimeout(() => onChange(datetime.valueOf()), 500);
            }
          }}
        />
        { clearable ?
          <IconButton
            className="-elv-date-clear"
            label="Clear"
            icon={ClearIcon}
            onClick={() => onChange("")}
          />
          : null}
      </div>
    </div>
  );
};

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

export const FileBrowser = ({name, header, accept, multiple=false, directories=false, onChange, className=""}) => {
  return (
    <div className={`-elv-input -elv-file-browser-input ${className}`}>
      <label htmlFor="schedule">Upload schedule from file</label>
      <BrowseWidget
        name={name}
        header={header}
        accept={accept}
        multiple={multiple}
        directories={directories}
        onChange={onChange}
      />
    </div>
  );
};

export const LabelledField = ({label, value, hidden=false, formatLabel=false, children, className=""}) => {
  if(hidden) { return null; }

  return (
    <div className={`-elv-input -elv-labelled-field ${className}`}>
      <label>{ formatLabel ? FormatName(label) : label }</label>
      <div title={typeof value === "object" ? "" : value}>{ children || value }</div>
    </div>
  );
};
