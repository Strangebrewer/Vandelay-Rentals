import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import API from "../../utils/API";
import Modal from "../../components/Elements/Modal";
import LoadingModal from "../../components/Elements/LoadingModal";
import { RegistrationsTable } from "./RegistrationsTable";
import { AdminIcons } from "./AdminIcons";
import "./AdminTables.css";
import {
  getNoteModal,
  courseDeleteModal,
  delayModal,
} from "../../utils/Modals";
import { parseCellData, parseRowUpdate } from "../../utils/Helpers";

export class CoursesTable extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    courses: [],
    level: "",
    note: '',
    topics: '',
    summary: '',
    description: ''
  };

  componentDidMount() {
    this.adminGetAllCourses();
  };

  // Standard input change controller
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  // MODAL TOGGLE FUNCTIONS
  closeModal = () => {
    this.setState({ modal: { isOpen: false } });
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
  // END MODAL TOGGLE FUNCTIONS

  //  Toggles a non-dismissable loading modal to prevent clicks while database ops are ongoign
  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  }

  noteModal = row => {
    const modalContent = getNoteModal(
      this.handleInputChange,
      this.submitNote,
      this.closeModal,
      row._original.note,
      row._original.id
    )
    this.setModal(modalContent)
  }

  //  Get all courses from the database and set state so the table will display
  adminGetAllCourses = () => {
    API.adminGetAllCourses()
      .then(res => {
        res.data.forEach(r => {
          r.pricePer = parseFloat(r.price.$numberDecimal);
          if (r.registrations.length) {
            r.openSlots = r.slots - r.registrations.length;
          } else {
            r.openSlots = r.slots;
          }
        });
        this.setState({
          courses: res.data
        });
      })
      .catch(err => console.log(err));
  };

  //  Course delete modal
  courseDeleteModal = row => {
    const modalObject = courseDeleteModal(
      row._original.registrations.length,
      this.closeModal,
      row,
      this.deleteCourse
    )
    this.setModal(modalObject);
  }

  // Course delete function
  deleteCourse = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original
    API.adminDeleteCourse(_id)
      .then(res => {
        this.adminGetAllCourses();
        this.toggleLoadingModal();
        this.closeModal();
      })
      .catch(err => console.log(err));
  }

  submitNote = id => {
    this.closeModal();
    this.toggleLoadingModal();
    API.adminUpdateCourse(id, { note: this.state.note })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllCourses();
      })
      .catch(err => console.log(err));
  }

  topicsModal = row => {
    const { _id, topics } = row._original;
    const topicsString = topics.join(", ");
    this.setModal({
      body:
        <Fragment>
          <h3>Course Topics</h3>
          <textarea name="topics" onChange={this.handleInputChange} rows="4" defaultValue={topicsString}></textarea>
        </Fragment>,
      buttons: <button onClick={() => this.submitTopics(_id)}>Submit</button>
    })
  }

  submitTopics = id => {
    this.closeModal();
    this.toggleLoadingModal();
    const topicsArray = this.state.topics.split(", ");
    API.adminUpdateCourse(id, { topics: topicsArray })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllCourses();
      })
      .catch(err => console.log(err));
  }

  summaryModal = row => {
    const { _id, summary } = row._original;
    this.setModal({
      body:
        <Fragment>
          <h3>Course Summary</h3>
          <textarea name="summary" onChange={this.handleInputChange} rows="2" defaultValue={summary}></textarea>
        </Fragment>,
      buttons: <button onClick={() => this.submitSummary(_id, this.state.summary)}>Submit</button>
    });
  }

  submitSummary = id => {
    this.closeModal();
    this.toggleLoadingModal();
    API.adminUpdateCourse(id, { summary: this.state.summary })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllCourses();
      })
      .catch(err => console.log(err));
  }

  descriptionModal = row => {
    const { _id, description } = row._original;
    this.setModal({
      body:
        <Fragment>
          <h3>Course Description</h3>
          <textarea name="description" onChange={this.handleInputChange} rows="10" defaultValue={description}></textarea>
        </Fragment>,
      buttons: <button onClick={() => this.submitDescription(_id, this.state.description)}>Submit</button>
    });
  }

  submitDescription = id => {
    this.closeModal();
    this.toggleLoadingModal();
    API.adminUpdateCourse(id, { description: this.state.description })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllCourses();
      })
      .catch(err => console.log(err));
  }

  //  Update selected Row - sends current field info to db and updates that item
  updateRow = row => {
    const { _id } = row._original;
    const updateObject = parseRowUpdate(
      row._original,
      this.closeModal,
      this.setModal,
      this.toggleLoadingModal,
      this.state.level
    );

    API.adminUpdateCourse(_id, updateObject)
      .then(response => {
        if (response.status === 200) {
          delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
          //  query the db and reload the table
          this.adminGetAllCourses();
        }
      })
      .catch(err => console.log(err));
  };

  // editable react table function
  renderEditable = cellInfo => {
    const id = cellInfo.column.id;
    const index = cellInfo.index;
    const cellData = parseCellData(id, index, this.state.courses);
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const courses = [...this.state.courses];
          courses[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ courses: courses });
        }}
        dangerouslySetInnerHTML={cellData}
      />
    );
  };

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
        <div className="main-table-container courses-table">

          <div className="table-title-div">
            <h2>Classes Table <button onClick={this.props.toggleCourses}>Hide Table</button></h2>
          </div>

          <ReactTable
            data={this.state.courses}
            filterable
            SubComponent={row => {
              //  thisReservation grabs the reservations from this.state.courses that matches the row index - it grabs the registrations for this course.
              const thisRow = this.state.courses[row.row._index];
              return (
                <div className="sub-table-container">
                  {thisRow.registrations.length > 0 ? (
                    <RegistrationsTable
                      forName={thisRow.name}
                      filterable
                      fromUsers={false}
                      registrations={thisRow.registrations}
                      adminGetAllCourses={this.adminGetAllCourses}
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
                    Header: 'Item',
                    id: 'item',
                    width: 110,
                    Cell: row => {
                      return (
                        <AdminIcons
                          updateRow={this.updateRow}
                          deleteModal={this.courseDeleteModal}
                          noteModal={this.noteModal}
                          row={row.row}
                          tooltip="class"
                        />
                      )
                    }
                  }
                ]
              },
              {
                Header: 'Class Details',
                columns: [
                  {
                    Header: "More Info",
                    accessor: "",
                    width: 140,
                    Cell: row => {
                      return (
                        <div className="table-icon-div">
                          <div className="fa-list-ul-div table-icon-inner-div">
                            <i onClick={() => this.topicsModal(row.row)} className="table-icon fas fa-list-ul fa-lg"></i>
                            <span className="fa-list-ul-tooltip table-tooltip">see/edit topics</span>
                          </div>
                          <div className="fa-comment-alt-div table-icon-inner-div">
                            <i onClick={() => this.summaryModal(row.row)} className="table-icon far fa-comment-alt fa-lg"></i>
                            <span className="fa-comment-alt-tooltip table-tooltip">see/edit summary</span>
                          </div>
                          <div className="fa-book-open-div table-icon-inner-div">
                            <i onClick={() => this.descriptionModal(row.row)} className="table-icon fas fa-book-open fa-lg"></i>
                            <span className="fa-book-open-tooltip table-tooltip">see/edit description</span>
                          </div>
                        </div>
                      )
                    }
                  }
                ]
              },
              {
                Header: 'Class Info',
                columns: [
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Date",
                    accessor: "date",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Difficulty",
                    accessor: "level",
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            <div className="table-select">
                              <select
                                name="level"
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.level}</option>
                                {row.row.level !== "Advanced" ? <option>Advanced</option> : null}
                                {row.row.level !== "Intermediate" ? <option>Intermediate</option> : null}
                                {row.row.level !== "Beginner" ? <option>Beginner</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  },
                  {
                    Header: "Price",
                    accessor: "pricePer",
                    width: 80,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Slots",
                    accessor: "slots",
                    width: 70,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Open",
                    accessor: "openSlots",
                    width: 70
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