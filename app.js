//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-angela:Test123@cluster0.ntyyh.mongodb.net/toDoListDB",{useNewUrlParser : true})
const itemsSchema = new mongoose.Schema({
  name : String
})

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your ToDoList."
});
const item2 = new Item({
  name : "Hit the + button to off a new note."
});
const item3 = new Item({
  name : "<-- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
})

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

  if (foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if (err){
       console.log(err);
      }
      else{
        console.log("Success");
      }
    });
    res.redirect("/");
  }
    else res.render("list",{listTitle : "Today", newListItems : foundItems});
  })
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name : itemName
  });
  if (listName == "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
const itemCheckedid = req.body.check;
const listKaName = req.body.listName;

if (listKaName == "Today"){
  Item.findByIdAndRemove(itemCheckedid, function(err){
    if (err) console.log(err);
    else console.log("Done");
  })
  res.redirect("/");
}
else {
  List.findOneAndUpdate({listKaName},{$pull : {items : {_id : itemChecked}}},function(err,foundList){
    if (!err) res.redirect("/" + listKaName);
  })
}
});

app.get("/:List",function(req,res){

  const listName = req.params.List;

  List.findOne({name : listName} , function(err,results){
    if (err) console.log(err);
    else {
      if (!results) {
        const list1 = new List({
        name : listName,
        items : [defaultItems]
      })
      list1.save();
      res.redirect("/"+listName)
    }
      else {
       res.render("list",{listTitle : results.name, newListItems : results.items});
      }
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
