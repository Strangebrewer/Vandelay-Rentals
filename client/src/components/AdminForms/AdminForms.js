import React, { Component, Fragment } from "react";
import Modal from "../Elements/Modal";
import { AddCourseForm, AddRentalForm, AddSaleItemForm, AddUserForm, AdminFormsToggle } from "../AdminForms";

export class AdminForms extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    formActive: 'rental',
    forms: {
      addCourse: false,
      addRental: true,
      addSaleItem: false,
      addUser: false,
      addCategory: false
    }
  };

  closeModal = () => {
    this.setState({
      modal: { isOpen: false }
    });
  };

  setModal = (modalInput) => {
    this.setState({
      modal: {
        isOpen: true,
        body: modalInput.body,
        buttons: modalInput.buttons
      }
    });
  };

  outsideClick = event => {
    if (event.target.className === "modal")
      this.closeModal();
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  toggleForms = form => {
    this.setState({ formActive: form });
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
        <div id="admin-forms-container">
          <AdminFormsToggle
            formActive={this.state.formActive}
            toggleForms={this.toggleForms}
          />
        </div>
      </Fragment>
    );
  }
}