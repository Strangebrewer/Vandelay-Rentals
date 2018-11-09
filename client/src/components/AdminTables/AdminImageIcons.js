import React from "react";

export const AdminImageIcons = props => (
  <div className="table-icon-div">
    <div className="fa-upload-div table-icon-inner-div">
      <i onClick={() => props.uploadModal(props.row)} className="table-icon fas fa-upload fa-lg"></i>
      <span className="fa-upload-tooltip table-tooltip">upload images</span>
    </div>
    <div className="fa-images-div table-icon-inner-div">
      <i onClick={() => props.getNames(props.row)} className="table-icon fas fa-images fa-lg"></i>
      <span className="fa-images-tooltip table-tooltip">see images</span>
    </div>
  </div>
);