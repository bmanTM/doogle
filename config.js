const settings = {
    port: process.env.PORT || 3011,
    wsPort: 3010,
    apiRoute: "/api",
    dogAPI: {
        refreshTime: 1, /* minutes */
        apiAll: 'https://dog.ceo/api/breeds/list/all',
        apiRoot: 'https://dog.ceo/api',
    },
    boredAPI: {
        apiRoot: 'http://www.boredapi.com/api',
    },
}

export default settings;
