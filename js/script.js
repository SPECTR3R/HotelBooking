
//--------seatBookingAlgo is core logic of the script. other part is for UI purpose----// 
var seatBookingAlgo = (function() {
  return {
     // return roomNumber for particular start-date and end-date. return blank is no room found     
    getRoomNoforDates: function(startDate, endDate, roomToDay2DArray) {
      var raw = true;
      var roomNo;
      for (var i = 0; i < roomToDay2DArray.length; i++) {
        raw = true;
        for (var j = startDate; j <= endDate; j++) {
          if (roomToDay2DArray[i][j] != 1) {
            raw = false;
            break;
          }
        }
        if (raw) {
          roomNo = i;
          break;
        }
      }
      if (typeof roomNo !== "undefined") {
        for (var i = startDate; i <= endDate; i++) {
          console.log(roomNo);

          roomToDay2DArray[roomNo][i] = 0;
        }
      }
      return roomNo;
    },

    // call above function iteratively for each set of dates. return successful and failed booking to caller
    bookTheRoomForDates: function(
      successfulBookingDates,
      dates,
      roomToDay2DArray,
      roomsOFpreviousSuccessfulDates
    ) {
      
      var failedBooking = [];
      var statusarray = [];
      var room;

      for (var i = 0; i < dates.length; i = i + 2) {
        console.log(successfulBookingDates);

        room = this.getRoomNoforDates(dates[i], dates[i + 1], roomToDay2DArray);
        if (!(typeof room !== "undefined")) {
          failedBooking.push(dates[i]);
          failedBooking.push(dates[i + 1]);
        } else {
          successfulBookingDates.unshift(dates[i + 1]);
          successfulBookingDates.unshift(dates[i]);
          roomsOFpreviousSuccessfulDates.unshift(room);
        }
      }
      statusarray[0] = failedBooking;

      return statusarray;
    }
  };
})();

//--------------------store Hotel booking data and call algorithm definded above to process it------------------//

var HotelDataController = (function(algo) {
  var data = {
    hotelRooms: 0,
    successfulBookingDates: [],
    roomNumsForSuccessfulBookingDates: [],
    roomToDay2DArray: [[]]    
  };

  // main data structure to hold booking information. all rooms available(1) in starting.
  function createRoomToDayArray(rows, cols, defaultvalue) {
    var arr = [];

    for (var i = 0; i < rows; i++) {
      arr.push([]);
      arr[i].push(new Array(cols));
      for (var j = 0; j < cols; j++) {
        arr[i][j] = defaultvalue;
      }
    }
    return arr;
  }

  return {
    setHotelRooms: function(hotelRooms) {
      console.log("Locked Number of Hotel rooms");
      data.hotelRooms = hotelRooms;
      data.roomToDay2DArray = createRoomToDayArray(hotelRooms, 365, 1);
    },
    getHotelRooms: function() {
      return data.hotelRooms;
    },
    // controller will call this function to get status of booking
    doBooking: function(dates) {
      var statusarray = algo.bookTheRoomForDates(
        data.successfulBookingDates,
        dates,
        data.roomToDay2DArray,
        data.roomNumsForSuccessfulBookingDates
      );
      return statusarray;
    },

    getRoomToDay2DArray: function() {
      return data.roomToDay2DArray;
    },
    getSuccessfulBookingDates: function() {
      return data.successfulBookingDates;
    },
    getRoomsForSuccessfulBookingDates: function() {
      return data.roomNumsForSuccessfulBookingDates;
    }
  };
})(seatBookingAlgo);

// -------------------------- UI Controller to get data from UI and update data on UI --------------------//

