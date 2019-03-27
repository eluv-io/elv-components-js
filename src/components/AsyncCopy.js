import React from "react";
import {CopyText} from "../utils/Clipboard";

// A simple widget to allow for copying text to clipboard that is loaded asynchronously
class AsyncCopy extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {text: ""};
  }

  render() {
    return (
      <span
        onMouseEnter={async () => {
          if(!this.state.text) {
            this.setState({text: await this.props.Load()});
          }
        }}
        onClick={() => CopyText(this.state.text)}
      >
        {this.props.children}
      </span>
    );
  }
}

export default AsyncCopy;
