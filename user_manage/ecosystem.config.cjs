module.exports = { //eslint-disable-line
    apps: [{
        name: "User_management",
        script: "./dist/index.js",
        instances: 1,
        autorestart: false,
        watch: ["src"],
        ignore_watch: ["node_modules"],
        max_memory_restart: "1G",
        //   env: {
        //     NODE_ENV: "development",
        //   },
        //   env_production: {
        //     NODE_ENV: "production",
        //   }
    }]
};
