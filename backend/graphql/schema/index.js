// merging all typeDefs from different schema files


import { CourseTypeDefs } from "./course_schema.js";
import { UserTypeDefs } from "./user_schema.js";
import { TaskTypeDefs } from "./task_schema.js";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { AuthTypeDefs } from "./auth_schema.js";

const typeDefs = mergeTypeDefs([
  UserTypeDefs,
  CourseTypeDefs,
  TaskTypeDefs,
  AuthTypeDefs,
]);

export default typeDefs;
