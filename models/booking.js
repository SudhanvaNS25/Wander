const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        checkIn: {
            type: Date,
            required: true
        },

        checkOut: {
            type: Date,
            required: true
        },

        guests: {
            type: Number,
            required: true,
            min: 1,
            max: 20
        },

        nights: {
            type: Number,
            required: true,
            min: 1
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentId: {
            type: String
        },

    paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
     },

     bookingStatus: {
       type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Booking", bookingSchema);