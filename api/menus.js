const express = require("express");
const menuRouter = express.Router();
const sqlite3 = require("sqlite3");
const menuItemsRouter = require("./menuItems");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//MOUNT MENUITEMS ROUTER
menuRouter.use("/:menuId/menu-items", menuItemsRouter);

//VALIDATE FUNCTION
const validateMenu = (req, res, next) => {
  const { title } = req.body.menu;
  req.title = title;

  if (!req.title) {
    return res.sendStatus(400);
  } else {
    next();
  }
};

//MENU PARAMS
menuRouter.param("menuId", (req, res, next, id) => {
  db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, menuId) => {
    if (err) {
      next(err);
    } else if (menuId) {
      req.menuId = menuId;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//GET HANDLER
menuRouter.get("/", (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menu) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menu });
    }
  });
});

//POST HANDLER
menuRouter.post("/", validateMenu, (req, res, next) => {
  const query = `INSERT INTO Menu (title) VALUES ($title)`;
  const values = { $title: req.title };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, newMenu) => {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ menu: newMenu });
        }
      });
    }
  });
});

//GET BY ID HANDLER
menuRouter.get("/:menuId", (req, res, next) => {
  res.status(200).json({ menu: req.menuId });
});

//UPDATE BY ID HANDLER
menuRouter.put("/:menuId", validateMenu, (req, res, next) => {
  const query = `UPDATE Menu SET title = $title WHERE id = $menuId`;
  const values = {
    $title: req.title,
    $menuId: req.params.menuId,
  };
  db.run(query, values, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
        (err, updatedMenu) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ menu: updatedMenu });
          }
        }
      );
    }
  });
});

//DELETE BY ID HANDLER
menuRouter.delete("/:menuId", (req, res, next) => {
  db.get(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, menuItem) => {
      if (err) {
        next(err);
      } else if (menuItem) {
        return res.sendStatus(400);
      } else {
        const query = `DELETE FROM Menu WHERE id = ${req.params.menuId}`;
        db.run(query, function (err) {
          if (err) {
            next(err);
          } else {
            res.sendStatus(204);
          }
        });
      }
    }
  );
});

module.exports = menuRouter;
