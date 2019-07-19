import "../stylesheets/tooltip.scss";

import React from "react";
import PropTypes from "prop-types";
import { render } from "react-dom";

class ToolTip extends React.Component {
  /* Static not yet supported */
  // static toolTip;
  // static owner;

  constructor(props) {
    super(props);

    this.state = {
      hovering: false
    };

    this.MoveToolTip = this.MoveToolTip.bind(this);
  }

  componentDidMount() {
    ToolTip.CreateToolTip();
  }

  componentDidUpdate() {
    if(ToolTip.toolTip) {
      this.ToggleTooltip(this.state.hovering);
    }
  }

  static CreateToolTip() {
    if(ToolTip.toolTip) { return; }

    const newToolTip = document.createElement("div");
    newToolTip.style.position = "absolute";
    newToolTip.className = "-elv-tooltip";
    newToolTip.style.display = "none";
    document.body.appendChild(newToolTip);

    ToolTip.toolTip = newToolTip;
  }

  ToggleTooltip(show) {
    if(!ToolTip.toolTip) { return; }

    if(show && !!this.props.content) {
      ToolTip.toolTip.style.display = "flex";
      ToolTip.owner = this;

      render(
        this.props.content,
        ToolTip.toolTip
      );
    } else {
      if(ToolTip.owner === this) {
        ToolTip.toolTip.style.display = "none";
        ToolTip.owner = undefined;
      }
    }
  }

  MoveToolTip(x, y) {
    if(!ToolTip.toolTip) { return; }

    ToolTip.toolTip.style.left = Math.max(0, x - ToolTip.toolTip.offsetWidth / 2) + "px";
    ToolTip.toolTip.style.top = y + 30 + "px";
  }

  render() {
    return (
      React.cloneElement(
        React.Children.only(this.props.children),
        {
          onMouseEnter: (e) => {
            if(this.props.onMouseEnter) {
              this.props.onMouseEnter(e);
            }
            this.setState({hovering: true});
          },
          onMouseLeave: (e) => {
            if(this.props.onMouseLeave) {
              this.props.onMouseLeave(e);
            }
            this.setState({hovering: false});
          },
          onMouseMove: (e) => {
            if(this.props.onMouseMove) {
              this.props.onMouseMove(e);
            }
            this.MoveToolTip(e.clientX, e.clientY);
          }
        }
      )
    );
  }
}

ToolTip.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  children: PropTypes.node.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseMove: PropTypes.func,
};

export default ToolTip;
