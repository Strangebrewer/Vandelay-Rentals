import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import API from "../../utils/API";
import Modal from "../../components/Elements/Modal";
import LoadingModal from "../../components/Elements/LoadingModal";
import "./AdminTables.css";
import { ReservationsTable } from './ReservationsTable';
import { RegistrationsTable } from './RegistrationsTable';
import { PastRentalsTable } from './PastRentalsTable';
import { parseCellData, parseRowUpdate } from "../../utils/Helpers";
import {
  getNoteModal,
  changePasswordModal,
  userRemoveModal,
  delayModal,
} from "../../utils/Modals";

// export class UsersTable extends Component {
export class UsersTable extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    password: "",
    confirmPassword: "",
    note: "",
    standing: null,
    users: []
  };

  componentDidMount() {
    this.adminGetAllUsers();
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

  //  Toggles a non-dismissable loading modal to prevent clicks while database ops are ongoing
  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  }

  // Standard input change controller
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  adminGetAllUsers = () => {
    API.adminGetAllUsers()
      .then(res => {
        this.setState({
          users: res.data,
          selection: [],
          selectedRow: {}
        });
      })
      .catch(err => console.log(err));
  };

  changePwModal = row => {
    const modalObject = changePasswordModal(
      row,
      this.handleInputChange,
      this.handlePasswordFormSubmit
    );
    this.setModal(modalObject);
  }

  handlePasswordFormSubmit = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminUpdateUser(_id, { password: this.state.password })
      .then(res => {
        if (res.status === 200) {
          setTimeout(this.toggleLoadingModal, 500);
          setTimeout(this.setModal, 500, {
            body: <h3>Password successfully changed</h3>,
            buttons: <button onClick={this.closeModal}>OK</button>
          });
        } else {
          setTimeout(this.toggleLoadingModal, 500);
          setTimeout(this.setModal, 500, {
            body:
              <Fragment>
                <h3>Something went wrong</h3>
                <h5>Please try again</h5>
              </Fragment>
          });
        }
      });
  }

  userDeleteModal = row => {
    const modalObject = userRemoveModal(
      row._original,
      this.closeModal,
      this.deactivateUser,
      this.banUser,
      this.deleteUser
    );
    this.setModal(modalObject);
  }

  deactivateUser = row => {
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminUpdateUser(_id, { standing: "Inactive" })
      .then(res => {
        this.toggleLoadingModal();
        this.adminGetAllUsers();
        this.setModal({
          body: <h3>Database sucessfully updated.</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
      });
  }

  banUser = row => {
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminUpdateUser(_id, { standing: "Banned" })
      .then(res => {
        this.toggleLoadingModal();
        this.adminGetAllUsers();
        this.setModal({
          body: <h3>Database sucessfully updated.</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
      });
  }

  deleteUser = row => {
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.deleteUser(_id)
      .then(res => {
        this.toggleLoadingModal();
        this.adminGetAllUsers();
        this.setModal({
          body: <h3>Database sucessfully updated.</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
      })

  }

  noteModal = row => {
    const modalContent = getNoteModal(
      this.handleInputChange,
      this.submitNote,
      this.closeModal,
      row._original.note,
      row._original._id
    )
    this.setModal(modalContent)
  }

  submitNote = id => {
    this.closeModal();
    this.toggleLoadingModal();
    API.adminUpdateUser(id, { note: this.state.note })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllUsers();
      })
      .catch(err => console.log(err));
  }

  updateRow = row => {
    const { _id } = row._original;
    const updateObject = parseRowUpdate(
      row._original,
      this.closeModal,
      this.setModal,
      this.toggleLoadingModal,
      null,
      null,
      null,
      null,
      null,
      this.state.standing
    )

    API.adminUpdateUser(_id, updateObject)
      .then(response => {
        if (response.status === 200) {
          if (response.data.dbModel._id === response.data.user._id && response.data.dbModel.admin === false) {
            console.log("Changing my own admin status like a doofus!");
            //  This will only be triggered if a person revokes their own admin status. Stupid, but... someone out there will do it. So, redirecting the user to the "/" page by updating user via the App.js function (passed down as a prop).
            this.props.updateUser({
              auth: true,
              admin: false,
              state: {
                loggedIn: true,
                admin: false,
              }
            });
          } else {
            delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
            this.adminGetAllUsers();
          }
        } else {
          setTimeout(this.toggleLoadingModal, 500);
          setTimeout(this.setModal, 500, {
            body: <h4>There was a problem with your request. Please try again.</h4>,
            buttons: <button onClick={this.closeModal}>OK</button>
          });
        }
      }).catch(err => {
        setTimeout(this.toggleLoadingModal, 500);
        setTimeout(this.setModal, 500, {
          body: <h4>There was a problem with your request. Please try again.</h4>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
      })
  }

  renderEditable = cellInfo => {
    const id = cellInfo.column.id;
    const index = cellInfo.index;
    const cellData = parseCellData(id, index, this.state.users);
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const users = [...this.state.users];
          users[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ users });
        }}
        dangerouslySetInnerHTML={cellData}
      />
    );
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
        <LoadingModal show={this.state.loadingModalOpen} />

        <div className="main-table-container user-table">

          <div className="table-title-div">
            <h2>Users Table <button onClick={this.props.toggleUsers}>hide table</button></h2>
          </div>

          <ReactTable
            data={this.state.users}
            filterable
            SubComponent={row => {
              console.log(row);
              //  thisReservation grabs the reservations from this.state.rentals that matches the row index - it grabs the reservations for this rental item.
              const thisRow = this.state.users[row.row._index];

              return (
                <div className="sub-table-container">
                  {thisRow.reservations.length > 0 ? (
                    <ReservationsTable
                      forName={`${thisRow.firstName} ${thisRow.lastName}`}
                      reservations={thisRow.reservations}
                      fromUsers={true}
                      adminGetAllUsers={this.adminGetAllUsers}
                    />
                  ) : null}

                  {thisRow.registrations.length > 0 ? (
                    <RegistrationsTable
                      forName={`${thisRow.firstName} ${thisRow.lastName}`}
                      registrations={thisRow.registrations}
                      fromUsers={true}
                      adminGetAllUsers={this.adminGetAllUsers}
                    />
                  ) : null}

                  {thisRow.pastRentals.length > 0 ? (
                    <PastRentalsTable
                      forName={`${thisRow.firstName} ${thisRow.lastName}`}
                      pastRentals={thisRow.pastRentals}
                      fromUsers={true}
                      adminGetAllUsers={this.adminGetAllUsers}
                    />
                  ) : null}
                </div>
              )
            }}
            columns={[
              {
                Header: 'Actions',
                columns: [
                  {
                    Header: 'User',
                    id: 'user',
                    width: 140,
                    Cell: row => {
                      return (
                        <div className="table-icon-div">
                          <div className="fa-sync-div table-icon-inner-div">
                            <i onClick={() => this.updateRow(row.row)} className="table-icon fas fa-sync fa-lg"></i>
                            <span className="fa-sync-tooltip table-tooltip">upload changes</span>
                          </div>
                          <div className="fa-trash-alt-div table-icon-inner-div">
                            <i onClick={() => this.userDeleteModal(row.row)} className="table-icon fas fa-trash-alt fa-lg"></i>
                            <span className="fa-trash-alt-tooltip table-tooltip">delete user</span>
                          </div>
                          <div className="fa-sticky-note-div table-icon-inner-div">
                            <i onClick={() => this.noteModal(row.row)} className="table-icon far fa-sticky-note fa-lg"></i>
                            <span className="fa-sticky-note-tooltip table-tooltip">see/edit notes</span>
                          </div>
                          <div className="fa-unlock-alt-div table-icon-inner-div">
                            <i onClick={() => this.changePwModal(row.row)} className="table-icon fas fa-unlock-alt fa-lg"></i>
                            <span className="fa-unlock-alt-tooltip table-tooltip">change password</span>
                          </div>
                        </div>
                      )
                    }
                  },
                ]
              },
              {
                Header: "User",
                columns: [
                  {
                    Header: "Username",
                    accessor: "username",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Admin?",
                    accessor: "admin",
                    width: 70,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "First Name",
                    accessor: "firstName",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Last Name",
                    accessor: "lastName",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Standing",
                    accessor: "standing",
                    width: 90,
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            <div className="table-select">
                              <select
                                name="standing"
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.standing}</option>
                                {row.row.standing !== "Good" ? <option>Good</option> : null}
                                {row.row.standing !== "Uncertain" ? <option>Uncertain</option> : null}
                                {row.row.standing !== "Banned" ? <option>Banned</option> : null}
                                {row.row.standing !== "Inactive" ? <option>Inactive</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  }
                ]
              },
              {
                Header: "Contact Info",
                columns: [
                  {
                    Header: "Email",
                    accessor: "email",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Street",
                    accessor: "street",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "City",
                    accessor: "city",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "State",
                    accessor: "state",
                    width: 50,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Zipcode",
                    accessor: "zipcode",
                    width: 70,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Phone",
                    accessor: "phone",
                    Cell: this.renderEditable
                  }
                ]
              }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          />
        </div>
      </Fragment>
    );
  }
}