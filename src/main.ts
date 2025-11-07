import { Environment } from "environment";

new Environment()
    .initialize()
    .then(env => {
        env.startup();
    });





