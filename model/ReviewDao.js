const mongoose = require("mongoose");


const ReviewSchema = new mongoose.Schema({
  review: { type: String, default: "" }, 
  author: { type: String, required: true },
  authorType: { type: Number, required: true },
  edited: { type: Boolean, default: false },
  dateCreated: { type: Date, default: Date.now },
  dateEdited: { type: Date },
  team: { type: String }
});

const reviewModel = mongoose.model('Review', ReviewSchema);

module.exports = {
  async create(data) {
      return await reviewModel.create(data);
  },

  async readAll() {
      return await reviewModel.find().sort({ dateCreated: -1 }).lean();
  },

  async findById(id) {
      return await reviewModel.findById(id);
  },

  async delete(id) {
      return await reviewModel.findByIdAndDelete(id);
  },

  async isAuthor(reviewId, userName) {
      const review = await reviewModel.findById(reviewId);
      return review && review.author === userName;
  },

  async update(id, updates) {
      updates.edited = true;
      updates.dateEdited = new Date();
      return await reviewModel.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteAll(){
    return await reviewModel.deleteMany();
  }
};