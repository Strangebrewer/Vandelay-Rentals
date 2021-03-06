import React, { Component, Fragment } from "react";
import API from "../../utils/API";
import Modal from "../../components/Elements/Modal";
import LoadingModal from "../../components/Elements/LoadingModal";
import NavBar from "../../components/Elements/NavBar";
import Footer from "../../components/Elements/Footer";
import "./ShoppingCart.css";
import dateFns from "date-fns"
import { Link } from 'react-router-dom';
import CheckoutForm from "../../components/Stripe/CheckoutForm";
import { StripeProvider, Elements } from 'react-stripe-elements';

class ShoppingCart extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    loadingModalOpen: false,
    tempRegistrations: [],
    tempReservations: [],
    courses: [],
    rentals: [],
    complete: false,
    total: 0
  }

  componentWillMount() {
    this.getUserShoppingCart();
  }

  closeModal = (checkout) => {
    this.setState({
      modal: { isOpen: false }
    });
    if (checkout) {
      this.checkout();
    }
  }

  setModal = (modalInput) => {
    // console.log(modalInput)
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

  toggleLoadingModal = () => {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen
    });
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  getUserShoppingCart = () => {
    let total = 0.00;
    API.getUserShoppingCart()
      .then(cart => {
        cart.data.tempRegistrations.forEach(reg => {
          total = (parseFloat(total) + parseFloat(reg.price.$numberDecimal)).toFixed(2);
        });
        cart.data.tempReservations.forEach(res => {
          total = (parseFloat(total) + parseFloat((((res.date.to - res.date.from) / 86400) + 1) * parseFloat(res.dailyRate.$numberDecimal))).toFixed(2);
        });
        this.setState({
          tempRegistrations: cart.data.tempRegistrations,
          tempReservations: cart.data.tempReservations,
          total: parseFloat(total).toFixed(2)
        });
      });
  }

  getAllCourses = () => {
    API.getAllCourses()
      .then(res => {
        // console.log(res);
        this.setState({
          courses: res.data
        });
        // console.log(this.state.courses);
      })
      .catch(err => console.log(err));
  }

  getAllRentals = () => {
    API.getAllRentals()
      .then(res => {
        this.setState({
          rentals: res.data
        });
      })
      .catch(err => console.log(err));
  }

  removeRegistrationFromCart = id => {
    this.toggleLoadingModal();
    API.removeRegistrationFromCart(id)
      .then(res => {
        this.getUserShoppingCart();
        this.toggleLoadingModal();
      })
      .catch(err => console.log(err));
  }

  confirmRegistration = course => {
    this.toggleLoadingModal();
    const { _id } = course;
    API.reserveCourse(_id, course)
      .then(res => {
        this.getUserShoppingCart();
        this.toggleLoadingModal();
      })
      .catch(err => console.log(err));
  }

  removeReservationFromCart = id => {
    this.toggleLoadingModal();
    API.removeReservationFromCart(id)
      .then(res => {
        this.getUserShoppingCart();
        this.toggleLoadingModal();
      })
      .catch(err => console.log(err));
  }

  confirmReservation = rental => {
    this.toggleLoadingModal();
    API.reserveRental(rental)
      .then(() => {
        this.getUserShoppingCart();
        this.toggleLoadingModal();
      });
  }


  // checkout = () => {
  //   console.log("running checkout")
  //   this.toggleLoadingModal();
  //   let checkArray = [];
  //   let promiseArray = [];
  //   console.log("Start temp reservations")
  //   console.log(this.state.tempReservations)
  //   console.log("end temp reservatios")
  //   console.log("Start temp registrations")
  //   console.log(this.state.tempRegistrations)
  //   console.log("end temp registrations")
  //   this.state.tempReservations.forEach(res => {
  //     const checkQuery = API.finalCheck(res);
  //     // const resQuery = API.reserveRental(res);
  //     checkArray.push(checkQuery);
  //     // promiseArray.push(resQuery);
  //     // API.finalCheck(res).then(response => { checkArray.push(response.data) })
  //   });
  //   this.state.tempRegistrations.forEach(reg => {
  //     const spaceQuery = API.checkSpace(reg._id, reg)
  //     // const regQuery = API.reserveCourse(reg._id, reg);
  //     checkArray.push(spaceQuery);
  //     // promiseArray.push(regQuery);
  //     // API.checkSpace(reg).then(response => { checkArray.push(response.data); console.log(checkArray); })
  //   });
  //   // if (checkArray.includes('data.response: "success"'))
  //   // console.log("***CHECKARRAY***");
  //   // console.log(checkArray);
  //   // console.log("***PROMISEARRAY***");
  //   // console.log(promiseArray);
  //   Promise.all(checkArray)
  //     .then(response => {
  //       // console.log(res)
  //       console.log(response)
  //       let noGood = [];
  //       let types = [];
  //       for (let i = 0; i < response.length; i++) {
  //         if (response[i].data.response === "already reserved" || response[i].data.response === "full") {
  //           noGood.push({ name: response[i].data.info.name, id: response[i].data.tempId, type: response[i].data.info.type })
  //         }
  //       }
  //       console.log(noGood)
  //       if (noGood.length > 0) {
  //         noGood.forEach(del => {
  //           console.log(del)
  //           if (del.type === "course") {
  //             this.removeRegistrationFromCart(del.id);
  //           } else if (del.type === "item") {
  //             this.removeReservationFromCart(del.id);
  //           }
  //           types.push(del.type);
  //         });
  //         Promise.all(noGood)
  //           .then(() => {
  //             console.log("start state tempreservations")
  //             console.log(this.state.tempRegistrations)
  //             console.log(this.state.tempReservations)
  //             console.log("end state tempreservations")
  //             this.toggleLoadingModal();
  //             this.setModal({
  //               body:
  //                 <Fragment>
  //                   <h3>Oh no!!</h3>
  //                   <br />
  //                   <h4>Someone beat you to the punch and reserved the following {noGood.length === 1 ? "item" : "items"} before you did... </h4><h1>🤯</h1>
  //                   {noGood.map(thing =>
  //                     <h3 key={thing.name}>{thing.name}</h3>
  //                   )}
  //                   <h5>Would you like to remove {noGood.length === 1 ? "it" : "them"} and continue to checkout, or go back and select another date for your reservation?</h5>
  //                 </Fragment>,
  //               buttons:
  //                 <Fragment>
  //                   {types.includes("course") && types.includes("rental")
  //                     ? <Link
  //                       className="modal-btn-link"
  //                       to={{ pathname: '/rentals' }}
  //                       role="button"
  //                     >
  //                       Select new date
  //             </Link> &&
  //                     <Link
  //                       className="modal-btn-link"
  //                       to={{ pathname: '/courses' }}
  //                       role="button"
  //                     >
  //                       Select new course
  //             </Link>
  //                     : types.includes("course")
  //                       ? <Link
  //                         className="modal-btn-link"
  //                         to={{ pathname: '/courses' }}
  //                         role="button"
  //                       >
  //                         Select new course
  //             </Link>
  //                       : types.includes("rental")
  //                         ? <Link
  //                           className="modal-btn-link"
  //                           to={{ pathname: '/rental' }}
  //                           role="button"
  //                         >
  //                           Select new dates
  //             </Link>
  //                         : null
  //                   }
  //                   <button
  //                     className="modal-btn-link"
  //                     onClick={() => this.closeModal(true)}
  //                   >
  //                     Remove
  //                     </button>
  //                 </Fragment>
  //             })
  //           })
  //       } else { // ***PAYMENT PROCESSING NEEDS TO GO HERE ***
  //         let { token } = this.props.stripe.createToken({ name: `${this.props.firstName} ${this.props.lastName}` });
  //         let response = fetch("/charge", {
  //           method: "POST",
  //           headers: { "Content-Type": "text/plain" },
  //           body: token.id
  //         });

  //         if (response.ok) {
  //           this.state.tempReservations.forEach(res => {
  //             const resQuery = API.reserveRental(res);
  //             promiseArray.push(resQuery);
  //           });
  //           this.state.tempRegistrations.forEach(reg => {
  //             const regQuery = API.reserveCourse(reg._id, reg);
  //             promiseArray.push(regQuery);
  //           });
  //           Promise.all(promiseArray)
  //             .then(() => {
  //               this.getUserShoppingCart();
  //               this.toggleLoadingModal();
  //               // this.setState({ complete: true })
  //             });
  //         }
  //       }
  //     })
  //     .catch(err => console.log(err));
  // }

  // async submit(ev) {
  //
  //     console.log("Purchase Complete!")
  //     this.setState({
  //       complete: true
  //     })
  //   }
  //   console.log(token.id)
  // }

  checkout = () => {
    this.toggleLoadingModal();
    let checkArray = [];
    let promiseArray = [];
    // console.log("Start temp reservations")
    // console.log(this.state.tempReservations)
    // console.log("end temp reservatios")
    // console.log("Start temp registrations")
    // console.log(this.state.tempRegistrations)
    // console.log("end temp registrations")
    this.state.tempReservations.forEach(res => {
      const checkQuery = API.finalCheck(res);
      // const resQuery = API.reserveRental(res);
      checkArray.push(checkQuery);
      // promiseArray.push(resQuery);
      // API.finalCheck(res).then(response => { checkArray.push(response.data) })
    });
    this.state.tempRegistrations.forEach(reg => {
      const spaceQuery = API.checkSpace(reg._id, reg)
      // const regQuery = API.reserveCourse(reg._id, reg);
      checkArray.push(spaceQuery);
      // promiseArray.push(regQuery);
      // API.checkSpace(reg).then(response => { checkArray.push(response.data); console.log(checkArray); })
    });
    // if (checkArray.includes('data.response: "success"'))
    // console.log("***CHECKARRAY***");
    // console.log(checkArray);
    // console.log("***PROMISEARRAY***");
    // console.log(promiseArray);
    Promise.all(checkArray)
      .then(response => {
        // console.log(res)
        console.log(response)
        let noGood = [];
        let types = [];
        for (let i = 0; i < response.length; i++) {
          if (response[i].data.response === "already reserved" || response[i].data.response === "full") {
            noGood.push({ name: response[i].data.info.name, id: response[i].data.tempId, type: response[i].data.info.type })
          }
        }
        console.log(noGood)
        if (noGood.length > 0) {
          noGood.forEach(del => {
            console.log(del)
            if (del.type === "course") {
              this.removeRegistrationFromCart(del.id);
            } else if (del.type === "item") {
              this.removeReservationFromCart(del.id);
            }
            types.push(del.type);
          });
          Promise.all(noGood)
            .then(() => {
              // console.log("start state tempreservations")
              // console.log(this.state.tempRegistrations)
              // console.log(this.state.tempReservations)
              // console.log("end state tempreservations")
              this.toggleLoadingModal();
              this.setModal({
                body:
                  <Fragment>
                    <h1><span role="img" aria-label="explodey face">🤯</span></h1>
                    <h4>It looks like someone beat you to the punch on the following: </h4>
                    {noGood.map(thing =>
                      <h3 key={thing.name}>{thing.name}</h3>
                    )}
                    <h5>Would you like to remove {noGood.length === 1 ? "it" : "them"} and continue to checkout, or go back and select another selection?</h5>
                  </Fragment>,
                buttons:
                  <Fragment>
                    {types.includes("course") && types.includes("rental")
                      ? <Link
                        className="modal-btn-link"
                        to={{ pathname: '/rentals' }}
                        role="button"
                      >
                        Rentals
              </Link> &&
                      <Link
                        className="modal-btn-link"
                        to={{ pathname: '/courses' }}
                        role="button"
                      >
                        Courses
              </Link>
                      : types.includes("course")
                        ? <Link
                          className="modal-btn-link"
                          to={{ pathname: '/courses' }}
                          role="button"
                        >
                          Courses
              </Link>
                        : types.includes("rental")
                          ? <Link
                            className="modal-btn-link"
                            to={{ pathname: '/rental' }}
                            role="button"
                          >
                            Rentals
              </Link>
                          : null
                    }
                    <button
                      className="modal-btn-link"
                      onClick={() => this.closeModal(true)}
                    >
                      Remove
                      </button>
                  </Fragment>
              })
            })
        } else {
          this.state.tempReservations.forEach(res => {
            //  Add total cost of the reservation to the reservation object:
            res.total = (((parseInt(res.date.to) - parseInt(res.date.from)) / 86400) + 1) * res.dailyRate.$numberDecimal;

            const resQuery = API.reserveRental(res);
            promiseArray.push(resQuery);
          });
          this.state.tempRegistrations.forEach(reg => {
            const regQuery = API.reserveCourse(reg._id, reg);
            promiseArray.push(regQuery);
          });
          Promise.all(promiseArray)
            .then(() => {
              this.getUserShoppingCart();
              this.toggleLoadingModal();
              this.setModal({
                body: <h4>Your reservations are confirmed.</h4>,
                buttons:
                  <Fragment>
                    <Link className="modal-btn-link" to={{ pathname: "/profile" }} role="button">My Info</Link>
                    <button onClick={() => this.closeModal(false)}>Close</button>
                  </Fragment>
              })
              // this.setState({
              //   complete: true
              // });
            });
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    // if left in still - take out this console log before production
    // console.log(this.state.tempRegistrations);
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
        <NavBar
          loggedIn={this.props.loggedIn}
          admin={this.props.admin}
          logout={this.props.logout}
          location={this.props.location}
          dev={this.props.dev}
        />
        <div className="main-container" id="shopping-cart-page">
          <div className='body-container '>
            <div className="shopping-cart-header">
              <h2>Welcome{this.props.firstName ? `, ${this.props.firstName}` : ""}</h2>
              {
                this.state.tempRegistrations.length > 0 || this.state.tempReservations.length > 0 ?
                  <h3>You're almost done!</h3>
                  :
                  <h3 className="empty-cart">Your Shopping Cart is Empty</h3>
              }

            </div>
            {this.state.complete === true || this.state.tempRegistrations.length > 0 || this.state.tempReservations.length > 0
              ? <div className="payment-container">
                <StripeProvider apiKey="pk_test_RwSP4QeJgsTpThoHAR7VRKmR">
                  <Elements>
                    <CheckoutForm
                      btn={() => this.checkout()}
                      firstName={this.props.firstName}
                      getUserShoppingCart={() => this.getUserShoppingCart()}
                      lastName={this.props.lastName}
                      removeRegistrationFromCart={() => this.removeRegistrationFromCart()}
                      removeReservationFromCart={() => this.removeReservationFromCart()}
                      setModal={this.setModal}
                      closeModal={this.closeModal}
                      tempRegistrations={this.state.tempRegistrations}
                      tempReservations={this.state.tempReservations}
                      toggleLoadingModal={this.toggleLoadingModal}
                      total={this.state.total}
                    />
                  </Elements>
                </StripeProvider>
              </div>
              : null}

            <div className="cart-page-container">
              <div className="cart-items">
                {this.state.tempReservations ? (
                  this.state.tempReservations.map(res => (
                    <div key={res._id} className="cart-res-container">
                      <h2>Rentals</h2>
                      <h3>{res.itemName}</h3>
                      {res.date.from !== res.date.to ? <h4>Reservation Dates:</h4> : <h4>Reservation Date:</h4>}
                      {res.date.from !== res.date.to
                        ? <div><p>From: {dateFns.format(res.date.from * 1000, "ddd MMM Do YYYY")}</p>
                          <p>To: {dateFns.format(res.date.to * 1000, "ddd MMM Do YYYY")}</p></div>
                        : <p>{dateFns.format(res.date.from * 1000, "ddd MMM Do YYYY")}</p>}
                      <p>Daily Rate: ${parseFloat(res.dailyRate.$numberDecimal).toFixed(2)}</p>
                      <h4>Total cost: ${parseFloat(((((res.date.to - res.date.from) / 86400) + 1) * parseFloat(res.dailyRate.$numberDecimal)).toFixed(2))}</h4>
                      {/* <button onClick={() => this.confirmReservation(res)}>Confirm</button> */}
                      <button className="remove-reservation" onClick={() => this.removeReservationFromCart(res._id)}>Remove</button>
                    </div>
                  ))
                ) : null}

                {this.state.tempRegistrations ? (
                  this.state.tempRegistrations.map(reg => (
                    <div key={reg._id} className="cart-reg-container">
                      <h2>Classes</h2>
                      <h3>{reg.courseName}</h3>
                      <h4>Class Date: {dateFns.format(reg.date * 1000, "ddd MMM Do YYYY")}</h4>
                      <h4>Price per person: ${parseFloat(reg.price.$numberDecimal).toFixed(2)}</h4>
                      {/* <button onClick={() => this.confirmRegistration(reg)}>Confirm</button> */}
                      <button className="remove-reservation" onClick={() => this.removeRegistrationFromCart(reg._id)}>Remove</button>
                    </div>
                  ))
                ) : null}
                <div className={this.state.tempRegistrations.length === 0 && this.state.tempReservations.length === 0 ?
                  "no-confirm" : "checkout-proceed"}>
                  <button className={`${this.state.tempRegistrations.length === 0 && this.state.tempReservations.length === 0 ?
                    "chkoutDisabled" : ""}`} onClick={() => this.checkout()}>Confirm Reservation <i className="fas fa-check-circle"></i></button>
                </div>
              </div>
            </div>
          </div>
          <Footer />

        </div>
      </Fragment>
    )
  }
}

export default ShoppingCart;