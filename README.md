## extension-release

This package will create github release for extension and help in uploading extension to chrome web store and addon mozilla org

### Install

`yarn add extension-release`

or

`npm install --save extension-release`

### Usage

- In CLI

  `extension-release --repo <repo_name> --owner <owner_name> --path <manifest.json file path>`

- As a module

  ```javascript
  const release = require("extension-release");

  // As a promise
  const promise = new Promise((resolve, reject) => release({
      path: "<manifest.json file path>",
      repo: "<repo>"
      owner: "<owner>"
  })
  .fork(reject, resolve))

  ```

### Options

```
This package will create github release for extension

Usage
  $ extension-release <options>
  --path, -p        Path of the manifest.json
  --repo, -r        Repository in which github release should be created
  --owner, -o       Owner of the repository who has push permissions

```

### Related packages

- [release-github](https://www.npmjs.com/package/release-github) - Package for creating the github release
