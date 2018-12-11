/* Copyright (c) 2018 Jeffrey Meng | 1.0.0 | MIT License */
(function(window) {
	"use strict";

	function define() {

		//utility
		function isFunction(functionToCheck) {
			return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
		}
		function serialize(obj) {//map object into a query string
			if (obj == undefined) {
				return "";
			}
			var str = [];
			for (var p in obj)
				if (obj.hasOwnProperty(p) && obj[p] != undefined) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
			return str.join("&");
		}
		function ajaxGET(options) {


			var request = new XMLHttpRequest();
			request.open("GET", options.url + (options.url.indexOf("?") > -1 ? "" : "?") +  serialize(options.parameters), true);//scync request

			request.setRequestHeader('Content-Type', options.contentType);

			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					// Success!
					var response = request.responseText;
					if (isFunction(options.success)) options.success(response);
				} else {
					// We reached our target server, but it returned an error
					var response = request.responseText;//may not exist
					if (isFunction(options.error)) options.error(response)

				}
				if (isFunction(options.always)) options.always(response);
			};

			request.onerror = function() {
				// There was a connection error of some sort
				var response = request.responseText;//may not exist
				options.error(response)
			};

			request.send();

		}

		var GitHubRepoCrawler = function(owner, name, options) {
			if (!(this instanceof GitHubRepoCrawler)) {
				return new GitHubRepoCrawler(url, options);
			}

			//different call signature based on parameters
			if (options) {
				options.name = name;
				options.owner = owner;
			} else if (name) {
				if (typeof name === "string") {
					options = {
						name:name
					}
				} else {
					options = name;
				}
				options.owner = owner;
			} else {
				options = owner;
			}

			this.TYPE = "type";
			this.EXTENSION = "extension";
			this.PATH = "path";


			this._listeners = {

			};
			this._listeners[this.TYPE] = {};
			this._listeners[this.EXTENSION] = {};
			this._listeners[this.NAME] = {};
			this.on = function(type, name, callback) {
				var names = name.split(" ");
				for (var i = 0; i < names.length; i ++) {
					if (this._listeners[type] == undefined) {
						this._listeners[type] = {};
					} else if (this._listeners[type][names[i]] == undefined) {
						this._listeners[type][names[i]] = new Array(1).fill(callback);
					} else {
						this._listeners[type][names[i]].push(callback);
					}
				}
			}
			this.onType = function(name, callback) {
				this.on(this.TYPE, name, callback);
			}
			this.onExtension = function(name, callback) {
				this.on(this.EXTENSION, name, callback);
			}
			this.onName = function(name, callback) {
				this.on(this.NAME, name, callback);
			}
			this.off = function(type, name, callback) {
				var names = name.split(" ");
				for (var i = 0; i < names.length; i ++) {
					if (this._listeners[type] == undefined || this._listeners[type][names[i]] == undefined) {
						continue;
					}
					for (var j = 0; j < this._listeners[type][names[i]].length; j ++) {
						if (this._listeners[type][names[i]][j] == callback) {
							this._listeners[type][names[i]].splice(j, 1);
						}
					}
				}
			}
			this.offType = function(name, callback) {
				this.off(this.TYPE, name, callback);
			}
			this.offExtension = function(name, callback) {
				this.off(this.EXTENSION, name, callback);
			}
			this.offName = function(name, callback) {
				this.off(this.NAME, name, callback);
			}

			this.crawl = function(crawl) {
				if (crawl == false) return;
				var _this = this;
				function crawl(depth, url) {
					ajaxGET({
						url:url,
						contentType:"application/vnd.github.v3+json",
						parameters:{
							ref:options.ref
						},
						success:function(response) {
							var data = JSON.parse(response);
							var i, j, type, extension, currentFile, fileOptions, fileData;
							for (i = 0; i < data.length; i ++) {
								currentFile = data[i];

								type = currentFile.type;
								name = currentFile.name;
								path = currentFile.path;
								extension = name.split(".")[name.split(".").length - 1];
								fileData = {
									name:name,
									path:currentFile.path,
									type:type,
									extension:extension,
									depth:depth,
									githubURL:currentFile.html_url,
									rawURL:currentFile.download_url,
									githubData:currentFile
								};

								fileOptions = {
									enterDirectory:true,
									stopCrawl:false
								}


								//loop through listeners
								if (_this._listeners.type[type]) {
									for (j = 0; j < _this._listeners.type[type].length; j++) {
										fileOptions = _this._listeners.type[type][j](fileData) || fileOptions;
									}
								}

								if (_this._listeners.extension[extension]) {
									for (j = 0; j < _this._listeners.extension[extension].length; j++) {
										fileOptions = _this._listeners.extension[extension][j](fileData) || fileOptions;
									}
								}
								if (_this._listeners.path[path]) {
									for (j = 0; j < _this._listeners.path[path].length; j++) {
										fileOptions = _this._listeners.path[path][j](fileData) || fileOptions;
									}
								}

								if (fileOptions.stopCrawl) break;

								if (type == "dir" && fileOptions.enterDirectory) {
									crawl(depth + 1, currentFile.url);
								}
							}


						},
						error:function(response) {
							var data = JSON.parse(response);
							//console.log(data);
							throw new Error("GitRepoCrawler: GET Request failed.")

						}
					})
				}
				crawl(0, `https://api.github.com/repos/${owner}/${name}/contents`);
			}

		}

		return GitHubRepoCrawler;
	}
	window.GitHubRepoCrawler = define();
})(window);