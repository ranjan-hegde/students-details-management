const Event = require('../models/Event');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 */
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get events, optionally filtered by month (YYYY-MM)
 * @route   GET /api/events
 * @query   month (YYYY-MM)
 */
exports.getEvents = async (req, res, next) => {
  try {
    const { month } = req.query;
    const filter = {};

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999);
      filter.eventDate = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(filter)
      .sort({ eventDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single event by ID
 * @route   GET /api/events/:id
 */
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event by ID
 * @route   PUT /api/events/:id
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event by ID
 * @route   DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
