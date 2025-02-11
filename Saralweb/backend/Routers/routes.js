const app= require('express');
const router = app.Router();
const controller= require('../Controllers/controllers');

router.get("/analyze-logs/:datestamps", controller.AnalayzeLogs)
router.get("/get-top-ef-ips/:datestamps", controller.Get_Top_85);
router.get("/get-top-so-ips/:datestamps", controller.Get_Top_70);


module.exports = router;