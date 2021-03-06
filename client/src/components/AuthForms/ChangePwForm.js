import React, { Component, Fragment } from "react";
import { Input, FormBtn } from "../Elements/Form";
import Modal from "../../components/Elements/Modal";
import API from "../../utils/API";

export class ChangePwForm extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    changeAttempts: 0
  }

  closeModal = () => {
    this.setState({
      modal: { isOpen: false }
    });
  }

  setModal = (modalInput) => {
    this.setState({
      modal: {
        isOpen: true,
        body: modalInput.body,
        buttons: modalInput.buttons
      }
    });
  }

  outsideClick = event => {
    if (event.target.className === "modal")
      this.closeModal();
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    API.changePassword({
      currentPassword: this.state.currentPassword,
      newPassword: this.state.newPassword
    })
      .then(res => {
        if (res.data.message === "incorrect") {
          this.setModal({
            body: <h4>Current password does not match our records.</h4>,
            buttons: <button onClick={this.closeModal}>Try Again</button>
          });
        }
        else if (res.data.message === "too many attempts") {
          this.props.badLogout();
        } else {
          this.setModal({
            body: <h4>Your password has been changed.</h4>,
            buttons: <button onClick={this.closeModal}>Continue</button>
          })
        }
      })
  }

  render() {
    return (
      <Fragment>
        <Modal
          show={this.state.modal.isOpen}
          closeModal={this.closeModal}
          body={this.state.modal.body}
          buttons={this.state.modal.buttons}
          outsideClick={this.outsideClick}
        />
        <form>
          <h3>Change Password</h3>
          <Input
            value={this.state.currentPassword}
            onChange={this.handleInputChange}
            name="currentPassword"
            type="password"
            label="Current Password:"
          />
          <Input
            value={this.state.newPassword}
            onChange={this.handleInputChange}
            name="newPassword"
            pattern="^[\S]{4,}$"
            type="password"
            label="New Password:"
          />
          <Input
            value={this.state.confirmPassword}
            onChange={this.handleInputChange}
            name="confirmPassword"
            pattern={this.state.newPassword}
            type="password"
            label="Confirm New Password:"
          />
          <FormBtn
            disabled={(
              !this.state.currentPassword ||
              !this.state.newPassword ||
              !this.state.confirmPassword
            ) || (this.state.newPassword !== this.state.confirmPassword)}
            onClick={this.handleFormSubmit}
          >
            Submit
        </FormBtn>
        </form>
      </Fragment>
    )
  }

}