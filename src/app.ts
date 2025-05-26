import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger-output.json';
const app = express();

import { initializeAdmin } from './config/firebaseConfig.js';
import { router } from './routes';

dotenv.config();

// FOR WEBHOOK handler 
// app.use('/webhook/fern', express.raw({ type: 'application/json', limit: '10mb' }));

// app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => res.send('QAYA Backend!'));

initializeAdmin();

app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(cors());

app.use('/api/v1', router);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