var UIcontroller = (function() {
   // reusable DOM element.if it is changed we can replace here. no need to update all references     
  var DOMstrings = {
    numberOfRoom: ".no-of-room",  
    startDate: ".start-date",
    endDate: ".end-date",
    submitButton: ".submit-btn",
    resetBooking: ".reset-booking",    
    bookingContainer: ".booking-container",
    createHotel: ".create-hotel",
    hotelRoomInputError: ".alert-hotel-room",
    createHotelDiv: ".create-hotel-div",
    arrayStyleInput: ".array-style-input",
    toggleCheckbox: ".toggle-checkbox",
    dayStyleInput: ".day-style-input",
    arrayDates: ".array-dates",
    alertDateInput: ".alert-date-input",
    dateError: ".date-error",
    alertArrayInput: ".alert-array-input",
    arrayError: ".array-error",
    notifyContainer: ".notify-container",
    notification: ".notification",
    inputFields: ".input-fields"    
  };

  return {
    getDOMstrings: function() {
      return DOMstrings;
    },

    // not showing input dates fields till Number of Hotel Rooms are locked.
    WaitForNumberOfRooms: function() {
      document.querySelector(DOMstrings.bookingContainer).style.display =
        "none";
      document.querySelector(DOMstrings.hotelRoomInputError).style.display =
        "none";
      document.querySelector(DOMstrings.arrayStyleInput).style.display = "none";
      document.querySelector(DOMstrings.notifyContainer).style.display = "none";

      document.querySelector(DOMstrings.alertArrayInput).style.display = "none";
      document.querySelector(DOMstrings.alertDateInput).style.display = "none";

      document.querySelector(DOMstrings.notifyContainer).style.display = "none";
    },

    getHotelRooms: function() {
      var hotelRooms = document.querySelector(DOMstrings.numberOfRoom).value;
      return hotelRooms;
    },
    displayInvalidHotelRoomError() {
      document.querySelector(DOMstrings.hotelRoomInputError).style.display =
        "block";
    },
    displayInvalidDateError(error) {
      if (document.querySelector(DOMstrings.toggleCheckbox).checked == true) {
        document.querySelector(DOMstrings.arrayError).textContent = error;
        document.querySelector(DOMstrings.alertArrayInput).style.display =
          "block";
      } else {
        document.querySelector(DOMstrings.dateError).textContent = error;
        document.querySelector(DOMstrings.alertDateInput).style.display =
          "block";
      }
    },
    displayHotelBookingForm: function(numberOfRooms) {
      document.querySelector(DOMstrings.hotelRoomInputError).style.display =
        "none";
      document.querySelector(DOMstrings.createHotelDiv).style.display = "none";
      document.querySelector(
        DOMstrings.numberOfRoom
      ).placeholder = numberOfRooms;
      document.querySelector(DOMstrings.numberOfRoom).readOnly = true;
      document.querySelector(DOMstrings.bookingContainer).style.display =
        "block";
      document.querySelector(DOMstrings.toggleCheckbox).click();

    },
    // can give booking date as array or one start-date end-date combination
    changeInputStyle: function() {
      if (document.querySelector(DOMstrings.toggleCheckbox).checked == true) {
        document.querySelector(DOMstrings.arrayStyleInput).style.display =
          "block";
        document.querySelector(DOMstrings.dayStyleInput).style.display = "none";
        document.querySelector(DOMstrings.alertDateInput).style.display =
          "none";
      } else {
        document.querySelector(DOMstrings.arrayStyleInput).style.display =
          "none";
        document.querySelector(DOMstrings.dayStyleInput).style.display =
          "block";
        document.querySelector(DOMstrings.alertArrayInput).style.display =
          "none";
      }
    },

    getDatesFromUI: function() {
      document.querySelector(DOMstrings.alertArrayInput).style.display = "none";
      document.querySelector(DOMstrings.alertDateInput).style.display = "none";
      if (document.querySelector(DOMstrings.toggleCheckbox).checked == true) {
        var dates = document
          .querySelector(DOMstrings.arrayDates)
          .value.trim()
          .split(" ")
          .map(function(item) {
            var integer = parseInt(item, 10);
            if (!isNaN(integer)) {
              return integer;
            }
          });

        return dates;
      } else {
        var dates = [];
        var startdate = parseInt(
          document.querySelector(DOMstrings.startDate).value,
          10
        );
        var endDate = parseInt(
          document.querySelector(DOMstrings.endDate).value,
          10
        );

        dates.push(startdate);
        dates.push(endDate);
        console.log(dates);
        return dates;
      }
    },

    clearDateFieldsAfterSuccessfulBooking: function() {
      document.querySelector(DOMstrings.startDate).value = "";
      document.querySelector(DOMstrings.endDate).value = "";
      document.querySelector(DOMstrings.arrayDates).value = "";
    },

    displayNotificationAfterFailedBooking: function() {
      document.querySelector(DOMstrings.notifyContainer).style.display =
        "block";
      document
        .querySelector(DOMstrings.notification)
        .classList.add("alert-danger");
      document.querySelector(DOMstrings.notification).textContent =
        "Booking Not Possible";
    },

    clearNotifications: function() {
      console.log("entered");
      document
        .querySelector(DOMstrings.notification)
        .classList.remove("alert-success");
      document.querySelector(DOMstrings.notifyContainer).style.display = "none";
      document.querySelector(DOMstrings.alertArrayInput).style.display = "none";
      document.querySelector(DOMstrings.alertDateInput).style.display = "none";
    },
    

    displayNotificationAfterSuccessfulBooking: function(
      statusarray,
      previousSuccessfulDates,
      roomsOFpreviousSuccessfulDates
    ) {
      document.querySelector(DOMstrings.notifyContainer).style.display =
        "block";
      document
        .querySelector(DOMstrings.notification)
        .classList.add("alert-success");
      var text = "All booking successful </br>";
      text = text + " Date-->Room: </br> ";
      var rooms = roomsOFpreviousSuccessfulDates;
      var j = 0;
      for (var i = 0; i < previousSuccessfulDates.length; i = i + 2) {
        text =
          text +
          "[" +
          previousSuccessfulDates[i] +
          "," +
          previousSuccessfulDates[i + 1] +
          "]-->" +
          rooms[j++] +
          "</br> ";
      }

      document.querySelector(DOMstrings.notification).innerHTML = text;
    },
    displayBookedAndFailedDates: function(
      statusarray,
      previousSuccessfulDates,
      roomsOFpreviousSuccessfulDates
    ) {
      this.clearDateFieldsAfterSuccessfulBooking();
      document.querySelector(DOMstrings.notifyContainer).style.display =
        "block";
      document
        .querySelector(DOMstrings.notification)
        .classList.add("alert-info");
      var text = "";
      var rooms = roomsOFpreviousSuccessfulDates;
      if (statusarray[0].length == 0) {
        text = "ALL Booking successfull </br>";
        console.log("x" + statusarray[1]);
      }

      if (statusarray[0].length != 0) {
        text = text + "</br>";
        text = text + "Booking failed dates: </br>";
        for (var i = 0; i < statusarray[0].length; i = i + 2) {
          text =
            text +
            "[" +
            statusarray[0][i] +
            "," +
            statusarray[0][i + 1] +
            "] </br> ";
        }
        text = text + "</br>";
      }

      if (previousSuccessfulDates.length != 0) {
        var j = 0;
        text = text + "Successful Booking </br>";
        text = text + "Date-->Room: </br> ";
        for (var i = 0; i < previousSuccessfulDates.length; i = i + 2) {
          text =
            text +
            "[" +
            previousSuccessfulDates[i] +
            "," +
            previousSuccessfulDates[i + 1] +
            "]->" +
            rooms[j++] +
            "</br> ";
        }
        text = text + "</br>";
      }
      document.querySelector(DOMstrings.notification).innerHTML = text;
    }
  };
})();

