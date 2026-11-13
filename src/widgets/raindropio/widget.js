import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
    api: "{url}/rest/v1/{endpoint}",
    proxyHandler: credentialedProxyHandler,

    mappings: {
        user: {
            endpoint: "user"
        },
        collections: {
            endpoint: "collections"
        },
        childCollections: {
            endpoint: "collections/childrens"
        // },
        // tags: {
        //     endpoint: "tags"
        }
    }
};

export default widget;