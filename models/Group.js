import mongoose from "mongoose";

// 🔹 Group snapshot for an enrollment's origin
const SourceGroupSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupUsername: { type: String }, // may be null
  groupLink: { type: String },      // optional
}, { _id: false, minimize: true });

// 🔹 One enrollment a user has fetched/linked
const EnrollmentSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true, trim: true },
  gradeCardName: { type: String, required: true, trim: true },
  programmeCode: { type: String, required: true, trim: true },
  sourceGroup: { type: SourceGroupSchema, default: null },
}, { _id: false, minimize: true });

// 🔹 User schema
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true, index: true },
  telegramName: { type: String, required: true, trim: true },
  telegramUsername: { type: String, trim: true },

  // has ever DMed the bot?
  isPrivate: { type: Boolean, default: false, index: true },

  seenEnrollments: { type: [EnrollmentSchema], default: [] },

  // analytics & housekeeping
  totalFetches: { type: Number, default: 0 },
  lastCommand: { type: String, default: null },

  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
}, { minimize: true });

// keep updatedOn fresh
UserSchema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

// Helper: ensure unique enrollmentNo inside array (at doc level)
UserSchema.methods.addEnrollmentIfNew = function addEnrollmentIfNew(enrObj) {
  const exists = this.seenEnrollments.some(e => e.enrollmentNo === enrObj.enrollmentNo);
  if (!exists) this.seenEnrollments.push(enrObj);
  return !exists;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
