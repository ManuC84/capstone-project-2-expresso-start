const express = require("express");
const employeesRouter = express.Router();
const sqlite3 = require("sqlite3");
const timesheetsRouter = require("./timesheets");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//MOUNT TIMESHEETS ROUTER
employeesRouter.use("/:employeeId/timesheets", timesheetsRouter);

//VALIDATE FUNCTION
const validateEmployee = (req, res, next) => {
  const { name, position, wage } = req.body.employee;
  req.name = name;
  req.position = position;
  req.wage = wage;
  req.isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!req.name || !req.position || !req.wage) {
    return res.sendStatus(400);
  } else {
    next();
  }
};

//EMPLOYEE PARAMS
employeesRouter.param("employeeId", (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (err, id) => {
    if (err) {
      next(err);
    } else if (id) {
      req.employeeId = id;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

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
employeesRouter.post("/", validateEmployee, (req, res, next) => {
  const query = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)`;
  const values = {
    $name: req.name,
    $position: req.position,
    $wage: req.wage,
    $isCurrentEmployee: req.isCurrentEmployee,
  };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM Employee WHERE id = ${this.lastID}`,
        (err, newEmployee) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ employee: newEmployee });
          }
        }
      );
    }
  });
});

//GET BY ID HANDLER
employeesRouter.get("/:employeeId", (req, res, next) => {
  res.status(200).json({ employee: req.employeeId });
});

//UPDATE BY ID HANDLER
employeesRouter.put("/:employeeId", validateEmployee, (req, res, next) => {
  const query = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId`;
  const values = {
    $name: req.name,
    $position: req.position,
    $wage: req.wage,
    $isCurrentEmployee: req.isCurrentEmployee,
    $employeeId: req.params.employeeId,
  };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
        (err, updatedEmployee) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ employee: updatedEmployee });
          }
        }
      );
    }
  });
});

//DELETE BY ID HANDLER
employeesRouter.delete("/:employeeId", (req, res, next) => {
  const query = `UPDATE Employee SET is_current_employee = $isCurrentEmployee WHERE id = ${req.params.employeeId}`;
  const values = { $isCurrentEmployee: 0 };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
        (err, deletedEmployee) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ employee: deletedEmployee });
          }
        }
      );
    }
  });
});

module.exports = employeesRouter;
