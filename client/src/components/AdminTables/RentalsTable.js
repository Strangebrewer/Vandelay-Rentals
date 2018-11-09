import React, { Component, Fragment } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import API from '../../utils/API';
import Modal from '../../components/Elements/Modal';
import LoadingModal from '../../components/Elements/LoadingModal';
import ImageModal from '../../components/Elements/ImageModal';
import './AdminTables.css';
import { AdminIcons } from "./AdminIcons";
import { AdminImageIcons } from "./AdminImageIcons";
import { ReservationsTable } from './ReservationsTable';
import { PastRentalsTable } from './PastRentalsTable';
import { parseCellData, parseRowUpdate } from "../../utils/Helpers";
import {
  getNoteModal,
  rentalDeleteModal,
  imageUploadModal,
  loadingModal,
  displayImagesModal,
  delayModal,
} from "../../utils/Modals";

export class RentalsTable extends Component {
  state = {
    modal: {
      isOpen: false,
      body: '',
      buttons: ''
    },
    imageModal: {
      isOpen: false,
      body: '',
    },
    loadingModalOpen: false,
    categories: this.props.categories,
    category: '',
    condition: '',
    note: '',
    images: [],
    selectedFile: null,
    image: null,
    rentals: [],
  };

  componentDidMount = () => {
    this.adminGetAllRentals();
  };

  // Standard input change controller
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  // MODAL TOGGLE FUNCTIONS
  closeModal = () => {
    this.setState({
      modal: { isOpen: false }
    });
  };

  setModal = modalInput => {
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

  toggleImageModal = () => {
    this.setState({
      imageModal: { isOpen: !this.state.imageModal.isOpen }
    });
  };

  setImageModal = modalInput => {
    this.setState({
      imageModal: {
        isOpen: true,
        body: modalInput.body,
      }
    });
  };
  // END MODAL TOGGLE FUNCTIONS

  //  Toggles a non-dismissable loading modal to prevent clicks while database ops are ongoing
  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  };

  // Get rentals and set state so the table will display
  adminGetAllRentals = () => {
    API.adminGetAllRentals()
      .then(res => {

        // //  loop through the response array and add a new key/value pair with the formatted rate
        res.data.forEach(r => {
          r.rate = parseFloat(r.dailyRate.$numberDecimal);
        });

        // set state for rentals
        this.setState({
          rentals: res.data
        });
      })
      .catch(err => console.log(err));
  };

