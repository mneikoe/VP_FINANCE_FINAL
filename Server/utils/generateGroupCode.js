

const mongoose = require('mongoose');
const TestModel = require("../Models/SusProsClientSchema");

let uniqueCounter = 0;

async function generateAndStoreGroupCode(userId) {
    // Fetch the user document by ID
    const user = await TestModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Increment the unique counter
    uniqueCounter++;

    // Format the unique counter to always be four digits
    const uniqueString = uniqueCounter.toString().padStart(4, '0');

    // Use grade as-is (no padding)
    const grade = user.personalDetails.grade.toString();

    // Extract initials from groupName (first character of each word)
    const groupName = user.personalDetails.groupName || "";
    const initials = groupName
        .split(" ")
        .filter(Boolean) // Remove empty strings from multiple spaces
        .map(word => word[0].toUpperCase())
        .join("");

    // Combine all parts to form the group code
    const groupCode = `${grade}${initials}${uniqueString}`;

    // Update the user document with the group code
    user.personalDetails.groupCode = groupCode;
    await user.save();

    return groupCode;
}

module.exports = generateAndStoreGroupCode;
