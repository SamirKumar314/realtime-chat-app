import { getReceiverSocketId, io } from "../lib/socket.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cloudinary from "../utils/cloudinary.js";

const getUsersForSidebar = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200, filteredUsers, "All users fetched successfully"),
      );
  } catch (error) {
    throw new ApiError(500, "Internal server error");
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages, "All messages are fetched successfully"),
    );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!(text?.trim() || image)) {
    throw new ApiError(400, "Message must contain text or message");
  }

  const fields = {
    senderId,
    receiverId,
  };

  if (text?.trim()) {
    fields.text = text.trim();
  }

  let imageUrl;

  if (image) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      fields.image = imageUrl;
    } catch (error) {
      throw new ApiError(500, "Something went wrong while uploading image");
    }
  }

  const newMessage = await Message.create(fields);

  //real time functionality using socket.io ...
  const receiverSocketId = getReceiverSocketId(receiverId)
  if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage", newMessage)
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

export { getUsersForSidebar, getMessages, sendMessage };
