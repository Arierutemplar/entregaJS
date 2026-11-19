import EventsService from '../services/events.service.js';

export async function getEvents(req, res, next) {
  try {
    const events = await EventsService.list();
    res.status(200).json({
      status: 'success',
      payload: events,
    });
  } catch (error) {
    next(error);
  }
}
