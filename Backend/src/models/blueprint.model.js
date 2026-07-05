const mongoose = require("mongoose");

const blueprintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "A blueprint log must be bound to a valid system workspace user ID.",
      ],
    },
    fileName: {
      type: String,
      required: [
        true,
        "The original uploaded document file name parameters must be supplied.",
      ],
      trim: true,
    },
    important_topics: [
      {
        topic_name: {
          type: String,
          required: [
            true,
            "Core high-yield topic identifier name string is mandatory.",
          ],
          trim: true,
        },
        why_it_is_important: {
          type: String,
          required: [
            true,
            "Detailed pedagogical explanation metrics must be mapped.",
          ],
          trim: true,
        },
        key_formulas_or_terms: {
          type: [String],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

blueprintSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Blueprint", blueprintSchema);
