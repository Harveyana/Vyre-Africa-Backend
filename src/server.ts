import * as http from "http";
import app from "./app";
import env from "./config/env.config";
import cron from 'node-cron';
import adminBroadcastController from "./controllers/admin/admin.broadcast.controller";
import orderController from "./controllers/order.controller";
import paystackService from "./services/paystack.service";

const server = http.createServer(app);

// Schedule cron job to send notification
// cron.schedule('* * * * *', () => {
//     console.log('Checking for scheduled notifications...');
    
//     paystackService.getAllBanks().catch((error) => {
//         console.error('Failed to process banks', error);
//     });
// });
// paystackService.getAllBanks()
//   .then(() => {
//     console.log('Banks fetched and saved successfully.');
//   })
//   .catch((error) => {
//     console.error('Failed to process banks:', error);
// });


server.listen(env.port, () => {
	console.log(`Listening on port ${env.port}`);
});
