import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true, index: true },
  groupTitle: { type: String, required: true, trim: true },
  groupUsername: { type: String, trim: true },
  groupLink: { type: String, trim: true },

  addedOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
}, { minimize: true });

GroupSchema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);
export default Group;// keep updatedOn fresh
