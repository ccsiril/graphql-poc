// server.js

const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');

// In-memory user store
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' }
];

// Define schema
const schema = buildSchema(`
  type User {
    id: Int
    name: String
    email: String
  }

  type Query {
    users: [User]
    user(id: Int!): User
  }

  type Mutation {
    addUser(name: String!, email: String!): User
  }
`);

// Define root resolvers
const root = {
  users: () => users,
  user: ({ id }) => users.find(u => u.id === id),
  addUser: ({ name, email }) => {
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    return newUser;
  }
};

// Debug available query fields
console.log(Object.keys(schema.getQueryType().getFields())); // Should show ['users', 'user']

// Set up server
const app = express();

app.use('/graphql', createHandler({
  schema,
  rootValue: root,
  graphiql: true
}));

app.listen(59100, () => {
  console.log('Server running at http://54.167.145.148:59100/graphql');
});

