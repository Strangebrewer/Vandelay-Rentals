import React, { Component } from "react";
import "./ImageModal.css";

const ImageModal = props => (
  <React.Fragment>
    {props.show
      ? (
        <div id="image-modal" className="image-modal" onClick={props.outsideClick}>
          <div className="image-modal-content">
            <div className="image-modal-header">
              <span className="image-modal-close" onClick={props.toggleImageModal}>&times;</span>
            </div>
            <div className="image-modal-body">
              {props.body}
            </div>
            <div className="image-modal-footer"></div>
          </div>
        </div>
      ) : null}
  </React.Fragment>
)

export default ImageModal;