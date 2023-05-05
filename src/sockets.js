// import Note from './models/Note.js';

import { MONGODB_URI, MONGODB_NAME } from './config.js'
import { MongoClient, ServerApiVersion } from 'mongodb';
const DATABASE = MONGODB_NAME


export default (io)=>{

 let filter = [
    { $sort: { _id: -1 } },  // Ordenar por fecha descendente
    { $group: {
        _id: '$from',
        answer: { $first: '$answer' },
        from: { $first: '$from' }
      }
    }
  ]

    const Mongoclient = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    var NotesCollection = null

    Mongoclient.connect(async err => {
      
      console.log("Mongo Conectado a: " + DATABASE);

        NotesCollection = Mongoclient.db(DATABASE).collection("history");
  
        const changeStream = NotesCollection.watch();

        changeStream.on('change', async (change) => {

          if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'delete') {

            NotesCollection.aggregate(filter).toArray(function(err, result) {
              console.log(result);
              io.emit('server:refresh',result); 
            });

          }

        });


        io.on('connection', async (socket)=>{
          console.log("New conecction")
          
          NotesCollection.aggregate(filter).toArray(function(err, result) {
            console.log(result);
            io.emit('server:init',result); 
          });
  
  
        })
  
        
    
    
    });

 
  
}