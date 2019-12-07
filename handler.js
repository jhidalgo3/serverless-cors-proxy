'use strict';

const request = require('request');

/**
 * Use this command to launch the handler from console:
 *
 * node_modules/.bin/serverless invoke local -f lambda -d '{"httpMethod":"GET","queryStringParameters":{"url":"http://github.com"}}'
 *
 *  or from browser
 *
 * http://localhost:3000/?url=https://github.com
 */
module.exports.corsProxy = async (event, context) => {
    let params = event.queryStringParameters;

    console.log(event);
    console.log(`Got request with params:`, params);

    if (!params.url) {
        const errorResponse = {
            statusCode: 400,
            body: 'Unable get url from \'url\' query parameter'
        };

        callback(null, errorResponse);

        return;
    }

    let originalRequestBody = event.body
    let options = {
        url: params.url, 
        method: event.httpMethod,
        json: event.httpMethod === 'POST' ? JSON.parse(originalRequestBody) : null
      };

    const { response, body } = await requestHandler(options);
    console.log(`Got response from ${params.url} ---> {statusCode: ${response.statusCode}}`);  

    return {
        statusCode: 200,
        body: originalRequestBody ? JSON.stringify(body) : response.body,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
            "content-type": response.headers['content-type']
        },
    }
};

const requestHandler = (options) => new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            reject(error);
        } else {
            console.log(response, body);
            resolve({ response, body });
        }
    });
});