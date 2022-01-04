const express = require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

//const date= require(__dirname + "/date.js");

const app= express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin_awdhesh12:n7ugiqJkKN23lNLi@cluster0.k0spk.mongodb.net/todolist", {useNewUrlParser:true});

// let items=[   "Buy Food", "Cook Food", "Eat Food"];
// let workItems =[ ];
const itemsSchema= {
  name: String
};

const Item = mongoose.model(
  "item", itemsSchema
);

const item1= new Item({
  name:"Welcome to our todoList"
});
const item2= new Item({
  name:"Hit the + button to add new item"
});
const item3= new Item({
  name:"<----- Hit this to delete any item"
});

const defaultItems=[item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List", listSchema)

app.get("/", function(req, res){
  //const day = date.getDay();
  Item.find({}, function(err, foundItems){

    if (foundItems.length===0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved data in database.");
        }
      });
      res.redirect("/");

    }else {
      res.render("list", {listTitle:"Today" ,newListItems:foundItems});

    }

  });

});

app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{

        res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  // if (req.body.list==="Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  //
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }
  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
  res.redirect("list", {})
}else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
};

app.listen(port, function(req, res){
  console.log("The server has started Successfully.");
});
