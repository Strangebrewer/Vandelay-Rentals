import React from "react";
import "./Modal.css";

// class Modal extends Component {

//   render() {
//     if (!this.props.show) {
//       return null;
//     }
//     return (
//       <div id="my-modal" className="my-modal">
//         <ModalContent
//           body={this.props.body}
//           buttons={this.props.buttons}
//           closeModal={this.props.closeModal}
//         />
//       </div>
//     )
//   }

// }

export const Modal = props => (
  <React.Fragment>
    {props.show
      ? (
        <div className="modal" id="modal" onClick={props.outsideClick}>
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-close" onClick={props.closeModal}>&times;</span>
            </div>
            <div className="modal-body">
              {props.body}
              <div className="modal-btn-div">
                {props.buttons}
              </div>
            </div>
          </div>
        <div className="modal-footer" />
        </div>
      )
      : null}
  </React.Fragment>
);

export default Modal;