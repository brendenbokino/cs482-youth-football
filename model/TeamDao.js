const mongoose = require('mongoose');

// const teamSchema = new mongoose.Schema({
//     // team should have a list of players, coach & stats 
//     teamName: String,
//     players: Array,
//     coach: String,
//     games: Array,
//     _id: String

//     /// Stats might be best here 
// });

const teamSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    teamName: {
        type: String,
        required: false
    },
    players: {
        type: Array,
        default: []
    },
    coach: {
        type: String,
        required: true
    },
    games: {
        type: Array,
        default: []
    },
    record: {
        type: Array, //[wins, losses]
        default: []
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, {
    _id: false  // IMPORTANT: Tell Mongoose not to auto-generate _id
});

const teamModel = mongoose.model('teams', teamSchema);


// Fixed TeamDao methods to work with custom string IDs

exports.create = async function(teamData) {
    let team = await teamModel.create(teamData);
    return team;
}

// FIX: Use findOneAndUpdate instead of findByIdAndUpdate for custom _id
// Handle both ObjectId and string IDs by using native MongoDB collection
exports.update = async function(id, updateData) {
    // Check if ID is a valid ObjectId format (24 hex characters)
    const isObjectIdFormat = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isObjectIdFormat && mongoose.Types.ObjectId.isValid(id)) {
        // Use native collection to bypass Mongoose type casting
        const collection = teamModel.collection;
        
        // Try ObjectId first (most common case for existing data)
        const objectId = new mongoose.Types.ObjectId(id);
        let result = await collection.findOneAndUpdate(
            { _id: objectId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        
        // If not found, try as string
        if (!result || !result.value) {
            result = await collection.findOneAndUpdate(
                { _id: id },
                { $set: updateData },
                { returnDocument: 'after' }
            );
        }
        
        // Extract the document from the result
        let teamDoc = result && result.value ? result.value : null;
        
        if (teamDoc) {
            // Convert the raw document to a Mongoose document
            // Use hydrate to convert the plain object to a Mongoose document
            const team = teamModel.hydrate(teamDoc);
            return team;
        }
        
        return null;
    } else {
        // Not an ObjectId format, query as string using Mongoose
        let team = await teamModel.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        );
        
        return team;
    }
}

// FIX: Use findOne instead of findById for custom _id
// Handle both ObjectId and string IDs by using native MongoDB collection
exports.read = async function(id) {
    // Check if ID is a valid ObjectId format (24 hex characters)
    const isObjectIdFormat = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isObjectIdFormat && mongoose.Types.ObjectId.isValid(id)) {
        // Use native collection to bypass Mongoose type casting
        const collection = teamModel.collection;
        
        // Try ObjectId first (most common case for existing data)
        const objectId = new mongoose.Types.ObjectId(id);
        let teamDoc = await collection.findOne({ _id: objectId });
        
        // If not found, try as string
        if (!teamDoc) {
            teamDoc = await collection.findOne({ _id: id });
        }
        
        // Convert to Mongoose document if found
        if (teamDoc) {
            return teamModel.hydrate(teamDoc);
        }
        
        return null;
    } else {
        // Not an ObjectId format, query as string using Mongoose
        return await teamModel.findOne({ _id: id });
    }
}

exports.readAll = async function() {
    let teams = await teamModel.find({});
    return teams;
}

// FIX: Use findOneAndDelete instead of findByIdAndDelete for custom _id
// Handle both ObjectId and string IDs by using native MongoDB collection
exports.del = async function(id) {
    // Check if ID is a valid ObjectId format (24 hex characters)
    const isObjectIdFormat = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isObjectIdFormat && mongoose.Types.ObjectId.isValid(id)) {
        // Use native collection to bypass Mongoose type casting
        const collection = teamModel.collection;
        
        // Try ObjectId first (most common case for existing data)
        const objectId = new mongoose.Types.ObjectId(id);
        let result = await collection.findOneAndDelete({ _id: objectId });
        
        // If not found, try as string
        if (!result || !result.value) {
            result = await collection.findOneAndDelete({ _id: id });
        }
        
        let teamDoc = result && result.value ? result.value : null;
        
        // Convert to Mongoose document if found
        if (teamDoc) {
            return teamModel.hydrate(teamDoc);
        }
        
        return null;
    } else {
        // Not an ObjectId format, query as string using Mongoose
        return await teamModel.findOneAndDelete({ _id: id });
    }
}

exports.deleteAll = async function() {
    await teamModel.deleteMany({});
    return { success: true };
}
