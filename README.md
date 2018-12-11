# gitRepoCrawler
A simple Javascript github repo crawler that traverses the github repo contents API.

### Installation
You can grab a copy of the `github-repo-crawler.js` from the [releases page](https://github.com/jeffreymeng/gitRepoCrawler/releases), or use
a cdn:
```html
<script src="https://cdn.jsdelivr.net/gh/jeffreymeng/gitRepoCrawler@1.1.2/github-repo-crawler.min.js"></script>
```


### Documentation
```javascript
var crawler = new GitHubRepoCrawler(options);
```
| Options        | Type            | Default                                                  | Description                                                            |
| -------------- | --------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `owner`        | String          | (required)                                               | The user or organization that owns the GitHub repository to be crawled |
| `name`         | String          | (required)                                               | The name of the GitHub repository to be crawled.                       |
| `ref`          | String          | The repositories default branch (usually `master`)       | The name of the commit/branch/tag to be crawled.                       |

Alternatively, create an instance with three parameters:
```javascript
var crawler = new GitHubRepoCrawler(owner, name, options?);
```
If `owner` or `name` is in the optional parameter `options`, it will be ignored.
### API

#### `.crawl(callback?)`
Begins the crawl.
 
 The optional attribute `callback` should contain a function to run when the crawl is complete.


#### `.on(type, value, listener)`
Adds a listener.

Because the crawler is asynchronous, for better performance GitHubRepoCrawler uses listeners,
 which allow the execution of functions when specific conditions are met. There are three types
  of listeners, a `type` listener, an `extension` listener, and a `path` listener (in order from most to least general).
 
Types and values should both be strings.
Value can be either a single value or a space-separated list of values.
If a single value contains a space, spaces can encoded with %20 (the crawler will `decodeURIComponent()` the value).

###### Types
| Name      | Constant     | Value of constant    | Description                                                                                                                                |
| --------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| File Type | `.TYPE`      | `"type"`             | Listens for the type of the file(not extension). There are only two possibilities for the value, `file` or `dir`(directory).               |
| Extension | `.EXTENSION` | `"extension"`        | Listens for the extension of the file(case sensitive). The extension is considered to be the text after the last dot(`.`) in the filename. |
| Path      | `.PATH`      | `"path"`             | Listens for the exact path of the file. This is case sensitive.                                                                            |

The listener is a function that accepts a single parameter, `data`, which is an object of data.
It contains the following fields:

| Name        | Description                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | The name of the file                                                                                                                                                      |
| `path`      | The path to the file within the github repository.                                                                                                                        |
| `type`      | The type of the file (NOT extension), either `file` or `dir`(directory)                                                                                                   |
| `extension` | The extension of the file. The crawler considers the text after the last dot in the name to be the extension.                                                             |
| `depth`     | How deep the folder the file is located in is. The root folder is at depth 0.                                                                                             |
| `githubURL` | The URL to the file in the github repository.                                                                                                                             | 
| `rawURL`    | The URL to the raw file (raw.githubusercontent.com).                                                                                                                      |
| `githubData`| The object containing data from the [github contents API(see response if content is a file)](https://developer.github.com/v3/repos/contents/#get-contents) for that file. |

The listener function can also optionally return an object containing options.

Because mutiple listeners can be called for one file, only the most specific options are preserved.
Specificity is ranked as `type` is more specific than `extension` which is more specific than path
 `path`(most specific). In addition, the order in which the listeners are added serves as a tiebreaker,
 with listeners added later counting as more specific.

| Name             | Description                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enterDirectory` | This can only be returned when the file type is a directory. Returning false means that the crawler will not crawl the resources in the directory.                        |
| `stopCrawl`      | Whether to continue the crawl. If true is returned then the crawl is stopped at the end of this file (assuming it is not overwritten).                                    |

#### `.onType(value, listener)`
A more readable way of typing `.on(crawler.TYPE, value, listener)`.

#### `.onExtension(value, listener)`
A more readable way of typing `.on(crawler.EXTENSION, value, listener)`.

#### `.onPath(value, listener)`
A more readable way of typing `.on(crawler.PATH, value, listener)`.

#### `.off(type, value, listener)`
Removes the listener(s) that are of value `vaue` and exactly match both the type and listener function. 

Note that
values don't necessarily have to be equal. If you listen for value "jpg png" and later
try to remove the "jpg" value, then "png" listeners is not removed, but the "jpg" listeners
with the same function are removed.

#### `.offType(value, listener)`
A more readable way of typing `.off(crawler.TYPE, value, listener)`.

#### `.offExtension(value, listener)`
A more readable way of typing `.off(crawler.EXTENSION, value, listener)`.

#### `.offPath(value, listener)`
A more readable way of typing `.off(crawler.PATH, value, listener)`.

#### `._listeners`
You can access the internal listeners here. It is not recommended to modify this.

### Usage Examples

Make a list of all javascript files in a repository
```html
<script>
var crawler = new GitHubRepoCrawler("jeffreymeng", "gitRepoCrawler");

crawler.onType("dir", function(dir) {
	//skip the contents of folders named ignoreThisFolder
	return {
		enterDirectory:dir.path !== "ignoreThisFolder"
	}
});

var files = [];
var listener = function(file) {
	files.push(file.path);
};
crawler.on(crawler.EXTENSION, "js", listener);

crawler.crawl(function() {
	console.log(files);
});
	
</script>
```

### License
MIT License

Copyright (c) 2018 Jeffrey Meng

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
