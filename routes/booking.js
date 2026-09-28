const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Listing = require("../models/listing");

const { isLoggedIn } = require("../middleware");


// SHOW BOOKING PAGE
router.get("/new/:listingId", isLoggedIn, async (req, res) => {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("bookings/booking", { listing });
});

// CREATE BOOKING / PAYMENT ORDER
router.post("/create", isLoggedIn, async (req, res) => {

    try {

        const {
            listingId,
            checkIn,
            checkOut,
            guests
        } = req.body;
        // 1. CHECK LISTING
        const listing = await Listing.findById(listingId);

        if (!listing) {

            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });

        }
        // 2. VALIDATE DATES
        if (!checkIn || !checkOut) {

            return res.status(400).json({
                success: false,
                message: "Please select check-in and check-out dates"
            });

        }


        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);


        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid booking dates"
            });

        }


        // Check-out must be after check-in

        if (endDate <= startDate) {

            return res.status(400).json({
                success: false,
                message: "Check-out must be after check-in"
            });

        }
        // 3. PREVENT PAST BOOKINGS
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (startDate < today) {

            return res.status(400).json({
                success: false,
                message: "Check-in date cannot be in the past"
            });

        }
        // 4. VALIDATE GUESTS
        const guestCount = Number(guests);

        if (
            !Number.isInteger(guestCount) ||
            guestCount < 1 ||
            guestCount > 20
        ) {

            return res.status(400).json({
                success: false,
                message: "Guests must be between 1 and 20"
            });

        }
        // 5. CALCULATE NUMBER OF NIGHTS
        const millisecondsPerDay =
            1000 * 60 * 60 * 24;

        const nights = Math.ceil(
            (endDate - startDate) /
            millisecondsPerDay
        );


        if (nights < 1) {

            return res.status(400).json({
                success: false,
                message: "Booking must be at least one night"
            });

        }
        // 6. CALCULATE TOTAL PRICE ON SERVER
        const totalAmount =
            listing.price * nights;


        // 7. CHECK FOR DOUBLE BOOKING


const existingBooking = await Booking.findOne({
    listing: listingId,

    bookingStatus: "confirmed",

    paymentStatus: "paid",

    checkIn: { $lt: endDate },

    checkOut: { $gt: startDate }
});

if (existingBooking) {
    return res.status(400).json({
        success: false,
        message: "These dates are already booked. Please select different dates."
    });
}
        // 8. CREATE PENDING BOOKING
        const paymentId =
            "MOCK_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();


        const booking = new Booking({

            listing: listingId,

            user: req.user._id,

            checkIn: startDate,

            checkOut: endDate,

            guests: guestCount,

            nights: nights,

            totalAmount: totalAmount,

            paymentId: paymentId,

            paymentStatus: "pending",

            bookingStatus: "pending"

        });


        await booking.save();

        // 9. SEND RESPONSE TO FRONTEND

        res.json({

            success: true,

            bookingId: booking._id,

            paymentId: paymentId,

            amount: totalAmount,

            nights: nights

        });


    } catch (error) {

        console.error("Booking creation error:", error);

        res.status(500).json({

            success: false,

            message: "Something went wrong while creating booking"

        });

    }

});


// PAYMENT SUCCESS

router.post(
    "/payment-success",
    isLoggedIn,
    async (req, res) => {

        try {

            const { bookingId } = req.body;


            const booking =
                await Booking.findOne({

                    _id: bookingId,

                    user: req.user._id

                });


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message: "Booking not found"

                });

            }


            // Mark payment as successful

            booking.paymentStatus = "paid";

            booking.bookingStatus = "confirmed";


            await booking.save();


            res.json({

                success: true,

                message: "Payment successful",

                bookingId: booking._id

            });


        } catch (error) {

            console.error(
                "Payment success error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Unable to complete payment"

            });

        }

    }
);

// PAYMENT FAILED
router.post(
    "/payment-failed",
    isLoggedIn,
    async (req, res) => {

        try {

            const { bookingId } = req.body;


            const booking =
                await Booking.findOne({

                    _id: bookingId,

                    user: req.user._id

                });


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message: "Booking not found"

                });

            }


            booking.paymentStatus = "failed";


            await booking.save();


            res.json({

                success: true,

                message: "Payment marked as failed"

            });


        } catch (error) {

            console.error(
                "Payment failed error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Unable to update payment status"

            });

        }

    }
);

// BOOKING CONFIRMATION
router.get(
    "/:bookingId/confirmation",
    isLoggedIn,
    async (req, res) => {

        const booking =
            await Booking.findOne({

                _id: req.params.bookingId,

                user: req.user._id

            })
            .populate("listing")
            .populate("user");


        if (!booking) {

            req.flash(
                "error",
                "Booking not found!"
            );

            return res.redirect("/listings");

        }


        res.render(
            "bookings/confirmation",
            { booking }
        );

    }
);
// SHOW MOCK PAYMENT PAGE

router.get(
    "/payment/:bookingId",
    isLoggedIn,
    async (req, res) => {

        const booking =
            await Booking.findOne({
                _id: req.params.bookingId,
                user: req.user._id
            })
            .populate("listing");


        if (!booking) {

            req.flash(
                "error",
                "Booking not found!"
            );

            return res.redirect("/listings");

        }


        if (booking.paymentStatus === "paid") {

            return res.redirect(
                `/bookings/${booking._id}/confirmation`
            );

        }


        res.render(
            "bookings/payment",
            { booking }
        );

    }
);

module.exports = router;