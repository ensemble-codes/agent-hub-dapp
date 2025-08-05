import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    generates: {
        "src/graphql/generated/ensemble.tsx": {
            schema: process.env.NEXT_PUBLIC_GRAPHQL_URL,
            documents: ['src/graphql/queries/agents.ts'],
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
        }
    }
}

export default config;
