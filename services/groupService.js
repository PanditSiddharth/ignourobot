import Group from "../models/Group.js";

/** Add or update a group record */
export async function upsertGroup({ groupId, groupTitle, groupUsername = null, groupLink = null }) {
  let group = await Group.findOne({ groupId });
  if (!group) {
    group = new Group({ groupId, groupTitle, groupUsername, groupLink });
    await group.save();
    return group;
  }
  group.groupTitle = groupTitle;
  group.groupUsername = groupUsername;
  if (groupLink) group.groupLink = groupLink; // preserve if not provided
  await group.save();
  return group;
}

/** Count groups where bot is/was added */
export function countGroups() {
  return Group.countDocuments();
}
