module.exports = {
    apps: [{
        name: "Test_service_node",
        script: "./dist/server.js",
        instances: 2,
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
