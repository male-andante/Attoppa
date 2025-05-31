import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import server from '../../server.js';
import userModel from '../models/userModel.js';

let mongoServer;

// Setup e Teardown
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Pulizia del database dopo ogni test
afterEach(async () => {
    await userModel.deleteMany({});
});

// Test dati
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!',
    fullname: 'Test User'
};

const adminUser = {
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'Admin123!',
    fullname: 'Admin User',
    isAdmin: true
};

describe('Auth Routes', () => {
    describe('POST /auth/register', () => {
        it('dovrebbe registrare un nuovo utente', async () => {
            const res = await request(server)
                .post('/auth/register')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', testUser.email);
            expect(res.body.user).not.toHaveProperty('password');
            expect(res.body.redirectTo).toBe('/');
        });

        it('dovrebbe registrare un nuovo admin', async () => {
            const res = await request(server)
                .post('/auth/register')
                .send(adminUser);

            expect(res.status).toBe(201);
            expect(res.body.user.isAdmin).toBe(true);
            expect(res.body.redirectTo).toBe('/dashboard');
        });

        it('non dovrebbe registrare un utente con email duplicata', async () => {
            // Prima registrazione
            await request(server)
                .post('/auth/register')
                .send(testUser);

            // Tentativo di registrazione con stessa email
            const res = await request(server)
                .post('/auth/register')
                .send({
                    ...testUser,
                    username: 'differentuser'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email già registrata');
        });

        it('non dovrebbe registrare un utente con username duplicato', async () => {
            // Prima registrazione
            await request(server)
                .post('/auth/register')
                .send(testUser);

            // Tentativo di registrazione con stesso username
            const res = await request(server)
                .post('/auth/register')
                .send({
                    ...testUser,
                    email: 'different@example.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Username già in uso');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Registra un utente per i test di login
            await request(server)
                .post('/auth/register')
                .send(testUser);
        });

        it('dovrebbe effettuare il login con credenziali valide', async () => {
            const res = await request(server)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data.token');
            expect(res.body.data.user).toHaveProperty('email', testUser.email);
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('non dovrebbe effettuare il login con password errata', async () => {
            const res = await request(server)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Credenziali non valide');
        });

        it('non dovrebbe effettuare il login con email non esistente', async () => {
            const res = await request(server)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Credenziali non valide');
        });

        it('dovrebbe richiedere email e password', async () => {
            const res = await request(server)
                .post('/auth/login')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email e password sono obbligatori');
        });
    });

    describe('GET /auth/verify', () => {
        let token;

        beforeEach(async () => {
            // Registra e logga un utente per ottenere il token
            const registerRes = await request(server)
                .post('/auth/register')
                .send(testUser);
            token = registerRes.body.token;
        });

        it('dovrebbe verificare un token valido', async () => {
            const res = await request(server)
                .get('/auth/verify')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.message).toBe('Token valido');
        });

        it('non dovrebbe verificare un token non valido', async () => {
            const res = await request(server)
                .get('/auth/verify')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Token non valido');
        });

        it('dovrebbe richiedere il token', async () => {
            const res = await request(server)
                .get('/auth/verify');

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Token non fornito');
        });
    });
}); 