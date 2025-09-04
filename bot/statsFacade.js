import {
  findUserById, findUsers, upsertUser,
  deleteUser, deleteEnrollment,
  countUsers, countEnrollments, countFetches
} from "../services/userService.js";
import { countGroups } from "../services/groupService.js";

export async function getBotStats() {
  const [users, enrollments, fetches, groups] = await Promise.all([
    countUsers(),
    countEnrollments(),
    countFetches(),
    countGroups()
  ]);
  return { totalUsers: users, totalEnrollments: enrollments, totalFetches: fetches, totalGroups: groups };
}

export {
  findUserById, findUsers, upsertUser,
  deleteUser, deleteEnrollment
};
