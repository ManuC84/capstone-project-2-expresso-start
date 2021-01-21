const express = require("express");
const employeesRouter = express.Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//GET HANDLER
employeesRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM Employee WHERE is_current_employee = 1`,
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ employees: employees });
      }
    }
  );
});

//POST HANDLER
employeesRouter.post("/", (req, res, next) => {});

module.exports = employeesRouter;
