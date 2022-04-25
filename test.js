import 'should';
import app from './index.js';
import supertest from 'supertest';

const server = app.listen();
const request = supertest.agent(server);

describe('Backend Test', function() {
    after(function() {
        server.close();
    });

    describe('Testing site served at root', function() {
        it('should receive html', function(done) {
            request
            .get('/')
            .expect('Content-Type', /html/)
            .expect(200, function(err) {
                if (err) return done(err);
                return done();
            });
        });
    });

    describe('Testing DogAPI image fetch for /breed/subbreed', function() {
        it('should receive image url', function(done) {
            request
            .get('/api/dog/terrier/american')
            .expect('Content-Type', /json/)
            .expect(200, function(err, res) {
                if (err) return done(err);
                res.should.be.text;
                res.text.should.containEql(`"message":"http`);
                return done();
            });
        });

        it('should receive 404 for invalid url', function(done) {
            request
            .get('/api/dog/terrior/american')
            .expect('Content-Type', /text/)
            .expect(404, function(err, res) {
                if (err) return done(err);
                return done();
            })
        }) 
    });

    describe('Testing DogAPI image fetch for /breed', function() {
        it('should receive image url', function(done) {
            request
            .get('/api/dog/bulldog')
            .expect('Content-Type', /json/)
            .expect(200, function(err, res) {
                if (err) return done(err);
                res.should.be.text;
                res.text.should.containEql(`"message":"http`);
                return done();
            });
        });

        it('should return 404 for invalid url', function(done) {
            request
            .get('/api/dog/bullldog')
            .expect('Content-Type', /text/)
            .expect(404, function(err, res) {
                if (err) return done(err);
                return done();
            })
        }) 
    });

    describe('Testing DogAPI query', function() {
        it('should redirect to correct breed/subbreed', function(done) {
            request
            .get('/api/redirect/dog/american_terrier')
            .expect('Content-Type', /html/)
            .expect(302, function(err, res) {
                if (err) return done(err);
                res.text.should.containEql(`/terrier/american`);
                return done();
            });
        });
    });

    describe('Testing DogAPI when query invalid', function() {
        it('should return list of suggestions', function(done) {
            request
            .get('/api/redirect/dog/american_terrior')
            .expect('Content-Type', /json/)
            .expect(400, function(err, res) {
                if (err) return done(err);
                res.text.should.containEql(`"predictedWord":`);
                res.text.should.containEql(`"accuracy":`);
                return done();
            });
        });
    });

    describe('Testing BoredAPI response', function() {
        it('should return a random activity', function(done) {
            request
            .get('/api/activity/random')
            .expect('Content-Type', /json/)
            .expect(200, function(err, res) {
                if (err) return done(err);
                res.text.should.containEql(`"activity":`);
                res.text.should.containEql(`"type":`);
                res.text.should.containEql(`"participants":`);
                res.text.should.containEql(`"price":`);
                res.text.should.containEql(`"accessibility":`);
                return done();
            });
        });
    });
});