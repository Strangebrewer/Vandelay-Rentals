import React, { Fragment } from "react";
import dateFns from "date-fns";

function parseCellData(cellId, cellIndex, state) {
  let cellData = { __html: state[cellIndex][cellId] };
  if (cellId === 'date' || cellId === 'dateAcquired') {
    cellData = {
      //  When you enter a new date that's not in unix time, the below format renders it as "Invalid Date"
      //  As a result, in the split second before the database updates, the field says "Invalid Date"
      //  So, if invalid date, just display what's being typed in. Otherwise, display the formatted version.
      __html: (
        dateFns.format(state[cellIndex][cellId] * 1000, 'MMM Do YYYY') === "Invalid Date"
          ? state[cellIndex][cellId]
          : dateFns.format(state[cellIndex][cellId] * 1000, 'MMM Do YYYY'))
    }
  }

  if (cellId === 'phone') {
    const phone = state[cellIndex][cellId];
    cellData = { __html: `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6, 10)}` };
  }

  if (
    cellId === 'pricePer' ||
    cellId === 'rate' ||
    cellId === 'parsedPrice' ||
    cellId === 'parsedCost' ||
    cellId === 'parsedSale'
  ) {
    cellData = {
      //  When you enter a new price that includes anything other than digits (e.g. a dollar sign)
      //  It renders as 'NaN', which shows in the cell for just a second before the change
      //  So, if the cell includes 'NaN', just render what's already in the cell
      //  Otherwise, display the formatted price.
      __html: (
        `$${parseFloat(state[cellIndex][cellId]).toFixed(2)}`.includes('NaN')
          ? state[cellIndex][cellId]
          : `$${parseFloat(state[cellIndex][cellId]).toFixed(2)}`
      )
    }
  }
  return cellData;
}

function parseRowUpdate(row, close, setModal, loading, level, condition, saleType, status, category, standing) {

  const updateObject = {};
  const useDate = row.date || row.dateAcquired || null;

  let unixDate;
  if (useDate && typeof useDate === "string") unixDate = dateFns.format(useDate, "X");
  else unixDate = dateFns.format(useDate * 1000, "X");

  if ((useDate && useDate < 6) || unixDate === "Invalid Date") {
    return setModal({
      body:
        <Fragment>
          <h4>Please enter a valid date format</h4>
          <p>(e.g. '01/25/2016' or 'Dec 14 2012')</p>
        </Fragment>,
      buttons: <button onClick={close}>OK</button>
    })
  }
  //  wait until here to trigger the loading modal - after the date has been validated - otherwise, the loadingmodal must be closed again inside the "if (dateAcquired.length...)" block, and the timing is such that the loading modal just ends up staying open.
  loading();

  // if the below exist (they should, but to avoid an error, checking first...) and they haven't been changed, they will be a number type because the formatting occurs in the renderEditablePrice function (the actual value remains a number type until they are changed) and so the .split method doesn't exist (that's a string method)
  function nonfloatPrice(existingPrice) {
    if (existingPrice) {
      if (typeof existingPrice === "string") return existingPrice.split("").filter(x => x !== "$").join("");
      return existingPrice;
    }
  }
  const newPricePer = nonfloatPrice(row.pricePer);
  const newRate = nonfloatPrice(row.rate);

  function floatPrice(existingPrice) {
    if (existingPrice) {
      if (typeof existingPrice === "string") return parseFloat(existingPrice.split("").filter(x => x !== "$").join(""));
      return existingPrice
    }
  }

  const newCost = floatPrice(row.parsedCost);
  const newPrice = floatPrice(row.parsedPrice);
  const newSale = floatPrice(row.parsedSale);

  function getNew(newThing, thing) {
    if (newThing) return newThing;
    return thing;
  }

  const newLevel = getNew(level, row.level);
  const newCondition = getNew(condition, row.condition);
  const newSaleType = getNew(saleType, row.saleType);
  const newStatus = getNew(status, row.status);
  const newCategory = getNew(category, row.category);
  const newStanding = getNew(standing, row.standing);

  let adminStr;
  if (typeof row.admin === 'string' || row.admin instanceof String)
    adminStr = row.admin.toLowerCase();
  else if (row.admin === false) adminStr = "false";
  else if (row.admin === true) adminStr = "true";

  if (row.name) updateObject.name = row.name;
  if (row.date) updateObject.date = unixDate;
  if (row.dateAcquired) updateObject.dateAcquired = unixDate;
  if (row.level) updateObject.level = newLevel;
  if (row.pricePer) updateObject.price = newPricePer;
  if (row.slots) updateObject.slots = row.slots;
  if (row.condition) updateObject.condition = newCondition;
  if (row.rate) updateObject.dailyRate = newRate;
  if (row.maker) updateObject.maker = row.maker;
  if (row.sku) updateObject.sku = row.sku;
  if (row.timesRented) updateObject.timesRented = row.timesRented;
  if (row.cost) updateObject.cost = newCost;
  if (row.parsedSale) updateObject.finalSale = newSale;
  if (row.parsedPrice) updateObject.price = newPrice;
  if (saleType) updateObject.saleType = newSaleType;
  if (status) updateObject.status = newStatus;
  if (category) updateObject.category = newCategory;
  if (row.admin) updateObject.admin = adminStr;
  if (standing) updateObject.standing = newStanding;
  if (row.city) updateObject.city = row.city;
  if (row.email) updateObject.email = row.email;
  if (row.firstName) updateObject.firstName = row.firstName;
  if (row.lastName) updateObject.lastName = row.lastName;
  if (row.phone) updateObject.phone = row.phone;
  if (row.state) updateObject.state = row.state;
  if (row.street) updateObject.street = row.street;
  if (row.zipcode) updateObject.zipcode = row.zipcode;
  if (row.username) updateObject.username = row.username;

  return updateObject;
}

export {
  parseCellData,
  parseRowUpdate,
}