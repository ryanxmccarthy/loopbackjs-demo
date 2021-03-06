// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

"use strict";

const loopback = require("loopback");
const boot = require("loopback-boot");

const app = (module.exports = loopback());

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit("started");
    const baseUrl = app.get("url").replace(/\/$/, "");
    console.log("Web server listening at: %s", baseUrl);
    if (app.get("loopback-component-explorer")) {
      const explorerPath = app.get("loopback-component-explorer").mountPath;
      console.log("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) app.start();
});

app.models.account.find((err, result) => {
  if (result.length === 0) {
    const user = {
      email: "ryan@test.com",
      password: "test",
      username: "nick",
    };

    app.models.account.create(user, (err, result) => {
      console.log("Tried to create user", err, result);
    });
  }
});

app.models.account.afterRemote("create", (ctx, account, next) => {
  console.log("New User is", account);
  app.models.Profile.create(
    {
      first_name: account.username,
      created_at: new Date(),
      userId: account.id,
    },
    (err, result) => {
      if (!err && result) {
        console.log("Created new profile", result);
      } else {
        console.log("There is an error", err);
      }
      next();
    }
  );
});