  //  Changes rental condition to retire - offered as an alternative to deleting
  retireRental = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminUpdateRental(_id, { condition: 'Retired' })
      .then(() => {
        this.adminGetAllRentals();
        this.toggleLoadingModal();
      });
  };

  rentalDeleteModal = row => {
    const { reservations, pastRentals } = row._original;
    const modalObject = rentalDeleteModal(
      pastRentals,
      reservations,
      this.closeModal,
      this.retireRental,
      row,
      this.deleteRental
    );
    this.setModal(modalObject);
  };

  deleteRental = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminDeleteRentalItem(_id)
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllRentals();
      })
      .catch(err => console.log(err));
  };

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

  submitNote = (id, note) => {
    this.closeModal();
    this.toggleLoadingModal();
    API.adminUpdateRental(id, { note: this.state.note })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllRentals();
      })
      .catch(err => console.log(err));
  }

  //  IMAGE CRUD OPERATIONS FUNCTIONS
  // Gets the modal with the image upload form
  getImageUploadModal = row => {
    const modalObject = imageUploadModal(
      this.fileSelectedHandler,
      this.handleImageUpload,
      row,
      this.closeModal
    );
    this.setModal(modalObject);
  };

  // the image chosen in the modal form is pushed into state (similar to handleInputChange function)
  fileSelectedHandler = event => {
    const newFile = event.target.files[0];
    this.setState({
      selectedFile: newFile
    });
  };

  //  When the submit button on the image upload modal is pressed, the image is uploaded into the db
  handleImageUpload = row => {
    this.setModal(loadingModal());

    const { _id } = row._original;
    const fd = new FormData();
    if (this.state.selectedFile) {
      fd.append('file', this.state.selectedFile, this.state.selectedFile.name);
      API.uploadImage(_id, fd).then(res => {
        this.setState({
          selectedFile: null
        })
        this.closeModal();
        this.getImageUploadModal(row);
      });
    } else {
      this.setModal({
        body: <h3>You have not selected a file to upload</h3>,
        buttons: <button onClick={() => this.getImageUploadModal(row)}>Try Again</button>
      })
    }
  };

  // Gets image names from the db so they can be put into 'img' elements to be streamed for display
  getImageNames = row => {
    this.setModal(loadingModal());
    const { _id } = row._original;
    API.getImageNames(_id).then(res => {
      if (res.data.length === 0) {
        setTimeout(this.setModal, 500, {
          body: <h3>No images to display</h3>,
          buttons: <button onClick={this.closeModal}>OK</button>
        });
      } else {
        this.closeModal();
        this.getImageModal(res.data, row);
      }
    });
  };

  // Once image names have been retrieved, they are placed into img tags for display inside a modal
  getImageModal = (images, row) => {
    const modalObject = displayImagesModal(images, row, this.deleteImage);
    this.setImageModal(modalObject);
  };

  // Deletes an image, then closes the modal so when getImageNames toggles the modal, it will reopen it
  deleteImage = (image, row) => {
    this.setModal(loadingModal());
    const { _id } = row._original;
    API.deleteImage(image, _id).then(res => {
      this.toggleImageModal();
      this.getImageNames(row);
    });
  };
  //  END - IMAGE CRUD OPERATIONS FUNCTIONS

  //  Update Row - sends current field info to db and updates that item
  updateRow = row => {
    const { _id } = row._original;

    const updateObject = parseRowUpdate(
      row._original,
      this.closeModal,
      this.setModal,
      this.toggleLoadingModal,
      null,
      this.state.condition,
      null,
      null,
      this.state.category
    )

    API.adminUpdateRental(_id, updateObject)
      .then(response => {
        if (response.status === 200) {
          delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
          //  query the db and reload the table
          this.adminGetAllRentals();
        }
      })
      .catch(err => console.log(err));
  };

  // editable react table
  renderEditable = cellInfo => {
    const id = cellInfo.column.id;
    const index = cellInfo.index;
    const cellData = parseCellData(id, index, this.state.rentals);
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const rentals = [...this.state.rentals];
          rentals[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ rentals: rentals });
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
        <ImageModal
          show={this.state.imageModal.isOpen}
          toggleImageModal={this.toggleImageModal}
          body={this.state.imageModal.body}
          outsideClick={this.outsideClick}
        />
        <LoadingModal show={this.state.loadingModalOpen} />
        <div className="main-table-container rental-table">
          <div className="table-title-div">
            <h2>Rentals Table <button onClick={this.props.toggleRentals}>hide table</button></h2>
          </div>

          <ReactTable
            data={this.state.rentals}
            filterable
            SubComponent={row => {
              //  thisReservation grabs the reservations from this.state.rentals that matches the row index - it grabs the reservations for this rental item.
              const thisRow = this.state.rentals[row.row._index];
              return (
                <div className="sub-table-container">
                  {thisRow.reservations.length > 0 ? (
                    <ReservationsTable
                      forName={thisRow.name}
                      filterable
                      reservations={thisRow.reservations}
                      rentals={true}
                      adminGetAllRentals={this.adminGetAllRentals}
                    />
                  ) : null}

                  {thisRow.pastRentals.length > 0 ? (
                    <PastRentalsTable
                      forName={thisRow.name}
                      filterable
                      pastRentals={thisRow.pastRentals}
                      rentals={true}
                      adminGetAllRentals={this.adminGetAllRentals}
                    />
                  ) : null}
                </div>
              );
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
                          deleteModal={this.rentalDeleteModal}
                          noteModal={this.noteModal}
                          row={row.row}
                          tooltip="rental"
                        />
                      )
                    }
                  },
                  {
                    Header: 'Images',
                    id: 'images',
                    Cell: row => {
                      return (
                        <AdminImageIcons
                          uploadModal={this.getImageUploadModal}
                          getNames={this.getImageNames}
                          row={row.row}
                        />
                      )
                    },
                    width: 80
                  },
                ]
              },
              {
                Header: 'Rental Info',
                columns:
                  [
                    {
                      Header: 'Name',
                      accessor: 'name',
                      Cell: this.renderEditable
                    },
                    {
                      Header: 'Type',
                      accessor: 'category',
                      width: 115,
                      Cell: row => {
                        return (
                          <Fragment>
                            <form>
                              <div className="table-select">
                                <select
                                  name="category"
                                  onChange={this.handleInputChange}
                                >
                                  <option>{row.row.category}</option>
                                  {this.state.categories ? this.state.categories.map(cat => (
                                    cat.category !== row.row.category ? <option key={cat._id}>{cat.category}</option> : null
                                  )) : null}
                                </select>
                              </div>
                            </form>
                          </Fragment>
                        )
                      }
                    },
                    {
                      Header: 'Mfr.',
                      accessor: 'maker',
                      Cell: this.renderEditable
                    },
                    {
                      Header: 'SKU',
                      accessor: 'sku',
                      Cell: this.renderEditable
                    }
                  ]
              },
              {
                Header: 'Rental Details',
                columns: [
                  {
                    Header: 'Rate',
                    accessor: 'rate',
                    width: 70,
                    Cell: this.renderEditable
                  },
                  {
                    Header: 'Date Acq.',
                    accessor: "dateAcquired",
                    Cell: this.renderEditable,
                  },
                  {
                    Header: 'x Rented',
                    accessor: 'timesRented',
                    Cell: this.renderEditable
                  },
                  {
                    Header: 'Condition',
                    accessor: 'condition',
                    width: 85,
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            {/* using the Select and Option components in a modal seems to make everything stop working... */}
                            <div className="table-select">
                              <select
                                name="condition"
                                // for some reason, setting the value={this.state.whatever} in a modal doesn't work. The onChange still updates state, but the input (dropdown) is uncontrolled.
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.condition}</option>
                                {row.row.condition !== "New" ? <option>New</option> : null}
                                {row.row.condition !== "Good" ? <option>Good</option> : null}
                                {row.row.condition !== "Working" ? <option>Working</option> : null}
                                {row.row.condition !== "Disrepair" ? <option>Disrepair</option> : null}
                                {row.row.condition !== "Retired" ? <option>Retired</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  }
                ]
              }
            ]}
            defaultSorted={[
              {
                id: "name",
                desc: false
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