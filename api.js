const express = require('express');
const cors = require('cors')
const mongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(cors());

const conStr = "mongodb+srv://adithyamanikumar:bugs1234@cluster0.wem7prh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const PORT = process.env.PORT || 5000;

// HOME PAGE
app.get('/', (req, res) => {
	res.end('<h1>HELLO WORLD!</h1>');
})

let database = getDb();

// CREATTING A VARIABLE TO STORE DATABASE
let db;
function getDb(){
	mongoClient.connect(conStr).then(clientObj => {
		db = clientObj.db('vidLib');
		console.log('Connected to Database');
	}).then(_ => {
		app.listen(PORT)
		console.log(`SERVER STARTED ON PORT NO. ${PORT}`)
	}).then(_ => {
		

		// GETS ALL USERS
		app.get('/get-users', (req, res) => {
			db.collection('users').find({}).toArray().then(data => {
				res.send(data);
				res.end();
			});
		})

		// ADDS A NEW USER
		app.post('/add-user/', (req, res) => {
			const user = {
				fullname: req.body.fullname,
				email: req.body.email,
				username: req.body.username,
				password: req.body.password,
			}
			db.collection('users').insertOne(user);
			res.end();
		})

		// CHECKS TO SEE IF USERNAME IS ALREADY TAKEN
		app.get('/check-user/:username', (req, res) => {
			db.collection('users').find({username: req.params.username}).toArray().then(data => {
				res.send(data[0]);
				res.end();
			})
		})
		 
		// GETS ADMIN DETAILS
		app.get('/get-admin', (req, res) => {
			db.collection('admin').find({}).toArray().then(data => {
				res.send(data[0]);
				res.end();
			});
		})

		// GETS ALL VIDEOS
		app.get('/get-videos/:category', (req, res) => {
				let category = req.params.category;
				if(category === 'all'){
						db.collection('videos').find().toArray().then(data => {
					res.send(data);
					res.end();
			});
				} else {
						db.collection('videos').find({category}).toArray().then(data => {
								res.send(data);
								res.end();
						})
				}
			
		})

		// GETS A PARTICULAR VIDEO ACCORDING TO ID
		app.get('/get-video/:id', (req, res) => {
			const id = parseInt(req.params.id);
			db.collection('videos').find({id}).toArray().then(data => {
				res.send(data[0]);
				res.end();
			});
		})

		app.delete('/delete-video/:id', (req, res) => {
				const id = parseInt(req.params.id);
				db.collection('videos').deleteOne({id: id}).then(() => {
						res.end();
				})
		})

		// GETS ALL THE CATEGORIES
		app.get('/categories', (req, res) => {
			db.collection('categories').find({}).toArray().then(data => {
				res.send(data);
				res.end();
			});
		})

		app.post('/add-category', (req, res) => {
				
				db.collection('categories').find({}).toArray().then(data => {
						let count = 1;
						let categoryId;
						
					 function checkIfExists(count){
								if(data.find(item => item.id === count)){
										return checkIfExists(count+1);            
								} else {
										return count;
								}
						}
						
						categoryId = checkIfExists(count)
						
						const category = req.body.new_category.toLowerCase().replaceAll(' ', '');
						
						const newCategory = {
								id: categoryId,
								category,
								name: req.body.new_category
						}
						
						db.collection('categories').insertOne(newCategory).then(() => {
								console.log('New Category Added')
						})
				})
				
				res.end();
		})

		app.post('/add-video', (req, res) => {
				db.collection('videos').find({}).toArray().then(data => {
						let count = 1;
						let videoId;
						
					 function checkIfExists(count){
								if(data.find(item => item.id === count)){
										return checkIfExists(count+1);            
								} else {
										return count;
								}
						}
						
						videoId = checkIfExists(count)
						let URL;
						req.body.url.includes('&') ? URL = req.body.url.slice(req.body.url.indexOf("v=")+2, req.body.url.indexOf("&")) : URL = req.body.url.slice(req.body.url.indexOf("v=")+2)
						
					let vidDetails = {
							id: videoId,
							title: req.body.title,
							description: req.body.description,
							category: req.body.category,
						videoCode: URL
					}
					db.collection('videos').insertOne(vidDetails).then(() => {
							console.log('New Video Added');
					})
					res.end()
				})
			
		})
	});
	
	
}





module.exports = app;


