import { gql } from "@apollo/client";

export const AGENT = gql`
    query Agent($id: ID!) {
        agent(id: $id) {
            id
            metadata {
                description
                dexscreener
                github
                id
                imageUri
                name
                telegram
                twitter
                website
                agentCategory
                attributes
                communicationType
                communicationURL
                instructions
                openingGreeting
                prompts
            }
            name
            owner
            reputation
        }
    }
`;