// -------------------------------------Controller to work as intermediator between UIcontroller and Data controller--------------------

var controller = (function(seatCtrl, UICtrl) {
  var DOM = UICtrl.getDOMstrings();

  //main event listners in one function. like submit button. input type change events. 
  var setupEventListeners = function() {
    document
      .querySelector(DOM.submitButton)
      .addEventListener("click", roomBookingController);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        roomBookingController();
      }
    });

    document
      .querySelector(DOM.createHotel)
      .addEventListener("click", registerHotelRooms);
    document
      .querySelector(DOM.toggleCheckbox)
      .addEventListener("click", UICtrl.changeInputStyle);
    document
      .querySelector(DOM.resetBooking)
      .addEventListener("click", function() {
        if (confirm("Are you sure? All booking data will be lost")) {
          document.location.reload();
        }
      });

    var elementsArray = document.querySelectorAll(DOM.inputFields);
    elementsArray.forEach(function(elem) {
      elem.addEventListener("focus", UICtrl.clearNotifications);
    });
  };

  // check if date is not negative, blank, string, start-date>end-date, and not>364
  var validateDates = function(dates) {
    if (isNaN(dates[0])) {
      UICtrl.displayInvalidDateError(
        "Date should be Number, it can not be blank"
      );
      return false;
    } else if (dates.length % 2 != 0) {
      UICtrl.displayInvalidDateError(
        "number of start date and end date does not match"
      );
      return false;
    } else {
      for (var i = 0; i < dates.length; i = i + 2) {
        if (isNaN(dates[i]) || isNaN(dates[i + 1])) {
          console.log("here:" + typeof dates[i] + "," + typeof dates[i + 1]);
          UICtrl.displayInvalidDateError(
            "date should be Number and can not be blank"
          );
          return false;
        } else if (dates[i] < 0 || dates[i + 1] < 0) {
          UICtrl.displayInvalidDateError("date can not be negative");
          return false;
        } else if (dates[i] > 364 || dates[i + 1] > 364) {
          UICtrl.displayInvalidDateError(
            "date can not be greater than 364.enter between 0-364. check date no. " +
              i
          );
          return false;
        } else if (dates[i] > dates[i + 1]) {
          console.log("x " + dates[i] + " " + dates[i + 1]);
          UICtrl.displayInvalidDateError(
            "start date can not be greater than the end date. check date no. " +
              i
          );
          return false;
        }
      }
    }
    return true;
  };

  var roomBookingController = function() {
    if (seatCtrl.getHotelRooms() <= 0) {
      registerHotelRooms();
    } else {
      var dates = UICtrl.getDatesFromUI();
      if (validateDates(dates)) {
        var statusarray = HotelDataController.doBooking(dates);
        if (statusarray[0].length != 0) {
          UICtrl.displayBookedAndFailedDates(
            statusarray,
            seatCtrl.getSuccessfulBookingDates(),
            seatCtrl.getRoomsForSuccessfulBookingDates()
          );
        } else {
          console.log("successful booking");
          UICtrl.clearDateFieldsAfterSuccessfulBooking();
          UICtrl.displayNotificationAfterSuccessfulBooking(
            statusarray,
            seatCtrl.getSuccessfulBookingDates(),
            seatCtrl.getRoomsForSuccessfulBookingDates()
          );
        }
      }
    }
  };

  // check if NumberOfHotelRomes > 0 and <= 1000
  var registerHotelRooms = function() {
    var hotelroom = UICtrl.getHotelRooms();
    if (hotelroom <= 0 || hotelroom > 1000) {
      UICtrl.displayInvalidHotelRoomError();
    } else {
      seatCtrl.setHotelRooms(hotelroom);
      UICtrl.displayHotelBookingForm(hotelroom);
      document.querySelector(DOM.startDate).focus();
    }
  };

  return {
    init: function() {
      console.log("Application Has started");
      UICtrl.WaitForNumberOfRooms();
      setupEventListeners();
    }
  };
})(HotelDataController, UIcontroller);

//----------starting point of the app--------//
controller.init();
