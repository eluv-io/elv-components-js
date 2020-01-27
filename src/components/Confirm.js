import React from "react";
import {render, unmountComponentAtNode} from "react-dom";
import PropTypes from "prop-types";
import Form from "./Form";
import Modal from "./Modal";

class ConfirmModal extends React.PureComponent {
  render() {
    return (
      <Modal closable={true} OnClickOutside={this.HandleCancel}>
        <Form
          submitText="OK"
          legend="Confirm"
          formContent={<p>{this.props.message}</p>}
          OnSubmit={this.props.onConfirm}
          OnCancel={this.props.onCancel}
        />
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
  ]).isRequired
};

const Confirm = async ({message, onConfirm, onCancel}) => {
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
      <ConfirmModal message={message} onConfirm={HandleConfirm} onCancel={HandleCancel}/>,
      target
    );
  });
};

export default Confirm;
