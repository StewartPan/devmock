# devmock
A mock server for web development which decouples frontend and backend developers and improve development efficiency.

> Record, mock, and proxy HTTP/HTTPS traffic as middleware for Web development.

## Installation

devmock can be installed via npm with the following command.

```shell
npm install devmock -g
```

## Overview

The purpose of this middleware is to provide an easy way for front-end developers to mock response of back-end APIs that are currently unavailable or record HTTP responses returned by their API (or some other remote source) and then be able replay the responses in the future(eg: off-line use).

### Usage

* **Configuration**
    devmock is convenient to use, but first you need to set-up configuration in `config.js`, which can be generate by following command:
    ```shell
    devmock init -y -d somedirectory
    ```
    `-y` (optional), if you use  `-y` flag, it will automatically generate the `config.js` in specified dir using default setting, otherwise you need to input the config setting in terminal prompt.
    `-d` (required), specify the directory in which you want to store the config file and recorded responses. you can input absolute/relative path(relative to current dir),.
    ##### Options
    the `config.js` file contains the following options:
    *  `targetUrl`: url string of target server you want to proxy to. If you want to record the response from target server, you need to specify this option.
    *  `requestMatcher`: array of strings that identify the desired request, eg: `[/devmock/abc, /users/api/*, /example/**/blabla]`, it supports glob `*` and 'Globstar' `**` matching. you can refer this [minimatch](https://github.com/isaacs/minimatch) for details.
    *  `overwrite`: true/false, whether overwrite recorded response.
    *  `serverPort`: number, port number for mock server.
    *  `wsPort`: number, port number for websocket mock server(unfinished).
    *  `mstrMode`: true/false, true for MicrotStrategy internal use, false for standard use.
    *  `https`: true/false, true for using https, false for http.
    *  `routes`: array of string. each time devmock record a new response, or user creates a new http/https request/response pair, it will write a route into the route array. In our design, the route is a string generated using request method name + request.url.pathname, which also leads to the path to the corresponding responses.
* **Start**
after finishing configuration, using the following command to start mock server:
    ```shell
    devmock server -d somedirectory
    ````
    `server`: start devmock as http/https server, you can also use `ws` for websocket(unavailable right now).
    `-d`: specify the absolute/relative directory where `config.js` is located.
* **Replay**
    After you recorded API responses(they will be stored as `json` file in specified dir, if the response is compressed, it will be decompressed. supports `gzip` and `deflate` encoding. when replay it will be compressed using original encoding), their corresponding routes will be written in `routes` in `config.js` like following:
    ```javascript
        routes[
              //"POST/devmock/User/info"
              //"GET/devmock/User/info"

            -> "POST/devmock/User/info"
               "GET/devmock/User/info"
        ]
    ```
    if you want to replay this response, just uncomment it and restart the mock server.
* **Mock**
To be continued.

## Miscellaneous

* The devmock `routes` option design adopts idea from [NetEase-NEI](https://github.com/NEYouFan/nei-toolkit). the `routes` options privides flexibility about whether using mock/recorded response or proxy to target server/third-party API(still in developing).
* About MSTR internal, the difference between `mstrMode` and standard use is how to generate route for request to be recorded or mocked. standard mode use request.headers.method + request.url.pathanme to generate route, `mstrMode` use MD5 hash-code of string [request.headers.method + request.url.pathanme + request.body(after filtering unnecessary properties such as timestamp)] to specify the request/response pair. The reason behind this is that MSTR web use non-RESTFul API design, and most of properties in request body are important.
