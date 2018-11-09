import React from "react";

export const FormsToggle = props => (
  <Fragment>
  <div className="admin-forms-toggle-div">
    <h3>Select a Form</h3>
    <button className="admin-toggle-btn">Course</button>
    <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleRentalForm}>Rental</button>
    <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleSaleItemForm}>Sale Item</button>
    <button className="admin-toggle-btn admin-toggle-btn-light" onClick={this.toggleUserForm}>User</button>
  </div>
  <div className="admin-form-div">
    <h2>New Course</h2>
    <AddCourseForm />
  </div>
</Fragment>
);