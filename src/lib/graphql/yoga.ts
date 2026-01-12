import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';

const schema = createSchema({
  typeDefs,
  resolvers,
});

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
});
