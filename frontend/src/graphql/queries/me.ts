import { gql } from "@apollo/client";
// a basic graphql query to get the current logged in user's id and email
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
    }
  }
`;
