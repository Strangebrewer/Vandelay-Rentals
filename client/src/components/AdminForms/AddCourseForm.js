import React, { Component, Fragment } from "react";
import { Input, FormBtn, Textarea, Label } from "../Elements/Form";
import Modal from "../../components/Elements/Modal";
import API from "../../utils/API";
import dateFns from 'date-fns';

export class AddCourseForm extends Component {
  state = {
    modal: {
      isOpen: false,
      body: "",
      buttons: ""
    },
    name: "",
    price: "",
    abstract: "",
    detail: "",
    topics: "",
    level: "",
    date: "",
    slots: ""
  }

  toggleModal = () => {
    this.setState({
      modal: { isOpen: !this.state.modal.isOpen }
    });
  }

  setModal = (modalInput) => {
    this.setState({
      modal: {
        isOpen: !this.state.modal.isOpen,
        body: modalInput.body,
        buttons: modalInput.buttons
      }
    });
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    const { name, price, abstract, detail, topics, level, date, slots } = this.state;
    const topicsArray = topics.split(',').map(topic => topic.trim());
    const unixDate = dateFns.format(date, "X");

    const courseObject = {
      name: name,
      price: price,
      abstract: abstract,
      detail: detail,
      topics: topicsArray,
      level: level,
      date: unixDate,
      slots: slots,
      registrations: []
    }

    API.adminAddNewCourse(courseObject)
      .then(res => {
        console.log(res);
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
      <Fragment>
        <Modal
          show={this.state.modal.isOpen}
          toggleModal={this.toggleModal}
          body={this.state.modal.body}
          buttons={this.state.modal.buttons}
        />
        <form>
          <Input
            value={this.state.name}
            onChange={this.handleInputChange}
            name="name"
            type="text"
            label="Course Name:"
          />
          <Input
            value={this.state.price}
            onChange={this.handleInputChange}
            name="price"
            type="text"
            label="Price:"
          />
          <Textarea
            value={this.state.abstract}
            onChange={this.handleInputChange}
            name="abstract"
            label="Summary:"
          />
          <Textarea
            value={this.state.detail}
            onChange={this.handleInputChange}
            name="detail"
            label="Detailed Description:"
          />
          <Textarea
            value={this.state.topics}
            onChange={this.handleInputChange}
            name="topics"
            label="Topics Covered:"
            placeholder="Separate topics with a comma"
          />
          <div className="group group-select">
            <select
              value={this.state.level}
              onChange={this.handleInputChange}
              name="level"
            >
              <option></option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <Label htmlFor="level">Difficulty:</Label>
          </div>
          <Input
            value={this.state.date}
            onChange={this.handleInputChange}
            name="date"
            type="text"
            label="Date:"
          />
          <Input
            value={this.state.slots}
            onChange={this.handleInputChange}
            name="slots"
            type="text"
            label="Number of Slots:"
          />
          <FormBtn
            disabled={
              !this.state.name ||
              !this.state.price ||
              !this.state.abstract ||
              !this.state.detail ||
              !this.state.topics ||
              !this.state.date ||
              !this.state.slots
            }
            onClick={this.handleFormSubmit}
          >
            Submit
          </FormBtn>
        </form>

      </Fragment>
    )
  }
}