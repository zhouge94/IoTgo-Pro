const request = require('supertest');
const express = require('../../app');

const app = express();

describe('GET /api/user/device', function () {
    it('response with json', function (done) {
        request(app)
            .get('/api/user/device')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 123afdsfddsf')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                return done();
            });
    });
});
