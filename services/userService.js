import User from "../models/User.js";

/** Find exactly one user by telegramId */
export async function findUserById(telegramId) {
  return User.findOne({ telegramId });
}

/** Find many users with an optional filter */
export async function findUsers(filter = {}, projection = null, options = {}) {
  return User.find(filter, projection, options);
}

/** Insert new OR update existing user + optionally append enrollment (unique by enrollmentNo) */
export async function upsertUser(
  userData,
  enrollmentData = null, // { enrollmentNo, gradeCardName, programmeCode, sourceGroup? }
  meta = {}              // { command?: string, incrementFetch?: boolean }
) {
  const { telegramId, telegramName, telegramUsername, isPrivate } = userData;
  let user = await User.findOne({ telegramId });

  if (!user) {
    user = new User({
      telegramId,
      telegramName,
      telegramUsername,
      isPrivate: !!isPrivate,
      seenEnrollments: enrollmentData ? [enrollmentData] : [],
      totalFetches: meta.incrementFetch ? 1 : 0,
      lastCommand: meta.command || null,
    });
    await user.save();
    return user;
  }

  // update base fields
  user.telegramName = telegramName;
  user.telegramUsername = telegramUsername;
  user.isPrivate = user.isPrivate || !!isPrivate; // once true, stays true

  // add enrollment only if new (by enrollmentNo)
  if (enrollmentData) {
    user.addEnrollmentIfNew(enrollmentData);
  }

  if (meta.incrementFetch) user.totalFetches += 1;
  if (meta.command) user.lastCommand = meta.command;

  await user.save();
  return user;
}

/** Delete one user entirely */
export async function deleteUser(telegramId) {
  return User.deleteOne({ telegramId });
}

/** Delete a single enrollment from a user (by enrollmentNo) */
export async function deleteEnrollment(telegramId, enrollmentNo) {
  return User.updateOne(
    { telegramId },
    { $pull: { seenEnrollments: { enrollmentNo } } }
  );
}

/** Total users */
export function countUsers() {
  return User.countDocuments();
}

/** Total enrollments across all users */
export async function countEnrollments() {
  const res = await User.aggregate([
    { $project: { size: { $size: "$seenEnrollments" } } },
    { $group: { _id: null, total: { $sum: "$size" } } }
  ]);
  return res[0]?.total || 0;
}

/** Total fetches across all users */
export async function countFetches() {
  const res = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$totalFetches" } } }
  ]);
  return res[0]?.total || 0;
}
