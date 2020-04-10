import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as firebaseHelper from 'firebase-functions-helper/dist';
import * as express from 'express';
import * as bodyParser from "body-parser";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));
main.use('/api/v1', app);

const contactsCollection = 'contacts';
const userorderCollection = 'orders';
 

export const webApi = functions.https.onRequest(main);

interface Contact {
    firstName: String
    lastName: String
    email: String
}

interface UserOrder {
    order: [
        {
            title: String,
            type: String,
            description: String,
            price: Number,
            options: [String],
            numOrdered: Number
        },
    ],
    customer: {
        firstname: String,
        lastname: String,
        phone: Number,
        email: String,
        addressln1:String,
        aptste:String ,
        city: String,
        st: String,
        zip: Number,
        additionalinfo: String,
        tip: String,
        cardnum: Number ,
        exprymonth:String ,
        expryyr: String,
        cvv: String,
        cardholdername: String
    },
    status: {
        preparing: Boolean,
        prepared: Boolean,
        delivering: Boolean,
        delivered: Boolean
    }
}



// Add new userorder
app.post('/orders', async (req, res) => {
    try {
        const neworder: UserOrder = {
            order: req.body['order'],
            
            customer: req.body['customer'],
            status: req.body['status']
            
            
        }

        const newDoc = await firebaseHelper.firestore
            .createNewDocument(db, userorderCollection, neworder);
        res.status(201).send(`Created a new customer order: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`error`)
    }        
})
// View all orders
app.get('/orders', (req, res) => {
    firebaseHelper.firestore
        .backup(db, userorderCollection)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(400).send(`Cannot get contacts: ${error}`));
})



// Add new contact
app.post('/contacts', async (req, res) => {
    try {
        const contact: Contact = {
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
            email: req.body['email']
        }

        const newDoc = await firebaseHelper.firestore
            .createNewDocument(db, contactsCollection, contact);
        res.status(201).send(`Created a new contact: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`Contact should only contains firstName, lastName and email!!!`)
    }        
})

// Update new contact
app.patch('/contacts/:contactId', async (req, res) => {
    const updatedDoc = await firebaseHelper.firestore
        .updateDocument(db, contactsCollection, req.params.contactId, req.body);
    res.status(204).send(`Update a new contact: ${updatedDoc}`);
})

// View a contact
app.get('/contacts/:contactId', (req, res) => {
    firebaseHelper.firestore
        .getDocument(db, contactsCollection, req.params.contactId)
        .then(doc => res.status(200).send(doc))
        .catch(error => res.status(400).send(`Cannot get contact: ${error}`));
})

// View all contacts
app.get('/contacts', (req, res) => {
    firebaseHelper.firestore
        .backup(db, contactsCollection)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(400).send(`Cannot get contacts: ${error}`));
})

// Delete a contact 
app.delete('/contacts/:contactId', async (req, res) => {
    const deletedContact = await firebaseHelper.firestore
        .deleteDocument(db, contactsCollection, req.params.contactId);
    res.status(204).send(`Contact is deleted: ${deletedContact}`);
})

export { app };