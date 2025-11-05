const mongoose = require("mongoose");
const MessageDao = require("./MessageDao");

jest.mock("mongoose", () => {
  const mockModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const mockSchema = jest.fn(() => mockModel);
  const mockMongoose = {
    Schema: mockSchema,
    model: jest.fn(() => mockModel),
  };
  return mockMongoose;
});

