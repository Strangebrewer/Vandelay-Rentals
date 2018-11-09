import React from "react";
import { AddCourseForm, AddRentalForm, AddSaleItemForm, AddUserForm } from "../AdminForms";

export const AdminFormsToggle = props => {
  let course = props.formActive === 'course';
  let rental = props.formActive === 'rental';
  let sale = props.formActive === 'sale';
  let user = props.formActive === 'user';

  return (
    <React.Fragment>
      <div className="admin-forms-toggle-div">
        <h3>Select a Form</h3>
        <button
          className={`admin-toggle-btn${!course ? ' admin-toggle-btn-light' : ''}`}
          onClick={!course ? () => props.toggleForms('course') : null}>Course</button>
        <button
          className={`admin-toggle-btn${!rental ? ' admin-toggle-btn-light' : ''}`}
          onClick={!rental ? () => props.toggleForms('rental') : null}>Rental</button>
        <button
          className={`admin-toggle-btn${!sale ? ' admin-toggle-btn-light' : ''}`}
          onClick={!sale ? () => props.toggleForms('sale') : null}>Sale Item</button>
        <button
          className={`admin-toggle-btn${!user ? ' admin-toggle-btn-light' : ''}`}
          onClick={!user ? () => props.toggleForms('user') : null}>User</button>
      </div>
      <div className="admin-form-div">
        {course && <AddCourseForm />}
        {rental && <AddRentalForm />}
        {sale && <AddSaleItemForm />}
        {user && <AddUserForm />}
      </div>
    </React.Fragment>
  )

};