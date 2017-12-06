'use strict';

const uuid = require('uuid');
const fetch = require('node-fetch');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
AWS.config.setPromisesDependency(require('bluebird'));

//Save new file
module.exports.save = (event, context, callback) => {

  const report = (error, data) => callback(null, {
          statusCode: error ? 400 : 200,
          headers: {
              'x-custom-header' : 'custom header value',
              "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
          },
          body: error ? error.message : JSON.stringify(data)
  });


  let requestBody = JSON.parse(event.body);
  const filename = requestBody.key;
  const description = requestBody.description;
  const imageurl = requestBody.imageurl;

  fetch(imageurl)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      return Promise.reject(new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`));
    })
    .then(response => response.buffer())
    .then(buffer => {
      //Upload to S3
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: filename,
        Body: buffer,
      }).promise()
      .then(response => {
        //Upload to dynamo
        submitFileP(fileInfo(filename, description))
      }).catch(err => report(err));
    }).catch(err => report(err));
};

const submitFileP = file => {
  console.log('Submitting file');
  const fileInfo = {
    TableName: process.env.FILES_TABLE,
    Item: file,
  };
  return dynamoDb.put(fileInfo).promise()
    .then(res => file);
};

const fileInfo = (filename, description) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    filename: filename,
    description: description,
    submittedAt: timestamp,
  };
};

//Get all files
module.exports.list = (event, context, callback) => {
  const report = (error, data) => callback(null, {
          statusCode: error ? 400 : 200,
          headers: {
              'x-custom-header' : 'custom header value',
              "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
          },
          body: error ? error.message : JSON.stringify(data)
      });

      dynamoDb.scan({"TableName": process.env.FILES_TABLE}).promise()
      .then(res => report(null, res))
      .catch(err => report(err));
};
