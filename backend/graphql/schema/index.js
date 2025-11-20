// merging all typeDefs from different schema files


import { CourseTypeDefs } from "./course_schema.js";
import { UserTypeDefs } from "./user_schema.js";
import { TaskTypeDefs } from "./task_schema.js";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([
  UserTypeDefs,
  CourseTypeDefs,
  TaskTypeDefs,
]);

export default typeDefs;
