import "../stylesheets/forms.scss";

import React from "react";
import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";
import Action from "./Action";
import LoadingElement from "./LoadingElement";

class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cancel: false,
      loading: false,
      completed: false,
      error: false,
      errorMessage: ""
    };

    this.HandleSubmit = this.HandleSubmit.bind(this);
    this.HandleCancel = this.HandleCancel.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async HandleSubmit(event) {
    event.preventDefault();

    if(this.state.loading) { return; }

    this.setState({
      loading: true,
      completed: false,
      error: false,
      errorMessage: ""
    });

    try {
      await this.props.OnSubmit(event);

      if(this.mounted) {
        this.setState({loading: false});
      }

      if(this.props.OnComplete) {
        await this.props.OnComplete();
      }

      if(this.mounted) {
        this.setState({completed: true});
      }
    } catch(error) {
      const errorMessage = typeof error === "object" ?
        error.errorMessage || error.message : error;

      // eslint-disable-next-line no-console
      console.error(error);

      this.setState({
        loading: false,
        completed: false,
        error: true,
        errorMessage: errorMessage.trim()
      });

      if(this.props.OnError) {
        await this.props.OnError(error);
      }
    }
  }

  HandleCancel() {
    if(this.props.OnCancel) {
      this.props.OnCancel();
    }

    if(this.props.cancelPath) {
      this.setState({
        cancel: true
      });
    }
  }

  ErrorMessage() {
    if(!this.state.error || !this.state.errorMessage) { return null; }

    return (
      <div className="form-error">
        <pre>{this.state.errorMessage}</pre>
      </div>
    );
  }

  Actions() {
    let cancelButton;
    if(this.props.OnCancel || this.props.cancelPath) {
      cancelButton = (
        <Action className="secondary" type="button" onClick={this.HandleCancel}>
          {this.props.cancelText || "Cancel"}
        </Action>
      );
    }

    return (
      <div className="form-actions">
        <LoadingElement loading={this.state.loading}>
          { cancelButton }
          <Action type="submit">{this.props.submitText || "Submit"}</Action>
        </LoadingElement>
      </div>
    );
  }

  render() {
    if(this.state.completed && this.props.redirectPath) {
      return (
        <Redirect push to={ this.props.redirectPath } />
      );
    } else if(this.state.cancel) {
      return (
        <Redirect push to={ this.props.cancelPath } />
      );
    }

    return (
      <form onSubmit={this.HandleSubmit} className={`${this.props.className || ""} -elv-form`}>
        <fieldset>
          <legend>{this.props.legend}</legend>
          { this.ErrorMessage() }
          { this.props.children || this.props.formContent }
          { this.Actions() }
        </fieldset>
      </form>
    );
  }
}

Form.propTypes = {
  children: PropTypes.node,
  formContent: PropTypes.node,
  legend: PropTypes.string,
  redirectPath: PropTypes.string,
  cancelPath: PropTypes.string,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  OnSubmit: PropTypes.func.isRequired,
  OnCancel: PropTypes.func,
  OnComplete: PropTypes.func,
  OnError: PropTypes.func,
  className: PropTypes.string
};

export default Form;
