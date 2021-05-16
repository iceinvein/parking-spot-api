const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const Spot = require('../src/models/Spot');
const User = require('../src/models/User');
const server = require('../src/server');
const async = require('async');

const expect = chai.expect;

chai.use(chaiHttp);

const users = {
  creator: {
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(8),
  },
  claimer: {
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(8),
  },
};
const spots = [
  {
    number: '22',
    availableDate: new Date().toISOString().slice(0, 10),
  },
  {
    number: '25',
    availableDate: new Date(new Date().getDate() + 4)
      .toISOString()
      .slice(0, 10),
  },
];

let spotIds = [];

describe('Spot', function () {
  before(async function () {
    Spot.deleteMany({}, (err) => {
      User.deleteMany({}, (err) => {
        chai
          .request(server)
          .post('/api/v1/auth/register')
          .send(users.creator)
          .end((err, res) => {
            chai
              .request(server)
              .post('/api/v1/auth/register')
              .send(users.claimer)
              .end();
          });
      });
    });
  });
  describe('add', function () {
    it('should not allow to add if user is not logged in', function (done) {
      chai
        .request(server)
        .post('/api/v1/spot/add')
        .send(spots[0])
        .end((err, res) => {
          expect(res.status).to.be.eq(401);
          done();
        });
    });
    it('should not allow to add if either spot number or available date is not present', function (done) {
      let jwt;
      chai
        .request(server)
        .post('/api/v1/auth/login')
        .send({ email: users.creator.email, password: users.creator.password })
        .end((err, res) => {
          jwt = res.body.data.jwt;
          async.series(
            [
              function (cb) {
                chai
                  .request(server)
                  .post('/api/v1/spot/add')
                  .set({ Authorization: `Bearer ${jwt}` })
                  .send({
                    availableDate: new Date().toISOString().slice(0, 10),
                  })
                  .end((err, res) => {
                    expect(res.status).to.be.eq(400);
                    expect(res.body.error.number).to.be.eq(
                      'Please provide spot number.'
                    );
                    cb();
                  });
              },
              function (cb) {
                chai
                  .request(server)
                  .post('/api/v1/spot/add')
                  .set({ Authorization: `Bearer ${jwt}` })
                  .send({ number: '22' })
                  .end((err, res) => {
                    expect(res.status).to.be.eq(400);
                    expect(res.body.error.availableDate).to.be.eq(
                      'Available date is required.'
                    );
                    cb();
                  });
              },
            ],
            done
          );
        });
    });
    it('should allow to add if user is logged in and details are valid', function (done) {
      let jwt;
      chai
        .request(server)
        .post('/api/v1/auth/login')
        .send({ email: users.creator.email, password: users.creator.password })
        .end((err, res) => {
          jwt = res.body.data.jwt;
          async.series(
            [
              function (cb) {
                chai
                  .request(server)
                  .post('/api/v1/spot/add')
                  .set({ Authorization: `Bearer ${jwt}` })
                  .send(spots[0])
                  .end((err, res) => {
                    expect(res.status).to.be.eq(200);
                    expect(res.body).to.have.property('id');
                    spotIds.push(res.body.id);
                    cb();
                  });
              },
              function (cb) {
                chai
                  .request(server)
                  .post('/api/v1/spot/add')
                  .set({ Authorization: `Bearer ${jwt}` })
                  .send(spots[1])
                  .end((err, res) => {
                    expect(res.status).to.be.eq(200);
                    spotIds.push(res.body.id);
                    cb();
                  });
              },
            ],
            done
          );
        });
    });
  });
});
