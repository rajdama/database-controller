const DatabaseConnectSimplifier = require("../connectdb/index");
const Joi = require("joi");

const firebaseConfig = {
  type: "firebase",
  serviceAccount: require("../service-account.json"),
  options: {
    apiKey: "AIzaSyDSbZNO-jwG8ln0BkbeTmML9eLTLcSuuuY",
    authDomain: "db-test-4ffbf.firebaseapp.com",
    databaseURL:
      "https://db-test-4ffbf-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "db-test-4ffbf",
    storageBucket: "db-test-4ffbf.appspot.com",
    messagingSenderId: "900751158093",
    appId: "1:900751158093:web:5ec410f791cbf029086504",
    measurementId: "G-272FES7CSP",
  },
};

async function main() {
  const dbConnector = new DatabaseConnectSimplifier(firebaseConfig);

  await dbConnector.connect();

  await dbConnector.createCollection("person", {
    id: Joi.string().optional(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  await dbConnector.createDocument("person", {
    name: "raj",
    email: "raj.com",
  });

  const users = await dbConnector.readCollection("person");
  console.log(users);

  // await dbConnector.updateCollection(
  //   "person",
  //   { field: "name", value: "raj" },
  //   { email: "new.email@example.com" }
  // );

  await dbConnector.deleteCollection("person");

  await dbConnector.disconnect();
}

main();
