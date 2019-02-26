import React from "react";
import {BallClipRotate, BallPulse} from "./AnimatedIcons";
import PropTypes from "prop-types";

class LoadingElement extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // Loading state can either be indicated by "loading" boolean or by observing a request
    let loading = this.props.loading;

    if(loading) {
      if(this.props.noIndicator) { return null; }

      const loadingIcon = this.props.loadingIcon === "rotate" ? <BallClipRotate/> : <BallPulse/>;
      let className = "-loading-element "  + (this.props.loadingClassname || "");
      if(this.props.fullPage) { className += "loading-page-container"; }

      return (
        <div className={className}>
          { loadingIcon }
        </div>
      );
    } else {
      if(this.props.render) {
        return this.props.render();
      } else {
        return this.props.children;
      }
    }
  }
}

LoadingElement.propTypes = {
  fullPage: PropTypes.bool,
  loading: PropTypes.bool,
  render: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  noIndicator: PropTypes.bool,
  loadingClassname: PropTypes.string,
  loadingIcon: PropTypes.string
};

export default LoadingElement;
