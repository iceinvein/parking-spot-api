const express = require('express');
const {
  addSpot,
  deleteSpot,
  claimSpot,
  listAllUnclaimedSpots,
  listMyClaimedSpots,
  unClaimSpot,
  listMySpots,
} = require('../controllers/spot');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/add', protect, addSpot);
router.delete('/:id/delete', protect, deleteSpot);
router.post('/:id/claim', protect, claimSpot);
router.post('/:id/unClaim', protect, unClaimSpot);
router.get('/listAllUnclaimedSpots', protect, listAllUnclaimedSpots);
router.get('/listMyClaimedSpots', protect, listMyClaimedSpots);
router.get('/listMySpots', protect, listMySpots);

module.exports = router;
