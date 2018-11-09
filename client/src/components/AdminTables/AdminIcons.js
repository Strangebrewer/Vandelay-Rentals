import React from "react";

export const AdminIcons = props => (
  <div className="table-icon-div">
    <div className="fa-sync-div table-icon-inner-div">
      <i onClick={() => props.updateRow(props.row)} className="table-icon fas fa-save fa-lg"></i>
      <span className="fa-sync-tooltip table-tooltip">save changes</span>
    </div>
    <div className="fa-trash-alt-div table-icon-inner-div">
      <i onClick={() => props.deleteModal(props.row)} className="table-icon fas fa-trash-alt fa-lg"></i>
      <span className="fa-trash-alt-tooltip table-tooltip">delete {props.tooltip}</span>
    </div>
    <div className="fa-sticky-note-div table-icon-inner-div">
      <i onClick={() => props.noteModal(props.row)} className="table-icon far fa-sticky-note fa-lg"></i>
      <span className="fa-sticky-note-tooltip table-tooltip">see/edit notes</span>
    </div>
  </div>
);