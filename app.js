// linter esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const mongoose = require("mongoose");
const _ = require("lodash");

// OWN Modules

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true})); /* this code is needed for req.body. */
app.use(express.static("public"));

app.set('view engine', 'ejs'); /* this code is for ejs templating */

// Creating Database Connection
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema =new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemSchema);/*Item model or collection*/
const item1= new Item ({name:'Welcome to Your TodoList!'});
const item2 = new  Item ({name:"Hit + button to add a new item."});
const item3 = new Item ({name:"<-- Hit this to delete an item."})

// dummy.data
const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const List = mongoose.model("List",listSchema);

// GET METHOD for "/"
app.get("/", (req,res) =>{
  try {
    const findItem = async () =>{

    const documents = await Item.find({});
    console.log(documents);
        if(documents.length ===0){
          Item.insertMany(defaultItems);
          console.log("Data Added Successfully.");
          res.redirect('/');
        }else {
          res.render("list",{listTitle:"Today",newListItems:documents});
        }
    }
    findItem();
  } catch (e) {
    console.error(e);
  } finally {
    // mongoose.connection.close();
  }
});

// Get Method for dynamic route or Custom List
app.get('/:customListName/',(req,res) =>{
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);
  try {
    const findList = async () =>{
      const foundList = await List.findOne({name:customListName});
        if(!foundList){
          // Creating new List that does Exist!
          const list = new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect(`/${customListName}`)
        }
        else {
          // Show an Existing List
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
    }
    findList();
  } catch (e) {
    console.error(e);
  } finally {

  }

});



// POST Method for '/'
app.post("/", (req,res) =>{

  console.log(req.body);

  let itemName =req.body.newItem;
  const listName = req.body.list;
  let newItem = new Item({name:itemName});

  if(listName === "Today"){
    newItem.save();
    res.redirect('/')
  }/*if end-block*/
  else{
    List.findOne({name : listName })
     .then((docs)=>{
         docs.items.push(newItem);
         docs.save();
         res.redirect(`/${listName}`);
     })
     .catch((err)=>{
         console.log(err);
     });
  } /*else end-block*/

});

// Get Method for "/work"
app.get("/work",(req,res) => {
  res.render("list",{listTitle:"Work List", newListItems:workLists})
});



// <-------------POST Methods--------->

// Post Method for "/work"
app.post("/work", (req,res) =>{
  console.log(req.body);
});

// Post Method for "/delete"
app.post("/delete", (req,res) =>{
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;

  if(listName==='Today'){
    try {
      const deleteItemFunction = async (id) =>{
        await Item.deleteOne({_id:id});
        console.log(`Deleted Item: ${id}`);
      };
      deleteItemFunction();
      res.redirect('/');
    } catch (e) {
      console.error(e);
    }
  }
  else {
    const deleteItmeInsideList = async ()=>{
      try {
        await List.findOneAndUpdate({name:listName},
        {$pull:{items:{_id:checkedItemId}}},
        {new:true}
      );
      } catch (e) {
        console.error(e);
      }
    };
    deleteItmeInsideList();
    res.redirect(`/${listName}`);
  }










  // try {
  //
  //   if(listName === "Today"){
  //     const deleteItemFunction = async (id) =>{
  //       await Item.deleteOne({_id:id});
  //       console.log(`Deleted Item: ${id}`);
  //     }
  //     deleteItemFunction(checkedItemId);
  //   }/*if end-block*/
  //   else{
  //     const deleteItmeInsideList = async ()=>{
  //       try {
  //         await List.findOneAndUpdate({name:listName},
  //         {$pull:{items:{_id:checkedItemId}}},
  //         {new:true}
  //       );
  //       res.redirect(`/${listName}`);
  //       } catch (e) {
  //         console.error(e);
  //       }
  //     };
  //     deleteItmeInsideList();
  //   }/*else end-block*/
  //
  // } catch (e) {
  //   console.error(e);
  // }

  // res.redirect('/');
});


// Get Method for "/about"
app.get('/about',(req,res) =>{
  res.render('about');

});

app.listen(process.env.PORT || port,() =>{
  console.log("Server is running");
});
