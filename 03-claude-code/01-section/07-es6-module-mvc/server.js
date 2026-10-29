import http from 'node:http';
import { handleRequest } from './router.js';

export const server = http.createServer(handleRequest);
