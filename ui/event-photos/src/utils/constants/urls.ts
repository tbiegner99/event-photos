const BASE_URL = '/events';
export const urls = {
    BASE_URL,
    ADMIN: BASE_URL + '/admin',
    ADMIN_EVENT: BASE_URL + '/admin/event/:eventId',
    EVENTS: BASE_URL + '/:eventId',
    event: (eventId: string) => `${BASE_URL}/${eventId}`,
    adminEvent: (eventId: string) => `${BASE_URL}/admin/event/${eventId}`
};
