import { ApolloClient, InMemoryCache } from "@apollo/client";

export const ensembleClient = new ApolloClient({
    uri: 'https://api.goldsky.com/api/public/project_cmcnps2k01akp01uobifl4bby/subgraphs/ensemble-subgraph/0.0.1/gn',
    cache: new InMemoryCache(),
});