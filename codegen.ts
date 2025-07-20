import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    generates: {
        "src/graphql/generated/ensemble.tsx": {
            schema: 'https://api.goldsky.com/api/public/project_cmcnps2k01akp01uobifl4bby/subgraphs/ensemble-subgraph/0.0.1/gn',
            documents: ['src/graphql/queries/agents.ts'],
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
        }
    }
}

export default config;
