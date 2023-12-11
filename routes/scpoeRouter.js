const express = require("express");
const router = express.Router();
const scopeController = require ("../controllers/scopeController");
const verifyToken = require("../config/verifyToken");

//insert new scope//
router.post('/add',verifyToken,scopeController.scope_create)
router.get('/data',verifyToken,scopeController.scope_getAll)
/////get,update,delete by id////
router.get('/data/:id',verifyToken,scopeController.scope_getById)
router.patch('/update/:id',verifyToken,scopeController.scope_updateById)
router.delete('/delete/:id',verifyToken,scopeController.scope_deleteById)


module.exports= router


