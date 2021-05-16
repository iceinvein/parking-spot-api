const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const User = require('../src/models/User');
const server = require('../src/server');

const expect = chai.expect;

chai.use(chaiHttp);
// chai.use(require('chai-like'));
// chai.use(require('chai-things'));

let jwt;

describe('User', function () {
  before(function (done) {
    User.deleteMany({}, (err) => {
      done();
    });
  });
  describe('registration', function () {
    it('should not be allowed without details', function (done) {
      chai
        .request(server)
        .post('/api/v1/auth/register')
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error.firstname).to.eq('First Name is required');
          expect(res.body.error.lastname).to.eq('Last Name is required');
          expect(res.body.error.email).to.eq('Email is required');
          expect(res.body.error.password).to.eq('Password is required');
          done();
        });
    });
    it('should not be allowed if password is less than eight characters', function (done) {
      const user = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: faker.internet.email(),
        password: 'random',
      };
      chai
        .request(server)
        .post('/api/v1/auth/register')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error.password).to.eq('Password length required: 8');
          done();
        });
    });
    it('should not be allowed if email cannot be validated', function (done) {
      const user = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: 'email',
        password: 'random1234',
      };
      chai
        .request(server)
        .post('/api/v1/auth/register')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error.email).to.eq('Invalid email address');
          done();
        });
    });
    it('should be allowed if all details are complete', function (done) {
      const user = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: 'fakeguy@fakecompany.com',
        password: 'random1234',
      };
      chai
        .request(server)
        .post('/api/v1/auth/register')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('id');
          done();
        });
    });
    it('should not be allowed if user with email already exists', function (done) {
      const user = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: 'fakeguy@fakecompany.com',
        password: 'random1234',
      };
      chai
        .request(server)
        .post('/api/v1/auth/register')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.eq('Duplicate Error');
          done();
        });
    });
  });
  describe('login', function () {
    it('should not be allowed if username and/or password are not supplied', function (done) {
      chai
        .request(server)
        .post('/api/v1/auth/login')
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.eq('Please provide an email and password');
          done();
        });
    });
    it('should not be allowed if password does not match', function (done) {
      const user = {
        email: 'fakeguy@fakecompany.com',
        password: 'random',
      };
      chai
        .request(server)
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.error).to.eq('Login Failed.');
          done();
        });
    });
    it('should be allowed if username and password match', function (done) {
      const user = {
        email: 'fakeguy@fakecompany.com',
        password: 'random1234',
      };
      chai
        .request(server)
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          jwt = res.body.data.jwt;
          expect(res.status).to.eq(200);
          expect(res.body.data.email).to.eq(user.email);
          expect(res.body.data).to.have.property('jwt');
          done();
        });
    });
  });
  describe('once logged in', function () {
    it('should allow user to view their details', function (done) {
      chai
        .request(server)
        .get('/api/v1/auth/currentUser')
        .set({ Authorization: `Bearer ${jwt}` })
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data.email).to.eq('fakeguy@fakecompany.com');
          done();
        });
    });
    it('should allow user to logout', function (done) {
      chai
        .request(server)
        .get('/api/v1/auth/logout')
        .set({ Authorization: `Bearer ${jwt}` })
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq('User logged out.');
          done();
        });
    });
  });
});
