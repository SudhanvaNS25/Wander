const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const listingId =
        bookingForm.querySelector(
            'input[name="listingId"]'
        ).value;

    const checkIn =
        document.getElementById("checkIn").value;

    const checkOut =
        document.getElementById("checkOut").value;

    const guests =
        document.getElementById("guests").value;

    const paymentButton =
        document.getElementById("paymentButton");


    // ==============================
    // FRONTEND VALIDATION
    // ==============================

    if (!checkIn || !checkOut) {
        alert("Please select check-in and check-out dates.");
        return;
    }


    if (new Date(checkOut) <= new Date(checkIn)) {
        alert("Check-out must be after check-in.");
        return;
    }


    if (!guests || guests < 1 || guests > 20) {
        alert("Guests must be between 1 and 20.");
        return;
    }


    // Disable button

    paymentButton.disabled = true;

    paymentButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';


    try {

        // ==============================
        // SEND DATA TO SERVER
        // ==============================

        const response = await fetch(
            "/bookings/create",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    listingId: listingId,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    guests: guests
                })
            }
        );


        const data = await response.json();


        // ==============================
        // SERVER ERROR
        // ==============================

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to create booking"
            );

        }


        // ==============================
        // BOOKING CREATED
        // ==============================

        console.log(
            "Booking created:",
            data
        );


        // Go to mock payment page

        window.location.href =
            `/bookings/payment/${data.bookingId}`;


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        alert(error.message);


        // Enable button again

        paymentButton.disabled = false;

        paymentButton.innerHTML =
            '<i class="fa-solid fa-credit-card"></i> Proceed to Payment';

    }

});