const express = require('express');
const router = express.Router();
const { getCompanies, getCompany, getCompanyStats } = require('../controllers/companyController');

router.get('/', getCompanies);
router.get('/:slug', getCompany);
router.get('/:id/stats', getCompanyStats);

module.exports = router;
