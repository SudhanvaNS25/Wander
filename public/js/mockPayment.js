const paymentForm =
    document.getElementById("mockPaymentForm");


paymentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const bookingId =
            paymentForm.dataset.bookingId;


        const cardName =
            document.getElementById("cardName").value.trim();

        const cardNumber =
            document.getElementById("cardNumber").value.trim();

        const expiry =
            document.getElementById("expiry").value.trim();

        const cvv =
            document.getElementById("cvv").value.trim();


        // ==========================
        // VALIDATION
        // ==========================

        if (
            !cardName ||
            !cardNumber ||
            !expiry ||
            !cvv
        ) {

            alert(
                "Please fill all payment details."
            );

            return;

        }


        if (cardNumber.length < 12) {

            alert(
                "Please enter a valid card number."
            );

            return;

        }


        if (cvv.length !== 3) {

            alert(
                "Please enter a valid CVV."
            );

            return;

        }


        const payButton =
            document.getElementById("payButton");


        payButton.disabled = true;

        payButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Processing Payment...';


        // ==========================
        // SIMULATE PAYMENT
        // ==========================

        setTimeout(async function () {

            try {

                const response =
                    await fetch(
                        "/bookings/payment-success",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                bookingId:
                                    bookingId
                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Payment failed"
                    );

                }


                // ==========================
                // SUCCESS
                // ==========================

                window.location.href =
                    `/bookings/${bookingId}/confirmation`;


            } catch (error) {

                console.error(error);


                alert(
                    "Payment failed. Please try again."
                );


                payButton.disabled = false;

                payButton.innerHTML =
                    "Pay Again";

            }

        }, 2000);

    }
);