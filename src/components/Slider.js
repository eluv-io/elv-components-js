import "../stylesheets/slider.scss";

import React from "react";
import PropTypes from "prop-types";
import ResizeObserver from "resize-observer-polyfill";
import ToolTip from "./Tooltip";

export class Range extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderElement: undefined,
      hoverPosition: props.min,
      hoverHandle: undefined,
      draggingHandle: undefined,
      width: 0
    };

    this.WatchResize = this.WatchResize.bind(this);
    this.ToolTip = this.ToolTip.bind(this);
    this.Handle = this.Handle.bind(this);
    this.HandleChange = this.HandleChange.bind(this);
    this.StartMouseover = this.StartMouseover.bind(this);
    this.MouseoverMove = this.MouseoverMove.bind(this);
    this.EndMouseover = this.EndMouseover.bind(this);
    this.StartDrag = this.StartDrag.bind(this);
    this.Drag = this.Drag.bind(this);
    this.EndDrag = this.EndDrag.bind(this);
  }

  componentWillUnmount() {
    if(this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  // Ensure slider width is updated on resize
  WatchResize(element) {
    if(element && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        this.setState({
          width: Math.ceil(this.state.sliderElement.offsetWidth || 0),
          containerWidth: Math.ceil(entries[0].target.offsetWidth || 0)
        });
      });

      this.resizeObserver.observe(element);
    }
  }

  /* Behavior */

  /* Hover tooltip */
  StartMouseover() {
    window.addEventListener("mousemove", this.MouseoverMove);
  }

  MouseoverMove(event) {
    clearTimeout(this.tooltipTimeout);

    this.tooltipTimeout = setTimeout(() => this.setState({hoverPosition: this.ClientXToPosition(event.clientX)}), 10);
  }

  EndMouseover() {
    window.removeEventListener("mousemove", this.MouseoverMove);
  }

  /* Dragging */
  StartDrag(event, handleIndex) {
    event.stopPropagation();

    if(!event.shiftKey) {
      event = {...event};

      this.setState({
        draggingHandle: typeof handleIndex === "undefined" ? this.ClosestHandleIndex(event) : handleIndex,
      }, () => this.HandleChange(event));
    }

    window.addEventListener("mousemove", this.Drag);
    window.addEventListener("mouseup", this.EndDrag);
  }

  Drag(event) {
    clearTimeout(this.dragTimeout);

    this.dragTimeout = setTimeout(() => this.HandleChange(event), 10);
  }

  EndDrag() {
    this.setState({
      draggingHandle: undefined
    });

    window.removeEventListener("mousemove", this.Drag);
    window.removeEventListener("mouseup", this.EndDrag);
  }

  HandleChange(event) {
    if(!this.props.onChange) { return; }

    let value = this.ClientXToPosition(event.clientX);
    if(this.props.handles.length === 1) {
      // Slider - only one handle
      this.props.onChange(value);
    } else if(event.shiftKey) {
      // Dragging whole range
      if(event.type !== "mousemove") { return; }

      const diff = event.movementX * this.Scale() / 1000;

      this.props.onChange(this.props.handles.map(handle =>
        Math.min(this.props.max, Math.max(this.props.min, handle.position + diff))
      ));
    } else {
      if(typeof this.state.draggingHandle === "undefined") { return; }
      // Range - multiple handles
      // Drag handles
      let values = this.props.handles.map(handle => handle.position);
      const handleIndex = this.state.draggingHandle;

      values[handleIndex] = value;

      this.props.onChange(values);
    }
  }

  /* Positioning */

  // Get handle closest to pointer
  ClosestHandleIndex(event) {
    const position = this.ClientXToPosition(event.clientX);
    let handleIndex = 0;
    let closestHandle = this.props.max * 2;

    this.props.handles.forEach((handle, i) => {
      const distance = Math.abs(handle.position - position);
      if(distance < closestHandle && !handle.disabled && !handle.handleControlOnly) {
        closestHandle = distance;
        handleIndex = i;
      }
    });

    return handleIndex;
  }

  ClientXToPosition(clientX) {
    const left = this.state.sliderElement.getBoundingClientRect().left;
    const position = (this.Scale() * ((clientX - left) / this.state.width)) + this.props.min;

    return Math.min(Math.max(this.props.min, position), this.props.max);
  }

  Scale() {
    return this.props.max - this.props.min;
  }

  PositionToPixels(position) {
    const pixels = (position - this.props.min) * (this.state.width / this.Scale());

    const result = Math.min(Math.max(0, pixels), this.state.width);

    return isNaN(result) ? 0 : result;
  }

  /* Elements */

  ToolTip(position, markNumber) {
    if(position === undefined) { position = this.state.hoverPosition; }

    if(
      typeof markNumber === "undefined" &&
      (typeof this.state.hoverHandle !== "undefined" || typeof this.state.draggingHandle !== "undefined")
    ) {
      const handle = this.props.handles[this.state.hoverHandle || this.state.draggingHandle];

      if(handle && handle.toolTip) {
        return handle.toolTip;
      }
    }

    return this.props.renderToolTip ? this.props.renderToolTip(position, markNumber) : <span>{position}</span>;
  }

  ActiveTrack() {
    const positions = this.props.handles.map(handle => handle.position);
    const min = positions.length === 1 ? this.props.min : positions[0];
    const max = positions[Math.max(0, positions.length - 1)];

    return (
      <div
        style={{
          left: this.PositionToPixels(min),
          right: Math.ceil(this.state.width - this.PositionToPixels(max))
        }}
        data-slider-active={true}
        className="-elv-slider-active"
      />
    );
  }

  Handle(handle, i) {
    if(handle.position < this.props.min || handle.position > this.props.max) { return null; }

    const dragging = this.state.draggingHandle === i;

    let styleClassName = "-elv-slider-handle-line";
    if(this.props.handleStyle === "circle" || handle.style === "circle") {
      styleClassName = "-elv-slider-handle-circle";
    } else if(this.props.handleStyle === "arrow" || handle.style === "arrow") {
      styleClassName = "-elv-slider-handle-arrow";
    }

    return (
      <ToolTip key={`-elv-slider-handle-${i}`} content={handle.toolTip ? handle.toolTip : this.ToolTip()}>
        <div
          style={{left: `${this.PositionToPixels(handle.position)}px`}}
          className={`-elv-slider-handle ${styleClassName} ${handle.disabled ? "-elv-slider-handle-disabled" : ""} ${dragging ? "-elv-slider-handle-active" : ""} ${handle.className || ""}`}
          onMouseDown={handle.disabled ? undefined : event => this.StartDrag(event, i)}
          onMouseUp={handle.disabled ? undefined : this.EndDrag}
          onClick={handle.disabled ? undefined : this.HandleChange}
          onMouseEnter={() => this.setState({hoverHandle: i})}
          onMouseLeave={() => this.setState({hoverHandle: undefined})}
          {...(handle.additionalProps || {})}
        >
          { this.props.handleStyle === "arrow" || handle.style === "arrow" ? "▼" : null }
        </div>
      </ToolTip>
    );
  }

  Marks({notches=true, text=true}) {
    if(!this.props.showMarks) { return null; }

    const nMarks = this.props.marks || 10;
    const scaleInterval = (this.props.max - this.props.min) / nMarks;
    const scaleOffset = scaleInterval / 2;
    const widthInterval = this.state.width / nMarks;
    const widthOffset = widthInterval / 2;
    let marks = [];

    const markTextEvery = this.props.markTextEvery || 1;

    for(let i = 0; i < nMarks; i++) {
      const scalePosition = this.props.min + (scaleInterval * i + scaleOffset);
      const passed = (this.props.handles[0] || {}).position > scalePosition;
      const majorMark = (Math.ceil(i + markTextEvery / 2)) % markTextEvery === 0;

      marks.push(
        <div
          style={{left: widthInterval * i + widthOffset }} key={`-elv-slider-mark-${i}`}
          className={`-elv-slider-mark ${passed ? "-elv-slider-mark-passed" : ""}`}
        >
          { notches ? <div className={`-elv-slider-mark-notch ${majorMark ? "-elv-slider-mark-notch-major" : ""}`} /> : null }
          { text && majorMark ?
            <div className="-elv-slider-mark-text">
              { this.ToolTip(scalePosition, i) }
            </div> : null
          }
        </div>
      );
    }

    return (
      <div className="-elv-slider-marks-container">
        { marks }
      </div>
    );
  }

  Slider() {
    return (
      <div
        onMouseEnter={this.StartMouseover}
        onMouseLeave={this.EndMouseover}
        ref={(sliderElement) => {
          if(!this.state.sliderElement) {
            this.setState({sliderElement});
          }
        }}
        className="-elv-slider"
      >
        { this.props.topMarks ? this.Marks({text: true, notches: false}) : null }
        <div
          onMouseDown={this.props.handleControlOnly ? undefined : this.StartDrag}
          onMouseUp={this.props.handleControlOnly ? null : this.EndDrag}
          onClick={this.props.handleControlOnly ? null : this.HandleChange}
          className="-elv-slider-overlay"
        >
          { this.ActiveTrack() }
          { this.props.handles.map(this.Handle) }
          <ToolTip content={this.ToolTip()}>
            <div className="-elv-slider-tooltip-overlay" />
          </ToolTip>
        </div>
        { this.Marks({notches: true, text: !this.props.topMarks}) }
      </div>
    );
  }

  render() {
    return (
      <div
        ref={this.WatchResize}
        className={`
          -elv-slider-container
          ${typeof this.state.draggingHandle !== "undefined" ? "-elv-slider-container-dragging" : ""}
          ${this.props.showMarks ? "-elv-slider-with-marks" : ""}
          ${this.props.topMarks ? "-elv-slider-top-marks" : ""}
          ${this.props.className || ""}
        `}
      >
        { this.Slider() }
      </div>
    );
  }
}

export const Slider = ({...props}) => {
  const sliderProps = {...props};

  // Convert single value into a handle
  sliderProps.handles = [{
    position: props.value,
    className: props.handleClassName || ""
  }];
  delete sliderProps.value;
  delete sliderProps.handleClassName;

  return (
    <Range
      {...sliderProps}
    />
  );
};

const commonPropTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  showMarks: PropTypes.bool,
  marks: PropTypes.number,
  markTextEvery: PropTypes.number,
  topMarks: PropTypes.bool,
  onChange: PropTypes.func,
  renderToolTip: PropTypes.func,
  handleStyle: PropTypes.string,
  handleControlOnly: PropTypes.bool
};

Range.propTypes = {
  ...commonPropTypes,
  handles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Slider.propTypes = {
  ...commonPropTypes,
  value: PropTypes.number.isRequired,
  handleClassName: PropTypes.string
};
