import * as controllers from '../controllers/message_controllers.js';
import { protectRoute } from '../middleware/auth_middleware.js';

const message_routes = {
    '/api/message/users': { 
        GET: [protectRoute, controllers.getUsersForSiderbar],
    },
    '/api/message/:id': {
        GET: [protectRoute, controllers.getMessages],
    },
    '/api/message/send/:id': {
        POST: [protectRoute, controllers.sendMessage],
    }

};

export default message_routes;