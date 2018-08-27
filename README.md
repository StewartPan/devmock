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
    ##### Options:
    the `config.js` file contains the following options:
    *  `targetUrl`: url string of target server you want to proxy to. If you want to record the response from target server, you need to specify this option.
    *  `requestMatcher`: array of strings that identify the desired request, eg: `[/devmock/abc, /users/api/*, /example/**/blabla]`, it supports glob `*` and "Globstar" `**` matching. you can refer this [minimatch](https://github.com/isaacs/minimatch) for details.
    *  `overwrite`: true/false, whether overwrite recorded response.
    *  `serverPort`: number, port number for mock server.
    *  `wsPort`: number, port number for websocket mock server(unfinished).
    *  `mstrMode`: true/false, true for MicrotStrategy internal use, false for standard use.
    *  `https`: true/false, true for using https, false for http.
    *  `routes`: array of objects. route is identification for the request. In our design, the key of route is a string generated using request method name + request.url.pathname in standard mode, which is also the path to corresponding responses json file. the value is also the same if user just want to replay. you can change the value to the url to which you want this specific to proxy, it is useful when you want to use recorded data and 3rd party api in the same time.
    
*  **Start**

    After finishing configuration, using the following command to start mock server:
    
    ```
    devmock server -d configFolderPath
    ```
 
    `server`: start devmock as http/https server, you can also use `ws` for websocket(unavailable right now).
    
    `-d`: specify the absolute/relative directory where `config.js` is located.
    
*  **Replay && Multi-proxy**
  
    After you recorded API responses(they will be stored as `json` file in specified dir, if the response is compressed, it will be decompressed. supports `gzip` and `deflate` encoding. when replay it will be compressed using original encoding), their corresponding routes will be written in `routes` in `config.js` like following:
    
    ```
          routes[
                //{"POST/devmock/User/info":"POST/devmock/User/info"},
                //{"GET/devmock/User/info":"GET/devmock/User/info"}

        replay -> {"POST/devmock/User/info":"POST/devmock/User/info"},
                  {"GET/devmock/User/info":"GET/devmock/User/info"}
          ]
        
   multi-proxy -> {"POST/devmock/User/info":"https://github.com"},
                   {"GET/devmock/User/info":"https://www.npmjs.com/package/devmock"}
    ```
    if you want to replay this response, just uncomment it and restart the mock server.
* **Mock**

	After user create the `config.js` in specifed folder, it will automatically create folder named `MockData` in the same folder, user can add the mock data in `MockData` in JSON format, each JSON file contains one request-response pair and follows below format:
	
	```javascript
	{
		"request": {
			"headers": {
				"method": "POST",
				"pathname": "/API/ABC",
				"Cache-Control": "no-cache",
				"Connection": "keep-alive",
				"Content-Length": 143,
				"Content-type": "application/x-www-form-urlencoded",
				"Cookie": "I like coconut cookie"
			},
			"body": {
				"para1": 444,
				"para2": 111
			}
		},
		"response": {
			"headers": {
				"Content-Encoding": "gzip"
			},
			"body": {
				"devmock": "aloha from hawaii"
			}
		}
	}
	
	``` 

	Then you can use the following command to load the mock data:
	
	```shell
	devmock load -d MockDataFolderPath
	```
	
	After loading mock data then `config.js` will automatically add the coresponding routes.
	
	Note: the `method` and `pathname` in request headers are required and case-sensitive. You can add other [keywords](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) in headers. 
## Miscellaneous

* The devmock `routes` option design adopts idea from [NetEase-NEI](https://github.com/NEYouFan/nei-toolkit). the `routes` options privides flexibility about whether using mock/recorded response or proxy to target server or third-party API(still in developing).
* About MSTR internal, the difference between `mstrMode` and standard use is how to generate route for request to be recorded or mocked. standard mode use request.headers.method + request.url.pathanme to generate route, `mstrMode` use MD5 hash-code of string [request.headers.method + request.url.pathanme + request.body(after filtering unnecessary properties such as timestamp, MstrWeb)] to specify the request/response pair. The reason behind this is that MSTR web use non-RESTFul API design, and most of properties in request body are useful for the future requests.
