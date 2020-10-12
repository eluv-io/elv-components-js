import React from "react";
import {render, unmountComponentAtNode} from "react-dom";
import PropTypes from "prop-types";
import Form from "./Form";
import Modal from "./Modal";

class ConfirmModal extends React.PureComponent {
  constructor(props) {
    super(props);

    let state = {};
    (props.additionalInputs || []).map(({name}) => state[name] = "");

    this.state = state;
  }

  AdditionalInputs() {
    const inputs = (this.props.additionalInputs || []);

    if(inputs.length === 0) { return null; }

    return (
      <div className="form-content">
        {
          inputs.map(({label, name, onChange}) =>
            <React.Fragment key={`confirm-input-${name}`}>
              <label htmlFor={name}>{ label }</label>
              <input
                name={name}
                onChange={event => {
                  this.setState({[name]: event.target.value});
                  onChange(event.target.value);
                }}
                value={this.state[name]}
              />
            </React.Fragment>
          )
        }
      </div>
    );
  }

  render() {
    return (
      <Modal closable={true} OnClickOutside={this.HandleCancel}>
        <Form
          className={this.props.additionalInputs && this.props.additionalInputs.length > 0 ? "confirm-with-inputs" : ""}
          submitText="OK"
          legend="Confirm"
          OnSubmit={this.props.onConfirm}
          OnCancel={this.props.onCancel}
        >
          <p>{this.props.message}</p>
          { this.AdditionalInputs() }
        </Form>
      </Modal>
    );
  }
}

ConfirmModal.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  additionalInputs: PropTypes.array
};

const Confirm = async ({message, onConfirm, onCancel, additionalInputs=[]}) => {
  return await new Promise(resolve => {
    const targetId = "-elv-confirm-target";

    const RemoveModal = () => {
      const target = document.getElementById(targetId);
      unmountComponentAtNode(target);
      target.parentNode.removeChild(target);
    };

    const HandleConfirm = async () => {
      if (onConfirm) {
        await onConfirm();
      }

      RemoveModal();

      resolve(true);
    };

    const HandleCancel = async () => {
      try {
        if (onCancel) {
          await onCancel();
        }
      } finally {
        RemoveModal();

        resolve(false);
      }
    };

    const target = document.createElement("div");
    target.id = targetId;
    document.body.appendChild(target);

    render(
      <ConfirmModal message={message} onConfirm={HandleConfirm} onCancel={HandleCancel} additionalInputs={additionalInputs} />,
      target
    );
  });
};

export default Confirm;
