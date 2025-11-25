const FileStorage = require('./FileStorage');

const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ObjectID} = mongoose.Types
const path = require('path')

const mockPNG = {
    _id: pngID,
    length: 90210,
    chunkSize: 261120,
    uploadDate: Date.now(),
    filename: "img1.png",
    contentType: "image/png"
}

const mockJPEG = {
    _id: jpegID,
    length: 12345,
    chunkSize: 261120,
    uploadDate: Date.now(),
    filename: "img2.png",
    contentType: "image/jpeg"
}

const mockNonIMG = {
    _id: nonImgID,
    length: 44444,
    chunkSize: 261120,
    uploadDate: Date.now(),
    filename: "nonImg.txt",
    contentType: "text/plain"
}

let controller;
    let req;
    let res; 

beforeEach(() => {
    jest.clearAllMocks();
    controller = new FileStorage();
        
    // Reset standard request & response object
    req = {params: {}};
    res = { status: null, json: jest.fn(), redirect: jest.fn()};
});


test('uploadFile should call upload', async function(){
    req = {params: {mockJPEG}};
    await TeamController.uploadFile(req, res);

    expect(upload.single).toHaveBeenCalled();
})

