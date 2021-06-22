const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Spot = require('../models/Spot');

// @desc Add a new available spot
// @route POST /api/v1/spot/add
// @access Private
exports.addSpot = asyncHandler(async (req, res, next) => {
  const {
    body: { number },
    body: { availableDate },
    user: { email },
  } = req;

  try {
    const spot = await Spot.create({
      number,
      availableDate,
      owner: email,
    });

    res.status(200).json({
      success: true,
      // eslint-disable-next-line no-underscore-dangle
      id: spot._id,
    });
  } catch (error) {
    next(error);
  }
});

// @desc Get spot info
// @route GET /api/v1/spot/:id
// @access Private
exports.getInfo = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  try {
    const spot = await Spot.findOne({
      _id: id,
    });

    res.status(200).json({
      spot,
    });
  } catch (error) {
    next(error);
  }
  next();
});

// @desc Delete a spot
// @route DELETE /api/v1/spot/:id
// @access Private
exports.deleteSpot = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    user: { email },
  } = req;

  try {
    const spot = await Spot.findOneAndDelete({
      _id: id,
      owner: email,
    });

    if (spot) {
      res.status(200).json({
        success: true,
      });
    } else {
      next(new ErrorResponse('User not allowed to delete this spot.', 400));
    }
  } catch (error) {
    next(error);
  }
});

// @desc Claim a spot
// @route POST /api/v1/spot/:id/claim
// @access Private
exports.claimSpot = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    user: { email },
  } = req;

  try {
    const spot = await Spot.findOne({
      _id: id,
    });
    if (!spot.claimedBy) {
      await Spot.updateOne(
        {
          _id: id,
        },
        {
          claimedBy: email,
        }
      );

      res.status(200).json({
        success: true,
      });
    } else {
      next(new ErrorResponse('Spot cannot be claimed.', 400));
    }
  } catch (error) {
    next(error);
  }
  next();
});

// @desc Get all available spots
// @route GET /api/v1/spot/listAllUnclaimedSpots
// @access Private
exports.listAllUnclaimedSpots = asyncHandler(async (req, res, next) => {
  try {
    const spots = await Spot.find({
      $or: [{ claimedBy: { $exists: false } }, { claimedBy: null }],
    });

    res.status(200).json(spots);
  } catch (error) {
    next(error);
  }
  next();
});

// @desc Get all my claimed spots
// @route GET /api/v1/spot/listMyClaimedSpots
// @access Private
exports.listMyClaimedSpots = asyncHandler(async (req, res, next) => {
  const {
    user: { email },
  } = req;

  try {
    const spots = await Spot.find({ claimedBy: email });

    res.status(200).json(spots);
  } catch (error) {
    next(error);
  }
  next();
});

// @desc Get all my claimed spots
// @route GET /api/v1/spot/listMySpots
// @access Private
exports.listMySpots = asyncHandler(async (req, res, next) => {
  const {
    user: { email },
  } = req;

  try {
    const spots = await Spot.find({ owner: email });

    res.status(200).json(spots);
  } catch (error) {
    next(error);
  }
  next();
});

// @desc Unclaim a spot
// @route POST /api/v1/spot/:id/unClaim
// @access Private
exports.unClaimSpot = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  try {
    const spot = await Spot.findOne({
      _id: id,
    });
    if (spot.claimedBy) {
      await Spot.updateOne(
        {
          _id: id,
        },
        {
          claimedBy: null,
        }
      );

      res.status(200).json({
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
  next();
});
