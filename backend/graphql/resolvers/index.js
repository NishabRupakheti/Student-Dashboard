// Merging all resolvers into a single export

import { UserResolvers } from "./user_resolver.js";
import { CourseResolvers } from "./course_resolver.js";
import { TaskResolvers } from "./task_resolver.js";
import { mergeResolvers } from "@graphql-tools/merge";

const resolvers = mergeResolvers([
  UserResolvers,
  CourseResolvers,
  TaskResolvers,
]);

export default resolvers;

