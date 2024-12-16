import * as http from "http";
import app from "./app";
import env from "./config/env.config";
import cron from 'node-cron';
import adminBroadcastController from "./controllers/admin/admin.broadcast.controller";
import orderController from "./controllers/order.controller";

const server = http.createServer(app);

// Schedule cron job to send notification
// cron.schedule('* * * * *', () => {
//     console.log('Checking for scheduled notifications...');
    
//     adminBroadcastController.sendScheduledBroadcast().catch((error) => {
//         console.error('Error sending scheduled notifications:', error);
//     });

//     orderController.sendOrderNotifications().catch((error) => {
//         console.error('Error sending order notifications:', error);
//     });
// });

server.listen(env.port, () => {
	console.log(`Listening on port ${env.port}`);
});
