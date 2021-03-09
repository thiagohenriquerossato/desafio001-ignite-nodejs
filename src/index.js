const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username}=request.headers;
  const user = users.find((user)=>{return user.username===username});
  if(!user){
    return response.status(404).json({error:"Username not found!"});
  }
  request.user=user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const usernameAlreadyExists = users.some((user)=>user.username===username);
  if(usernameAlreadyExists){
    return response.status(400).json({error:"Username already exists!"});
  }
  
  const user = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }
  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const{user}=request;
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline}=request.body;
  const {user} = request;
  const todo = {
    id : uuidv4(),
    title,
    done : false,
    deadline : new Date(deadline),
    created_at : new Date()
  }
  user.todos.push(todo)
  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const{id} = request.params;
  const{title, deadline}=request.body;
  const{user}=request;
  const todoAlreadyExists = user.todos.some((todo)=>todo.id===id);
  if(!todoAlreadyExists){
    return response.status(404).json({error:"Todo not found!"});
  }
  let todoUpdated={}
  user.todos.forEach(todo => {
    if(todo.id===id){
      todo.title=title;
      todo.deadline=new Date(deadline);
      todoUpdated = todo;
    }
  });
  return response.status(200).json(todoUpdated);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const{id} = request.params;
  const{user}=request;

  const todoAlreadyExists = user.todos.some((todo)=>todo.id===id);

  if(!todoAlreadyExists){
    return response.status(404).json({error:"Todo not found!"});
  }
  let todoDone ={}
  user.todos.forEach(todo => {
    if(todo.id===id){
      todo.done=true;
      todoDone = todo;
    }
  });

  return response.status(200).json(todoDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const{id} = request.params;
  const{user}=request;

  const todo = user.todos.find((todo)=>todo.id===id);
  if(!todo){
    return response.status(404).json({error:"Todo not found!"});
  }
  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).send();
});

module.exports = app;