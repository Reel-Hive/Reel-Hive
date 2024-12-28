module.exports = {
    apps: [
        {
            name: "ReelHive",
            script: "server.js",
            node_args: "-r dotenv/config --experimental-json-modules",
            env: {
                NODE_ENV: "production",
                // Add other environment variables here if needed
            },
        },
    ],
};

