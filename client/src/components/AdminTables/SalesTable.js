import React, { Component, Fragment } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import API from "../../utils/API";
import Modal from "../../components/Elements/Modal";
import LoadingModal from "../../components/Elements/LoadingModal";
import "./AdminTables.css";
import { parseCellData, parseRowUpdate } from "../../utils/Helpers";
import { AdminIcons } from "./AdminIcons";
import {
  getNoteModal,
  saleItemDeleteModal,
  delayModal,
} from "../../utils/Modals";

export class SalesTable extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    categories: this.props.categories,
    category: null,
    condition: null,
    sales: [],
    saleType: null,
    status: null,
    note: ""
  };


  componentWillMount() {
    this.adminGetAllSaleItems();
  }

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
  // END MODAL TOGGLE FUNCTIONS

  //  Toggles a non-dismissable loading modal to prevent clicks while database ops are ongoing
  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  }

  //  Get all sale items and set state so the table will display
  adminGetAllSaleItems = () => {
    API.adminGetAllSaleItems()
      .then(res => {

        //  loop through the response and add a new key/value pair with the formatted price
        res.data.map(r => {
          if (r.cost) r.parsedCost = parseFloat(r.cost.$numberDecimal);
          if (r.price) r.parsedPrice = parseFloat(r.price.$numberDecimal);
          if (r.finalSale) r.parsedSale = parseFloat(r.finalSale.$numberDecimal);
          return r;
        });
        this.setState({
          sales: res.data
        });
      })
      .catch(err => console.log(err));
  };

  //  Sale Item Delete modal
  saleItemDeleteModal = row => {
    const modalObject = saleItemDeleteModal(row, this.closeModal, this.deleteSaleItem);
    this.setModal(modalObject);
  }

  //  Sale Item Delete function
  deleteSaleItem = row => {
    this.closeModal();
    this.toggleLoadingModal();
    const { _id } = row._original;
    API.adminDeleteSaleItem(_id)
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllSaleItems();
      })
      .catch(err => console.log(err));
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
    API.adminUpdateSaleItem(id, { note: this.state.note })
      .then(() => {
        delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
        //  query the db and reload the table
        this.adminGetAllSaleItems();
      })
      .catch(err => console.log(err));
  }

  //  Update selected Row - sends current field info to db and updates that item
  updateRow = row => {
    const updateObject = parseRowUpdate(
      row._original,
      this.closeModal,
      this.setModal,
      this.toggleLoadingModal,
      null,
      this.state.condition,
      this.state.saleType,
      this.state.status,
      this.state.category
    )
    const { _id } = row._original;

    API.adminUpdateSaleItem(_id, updateObject)
      .then(response => {
        if (response.status === 200) {
          delayModal(this.toggleLoadingModal, this.setModal, this.closeModal);
          //  query the db and reload the table
          this.adminGetAllSaleItems();
        }
      })
      .catch(err => console.log(err));
  };

  // editable react table function
  renderEditable = (cellInfo) => {
    const id = cellInfo.column.id;
    const index = cellInfo.index;
    const cellData = parseCellData(id, index, this.state.sales);
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const sales = [...this.state.sales];
          sales[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ sales });
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

        <div className="main-table-container sales-table">

          <div className="table-title-div">
            <h2>Sale Items Table <button onClick={this.props.toggleSaleItems}>hide table</button></h2>
          </div>

          <ReactTable
            data={this.state.sales}
            filterable
            columns={[
              {
                Header: 'Actions',
                columns: [
                  {
                    Header: 'Actions',
                    id: 'Item',
                    width: 110,
                    Cell: row => {
                      return (
                        <AdminIcons
                          updateRow={this.updateRow}
                          deleteModal={this.saleItemDeleteModal}
                          noteModal={this.noteModal}
                          row={row.row}
                          tooltip="sale item"
                        />
                      )
                    }
                  }
                ]
              },
              {
                Header: "Sale Item Data",
                columns: [
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Category",
                    accessor: "category",
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
                    Header: "Brand",
                    accessor: "maker",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "SKU",
                    accessor: "sku",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Cost",
                    accessor: "parsedCost",
                    width: 80,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Price",
                    accessor: "parsedPrice",
                    width: 80,
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Date Acq.",
                    accessor: "dateAcquired",
                    Cell: this.renderEditable
                  },
                  {
                    Header: "Sale Type",
                    accessor: "saleType",
                    width: 80,
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            <div className="table-select">
                              <select
                                name="saleType"
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.saleType}</option>
                                {row.row.saleType !== "New" ? <option>New</option> : null}
                                {row.row.saleType !== "Used" ? <option>Used</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  },
                  {
                    Header: "Condition",
                    accessor: "condition",
                    width: 90,
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            <div className="table-select">
                              <select
                                name="condition"
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.condition}</option>
                                {row.row.condition !== "New" ? <option>New</option> : null}
                                {row.row.condition !== "Excellent" ? <option>Excellent</option> : null}
                                {row.row.condition !== "Good" ? <option>Good</option> : null}
                                {row.row.condition !== "Fair" ? <option>Fair</option> : null}
                                {row.row.condition !== "Poor" ? <option>Poor</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  },
                  {
                    Header: "Status",
                    accessor: "status",
                    width: 90,
                    Cell: row => {
                      return (
                        <Fragment>
                          <form>
                            <div className="table-select">
                              <select
                                name="status"
                                onChange={this.handleInputChange}
                              >
                                <option>{row.row.status}</option>
                                {row.row.condition !== "Available" ? <option>Available</option> : null}
                                {row.row.condition !== "Sold" ? <option>Sold</option> : null}
                              </select>
                            </div>
                          </form>
                        </Fragment>
                      )
                    }
                  },
                  {
                    Header: "Sale Amt",
                    accessor: "parsedSale",
                    width: 80,
                    Cell: this.renderEditable
                  },
                ]
              },
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          />
        </div>
      </Fragment>
    );
  }
}