import React, { Fragment } from "react";
import { Input } from "../components/Elements/Form";
import dateFns from "date-fns";

function loadingModal() {
  return {
    body:
      <Fragment>
        <h3>Loading...</h3>
        <img
          style={{ width: '50px', display: 'block', margin: '50px auto' }}
          src="./../../../loading.gif"
          alt="spinning gears"
        />
      </Fragment>
  }
}

function delayModal(loadingModal, setModal, closeModal) {
  //  keep the loading modal up for at least .5 seconds, otherwise it's just a screen flash and looks like a glitch.
  setTimeout(loadingModal, 500);
  // success modal after the loading modal is gone.
  setTimeout(setModal, 500, {
    body: <h3>Database successfully updated</h3>,
    buttons: <button onClick={closeModal}>OK</button>
  });
}

function getNoteModal(change, submit, close, note, id) {
  return {
    body:
      <textarea name="note" onChange={change} rows="10" cols="80" defaultValue={note}></textarea>,
    buttons:
      <Fragment>
        <button onClick={() => submit(id)}>Submit</button>
        <button onClick={close}>Nevermind</button>
      </Fragment>
  }
}

function courseDeleteModal(length, closeModal, row, remove) {
  if (length > 0) {
    return {
      body: <h3>You must remove all class registrations first.</h3>,
      buttons: <button onClick={closeModal}>OK</button>
    }
  } else {
    return {
      body:
        <Fragment>
          <h4>Are you sure you want to delete {row.name}?</h4>
          <p>(this is permenent - you cannot undo it and you will lose all data)</p>
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => remove(row)}>Delete it</button>
        </Fragment>
    }
  }
}

function imageUploadModal(fileHandler, upload, row, closeModal) {
  return {
    body:
      <Fragment>
        <h3>Upload An Image</h3>
        {/* form encType must be set this way to take in a file */}
        <form encType="multipart/form-data">
          <Input
            type="file"
            name="file"
            onChange={fileHandler}
          />
        </form>
      </Fragment>,
    buttons:
      <Fragment>
        <button onClick={() => upload(row)}>Submit</button>
        <button onClick={closeModal}>I'm done</button>
      </Fragment>
  }
}

function cancelRegistrationModal(row, closeModal, cancelReg) {
  if (row.hasPaid === "True") {
    return {
      body: <h4>You must refund the customer's money before you can remove their class registration.</h4>,
      buttons: <button onClick={closeModal}>OK</button>
    }
  } else {
    return {
      body: <h4>Are you sure you want to remove this customer's class registration?</h4>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => cancelReg(row._original)}>Yes, Remove It</button>
        </Fragment>
    }
  }
}

function rentalDeleteModal(pastRentals, reservations, closeModal, retireRental, row, deleteRental) {
  if (pastRentals.length > 0) {
    return {
      body:
        <Fragment>
          <h4>Items with Past Rental records cannot be deleted.</h4>
          <p>Would you like to retire the item?</p>
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => retireRental(row)}>Retire it</button>
        </Fragment>
    }
  } else if (reservations.length > 0) {
    return {
      body: <h3>You must remove all reservations for this item first.</h3>,
      buttons: <button onClick={closeModal}>OK</button>
    }
  } else {
    return {
      body:
        <Fragment>
          <h3>Warning!</h3><br />
          <h4>Are you sure you want to delete {row.name}?</h4>
          <p>(this is permenent - you cannot undo it and you will lose all data)</p><br />
          <h4>Would you rather retire the item and keep the data?</h4>
          <p>(make sure you contact customers and change any existing reservations)</p><br />
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => retireRental(row)}>Retire it</button>
          <button onClick={() => deleteRental(row)}>Delete it</button>
        </Fragment>
    }
  }
}

function displayImagesModal(images, row, remove) {
  return {
    body:
      <Fragment>
        {images.map(image => (
          <div key={image._id} className="rental-img-div">
            <p>Uploaded {dateFns.format(image.uploadDate, 'MMM Do YYYY hh:mm a')} </p>
            <img className="rental-img" src={`file/image/${image.filename}`} alt="rental condition" />
            <button onClick={() => remove(image._id, row)}>Delete</button>
          </div>
        ))}
      </Fragment>
  }
}

function cancelReservationModal(row, closeModal, cancelRes) {
  if (row.hasPaid === "True") {
    return {
      body: <h4>You must refund the customer's money before you can cancel this reservation.</h4>,
      buttons: <button onClick={closeModal}>OK</button>
    }
  } else {
    return {
      body: <h4>Are you sure you want to cancel the reservation?</h4>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => cancelRes(row._original)}>Yes, Cancel It</button>
        </Fragment>
    }
  }
}

function saleItemDeleteModal(row, closeModal, removeSale) {
  return {
    body:
      <Fragment>
        <h3>Warning!</h3>
        <h4>Are you sure you want to delete {row.name}?</h4>
        <p>(this is permenent - you cannot undo it)</p>
      </Fragment>,
    buttons:
      <Fragment>
        <button onClick={closeModal}>Nevermind</button>
        <button onClick={() => removeSale(row)}>Delete it</button>
      </Fragment>
  }
}

function changePasswordModal(row, handleChange, formSubmit) {
  return {
    body:
      <Fragment>
        <h3>Change User Password</h3>
        <Input
          name="password"
          onChange={handleChange}
          type="text"
          label="Password:"
        />
      </Fragment>,
    buttons: <button onClick={() => formSubmit(row)}>Submit</button>
  }
}

function userRemoveModal(row, closeModal, deactivate, banUser, deleteUser) {
  const { registrations, reservations, pastRentals } = row;

  if (pastRentals.length > 0) {
    return {
      body:
        <Fragment>
          <h4>Customers with Past Rental records cannot be deleted.</h4>
          <p>Would you like to deactivate the account or ban the customer?</p>
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => deactivate(row)}>Deactivate</button>
          <button onClick={() => banUser(row)}>Ban User</button>
        </Fragment>
    }
  } else if (registrations.length > 0 || reservations.length > 0) {
    return {
      body: <h3>You must remove all reservations and class registrations for this user before you can delete them.</h3>
    }
  } else {
    return {
      body:
        <Fragment>
          <h4>Are you sure you want to delete {row.firstName} {row.lastName}?</h4>
          <p>(this is permanent - you cannot undo it and you will lose all data)</p>
          <h4>Would you rather deactivate the account (or -gasp!- ban the user) and keep the data?</h4>
        </Fragment>,
      buttons:
        <Fragment>
          <button onClick={closeModal}>Nevermind</button>
          <button onClick={() => deactivate(row)}>Deactivate</button>
          <button onClick={() => banUser(row)}>Ban User</button>
          <button onClick={() => deleteUser(row)}>Delete</button>
        </Fragment>
    }
  }
}

export {
  getNoteModal,
  courseDeleteModal,
  imageUploadModal,
  cancelRegistrationModal,
  rentalDeleteModal,
  loadingModal,
  displayImagesModal,
  cancelReservationModal,
  saleItemDeleteModal,
  changePasswordModal,
  userRemoveModal,
  delayModal,
}