// server.js

const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');
const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');

// Cassandra client
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'graphql_data'
});

// In-memory user store
// const users = [
//   { id: 1, name: 'Alice', email: 'alice@example.com' },
//   { id: 2, name: 'lake', email: 'lake@example.com' }
// ];

// Define schema
// const schema = buildSchema(`
//   type User {
//     id: Int
//     name: String
//     email: String
//   }

//   type Query {
//     users: [User]
//     user(id: Int!): User
//   }

//   type Mutation {
//     addUser(name: String!, email: String!): User
//   }
// `);

const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    getUsers: [User]
  }

  type Mutation {
    addUser(name: String!, email: String!): User
  }
`);

// Define root resolvers
// const root = {
//   users: () => users,
//   user: ({ id }) => users.find(u => u.id === id),
//   addUser: ({ name, email }) => {
//     const newUser = { id: users.length + 1, name, email };
//     users.push(newUser);
//     return newUser;
//   }
// };

const root = {
  getUsers: async () => {
    const result = await client.execute('SELECT * FROM users');
    return result.rows;
  },
  addUser: async ({ name, email }) => {
    const id = uuidv4();
    await client.execute('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [id, name, email]);
    return { id, name, email };
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
  console.log('Server running at http://localhost:59100/graphql');
});
