const express = require("express");
const menuItemsRouter = express.Router({ mergeParams: true });
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//MENUITEMS ROUTE PARAM
menuItemsRouter.param("menuItemId", (req, res, next, id) => {
  db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (err, menuItemId) => {
    if (err) {
      next(err);
    } else if (menuItemId) {
      req.menuItemId = menuItemId;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//MENUITEM VALIDATION
const menuItemValidate = (req, res, next) => {
  const { name, description, inventory, price, menuId } = req.body.menuItem;
  req.name = name;
  req.description = description;
  req.inventory = inventory;
  req.price = price;
  req.menuId = menuId;
  if (!req.name || !req.description || !req.inventory || !req.price) {
    res.sendStatus(400);
  } else {
    next();
  }
};

//GET TIMESHEET HANDLER
menuItemsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ menuItems: menuItems });
      }
    }
  );
});

//POST MENUITEMS HANDLER
menuItemsRouter.post("/", menuItemValidate, (req, res, next) => {
  const query = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;
  const values = {
    $name: req.name,
    $description: req.description,
    $inventory: req.inventory,
    $price: req.price,
    $menuId: req.params.menuId,
  };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM menuItem WHERE id = ${this.lastID}`,
        (err, menuItem) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ menuItem: menuItem });
          }
        }
      );
    }
  });
});

//PUT TIMESHEETS HANDLER
menuItemsRouter.put("/:menuItemId", menuItemValidate, (req, res, next) => {
  const query = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId`;
  const values = {
    $name: req.name,
    $description: req.description,
    $inventory: req.inventory,
    $price: req.price,
    $menuId: req.params.menuId,
    $menuItemId: req.params.menuItemId,
  };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
        (err, updatedMenuItem) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ menuItem: updatedMenuItem });
          }
        }
      );
    }
  });
});

//MENUITEM DELETE HANDLER
menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
  const query = `DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`;
  db.run(query, function (err) {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
