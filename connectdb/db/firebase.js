const { initializeApp, applicationDefault } = require("firebase-admin/app");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const Joi = require("joi");

class FirebaseConnector {
  constructor(config) {
    this.config = config;
    this.app = initializeApp({
      credential: admin.credential.cert(config.serviceAccount),
      ...config.options,
    });
    this.db = getFirestore();
  }

  validateSchema(data) {
    const schema = Joi.object(this.schema);
    const { error } = schema.validate(data);
    // console.log(schema.validate(data), );
    if (error) {
      throw new Error(`Schema validation error: ${error.message}`);
    }
  }

  async connect() {
    // Firebase automatically handles connection through initializeApp
    console.log("Firebase connected");
  }

  async createCollection(collectionName, schema) {
    this.schema = schema; // Set schema
    console.log(`Collection ${collectionName} schema set`);
  }

  async createDocument(collectionName, documentData) {
    this.validateSchema(documentData);
    const docRef = this.db.collection(collectionName).doc();
    await docRef.set(documentData);
    console.log("Document inserted successfully");
  }

  async readCollection(collectionName, query = {}) {
    let collectionRef = this.db.collection(collectionName);
    Object.keys(query).forEach((key) => {
      collectionRef = collectionRef.where(key, "==", query[key]);
    });
    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      return [];
    }
    return snapshot.docs.map((doc) => doc.data());
  }

  async updateCollection(collectionName, query, update) {
    const collectionRef = this.db.collection(collectionName);
    const snapshot = await collectionRef
      .where(query.field, "==", query.value)
      .get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshot.forEach((doc) => {
      doc.ref.update(update);
    });
    console.log("Collection updated successfully");
  }

  async deleteCollection(collectionName) {
    const collectionRef = this.db.collection(collectionName);
    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
    console.log("Collection deleted successfully");
  }

  async disconnect() {
    // Firebase doesn't have a disconnect function, but you can clear the app instance if needed
    console.log("Firebase disconnected");
  }
}

module.exports = FirebaseConnector;

// database-connect-simplifier/
// │
// ├──
