const express = require("express");
const timesheetsRouter = express.Router({ mergeParams: true });
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//TIMESHEETS ROUTE PARAM
timesheetsRouter.param("timesheetId", (req, res, next, id) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (err, timesheetId) => {
    if (err) {
      next(err);
    } else if (timesheetId) {
      req.timesheetId = timesheetId;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//TIMESHEET VALIDATION
const validateTimesheet = (req, res, next) => {
  const { hours, rate, date } = req.body.timesheet;
  req.hours = hours;
  req.rate = rate;
  req.date = date;
  if (!req.hours || !req.rate || !req.date) {
    res.sendStatus(400);
  } else {
    next();
  }
};

//GET TIMESHEET HANDLER
timesheetsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ timesheets: timesheets });
      }
    }
  );
});

//POST TIMESHEET HANDLER
timesheetsRouter.post("/", validateTimesheet, (req, res, next) => {
  const query = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`;
  const values = {
    $hours: req.hours,
    $rate: req.rate,
    $date: req.date,
    $employeeId: req.params.employeeId,
  };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
        (err, timesheet) => {
          console.log(timesheet);
          if (err) {
            next(err);
          } else {
            res.status(201).json({ timesheet: timesheet });
          }
        }
      );
    }
  });
});

module.exports = timesheetsRouter;
