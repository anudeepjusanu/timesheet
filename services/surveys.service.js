var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('surveys');
db.bind('users');

var service = {};

service.create = create;
service.getAll = getAll;
module.exports = service;

function create(survey) {
    var deferred = Q.defer();
    var surveyObj = {
        name: survey.name,
        description: survey.description,
        createdBy: survey.createdBy,
        questions: survey.questions,
        results: [],
        createdOn: new Date(),
        updatedOn: new Date()
    }
    db.surveys.insert(
        surveyObj,
        function (err, survey) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(survey);
            deferred.resolve(survey.ops[0]);
        });
    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();
    db.surveys.find().toArray(function (err, surveys) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (surveys) {
            deferred.resolve(surveys);
        } else {
            // project not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}