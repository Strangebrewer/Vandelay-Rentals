import React, { Component, Fragment } from "react";
import Modal from "../../components/Elements/Modal";
import LoadingModal from "../../components/Elements/LoadingModal";
import ParallaxHero from "./../../components/ParallaxHero";
import NavBar from "../../components/Elements/NavBar";
import Footer from "../../components/Elements/Footer";
import CourseCard from "./../../components/Cards/CourseCard";
import API from "../../utils/API";
import { Link } from 'react-router-dom';
import "./Courses.css";

class Courses extends Component {
	state = {
		modal: {
			isOpen: false,
			body: "",
			buttons: ""
		},
		loadingModalOpen: false,
		courses: []
	};

	componentWillMount() {
		this.getAllCourses();
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

	toggleLoadingModal = () => {
		this.setState({
			loadingModalOpen: !this.state.loadingModalOpen
		});
	}

	getAllCourses = () => {
		API.getAllCourses()
			.then(res => {
				console.log(res);
				this.setState({
					courses: res.data
				});
				console.log(this.state.courses);
			})
			.catch(err => console.log(err));
	}

	handleInputChange = event => {
		const { name, value } = event.target;
		this.setState({
			[name]: value
		});
	};

	handleFormSubmit = event => {
		event.preventDefault();
		//  blah blah blah
	};

	// Creates document in tempRegistrations and adds the tempRegistration to the user's shopping cart
	addCourseToCart = course => {
		if (!this.props.loggedIn) {
			return this.setModal({
				body: <h4>You must be logged in to register for a class.</h4>,
				buttons: <button onClick={this.closeModal}>OK</button>
			})
		}
		this.toggleLoadingModal();
		const { _id } = course;
		API.addRegistrationToCart(_id, course)
			.then(response => {
				console.log(response);
				if (response.data.message === "duplicate") {
					console.log("Duplicate")
					this.toggleLoadingModal();
					this.setModal({
						body:
							<Fragment>
								<h5>That class is already in your cart.</h5>
								<br />
								<h4>Would you like to checkout or keep shopping?</h4>
							</Fragment>,
						buttons:
							<Fragment>
								<Link
									className="modal-btn-link"
									to={{ pathname: '/cart' }}
									role="button"
								>
									Go to Checkout
						</Link>
								<button onClick={this.closeModal}>Continue Shopping</button>
							</Fragment>
					})
				} else if (response.data.message === "registration duplicate") {
					console.log("Duplicate")
					this.toggleLoadingModal();
					this.setModal({
						body:
							<h4>You are already registered for that class.</h4>,
						buttons:
							<button onClick={this.closeModal}>Continue Shopping</button>

					})
				} else {
					this.setModal({
						body:
							<Fragment>
								<h5>{course.name} has been added to your cart.</h5>
								<br />
								<h4>Would you like to checkout or keep shopping?</h4>
							</Fragment>,
						buttons:
							<Fragment>
								<Link
									className="modal-btn-link"
									to={{ pathname: '/cart' }}
									role="button"
								>
									Go to Checkout
              </Link>
								<button onClick={this.closeModal}>Continue Shopping</button>
							</Fragment>


					})
					this.getAllCourses();
					this.toggleLoadingModal();
				}
			});
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
				<NavBar
					loggedIn={this.props.loggedIn}
					admin={this.props.admin}
					logout={this.props.logout}
					location={this.props.location}
				/>
				<div className="main-container">
					<ParallaxHero
						image={{ backgroundImage: 'url(./static/assets/images/group_in_kayaks.jpeg)' }}
						title="LEARN"
					/>

					<div className='body-container courses'>
						<h2>Classes Available:</h2>
						<ul>
							{this.state.courses.map(course => (
								<CourseCard
									key={course._id}
									id={course._id}
									course={course}
									name={course.name}
									summary={course.summary}
									addCourseToCart={this.addCourseToCart}
									level={course.level}
									price={parseFloat(course.price.$numberDecimal).toFixed(2)}
									description={course.description}
									slots={course.slots}
									displayImageUrl={course.displayImageUrl}>
									{course.topics.map((topic, index) => (
										<li key={`${index}-${course._id}`}>{topic}</li>
									))}
								</CourseCard>
							))}
						</ul>
					</div>
					<Footer />
				</div>
			</Fragment>
		);
	}
}

export default Courses;
