$(document).ready(function () {

    /* =========================
       HELPERS
    ========================= */

    const $bottleBody = $(".bottle-body");
    const $bottleCap = $(".bottle-cap");
    const $productCard = $("#productCard");
    const $message = $("#message");
    const API_BASE = "http://localhost:3000";
    let messageTimer;

    function showMessage(text) {
        clearTimeout(messageTimer);
        $message.text(text);
        messageTimer = setTimeout(function () { $message.text(""); }, 2000);
    }

    function setColor(body, cap) {
        $bottleBody.css("fill", body);
        $bottleCap.css("fill", cap);
    }

    /* =========================
       COLORS
    ========================= */

    const colors = {
        black: ["#222", "#111"],
        blue:  ["#315a8c", "#203d61"],
        pink:  ["#c77b8b", "#914d5c"],
        green: ["#567c65", "#385443"]
    };

    $(".color-button").on("click", function () {
        $(".color-button").removeClass("active");
        $(this).addClass("active");
        const c = colors[$(this).data("color")];
        setColor(c[0], c[1]);
        showMessage("Product color updated.");
    });

    /* =========================
       VARIANTS
    ========================= */

    $(".variant").on("click", function () {
        $(".variant").removeClass("active");
        $(this).addClass("active");
        $productCard.css("height", $(this).data("variant") === "sport" ? "420px" : "450px");
        showMessage("Product variant updated.");
    });

    /* =========================
       ENGRAVING (real-time)
    ========================= */

    $("#engravingInput").on("input", function () {
        const value = $(this).val();
        $("#engravingDisplay").text(value || "YOUR NAME");
        $("#svgEngraving").text(value || "VELO");
        $("#characterCount").text(value.length + " / 15");
    });

    /* =========================
       COPY / CUT PROTECTION
    ========================= */

    $("#description").on("copy", function (e) {
        e.preventDefault();
        alert("Copying the product description is not allowed.");
    }).on("cut", function (e) {
        e.preventDefault();
        alert("Cutting the product description is not allowed.");
    });

    /* =========================
       3D MOUSE EFFECT
    ========================= */

    $productCard.on("pointermove", function (e) {
        const rect = this.getBoundingClientRect();
        const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
        const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
        $(this).css("transform",
            "perspective(800px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)");
    }).on("pointerleave", function () {
        $(this).css("transform", "perspective(800px) rotateX(0) rotateY(0)");
    });

    /* =========================
       DRAG AND DROP + CART
    ========================= */

    const $dropCart = $("#dropCart");
    const $cartCount = $("#cartCount");

    $productCard.on("dragstart", function (e) {
        e.originalEvent.dataTransfer.setData("text", "product");
        $(this).css("opacity", ".5");
    }).on("dragend", function () {
        $(this).css("opacity", "1");
    });

    $dropCart.on("dragover", function (e) {
        e.preventDefault();
        $(this).addClass("drag-over");
    }).on("dragleave", function () {
        $(this).removeClass("drag-over");
    }).on("drop", function (e) {
        e.preventDefault();
        $(this).removeClass("drag-over").css("animation", "success .4s ease");
        $cartCount.text("1");
        showMessage("Product successfully added to cart!");
    });

    $("#addButton").on("click", function () {
        $cartCount.text("1");
        showMessage("Product successfully added to cart!");
    });

    /* =========================
       RESET
    ========================= */

    $("#resetButton").on("click", function () {
        $("#engravingInput").val("");
        $("#engravingDisplay").text("YOUR NAME");
        $("#svgEngraving").text("VELO");
        $("#characterCount").text("0 / 15");
        setColor("#222", "#111");
        $(".color-button").removeClass("active");
        $(".color-button.black").addClass("active");
        $(".variant").removeClass("active");
        $('[data-variant="classic"]').addClass("active");
        $productCard.css({ transform: "perspective(800px) rotateX(0) rotateY(0)", filter: "none", height: "450px" });
        $cartCount.text("0");
        selectedPremium = "none";
        showMessage("Product reset successfully.");
    });

    /* =========================
       PREMIUM
    ========================= */

    let premiumUser = false;
    let selectedPremium = "none";
    const $modal = $("#paymentModal");

    $("#upgradeButton").on("click", function () {
        if (premiumUser) { alert("You are already a premium user."); return; }
        $modal.addClass("show");
    });

    $("#closeModal").on("click", function () { $modal.removeClass("show"); });

    $modal.on("click", function (e) {
        if (e.target === this) $modal.removeClass("show");
    });

    function showError(id, text) { $("#" + id).text(text); }

    $("#paymentForm").on("submit", function (e) {
        e.preventDefault();
        $(".error").text("");
        let valid = true;

        if ($.trim($("#cardName").val()) === "") {
            showError("cardNameError", "Enter cardholder name."); valid = false;
        }
        const card = $("#cardNumber").val().replace(/\s/g, "");
        if (card.length !== 16 || isNaN(card)) {
            showError("cardNumberError", "Enter a valid 16 digit card number."); valid = false;
        }
        if (!/^\d{2}\/\d{2}$/.test($("#expiry").val())) {
            showError("expiryError", "Use MM/YY format."); valid = false;
        }
        const cvv = $("#cvv").val();
        if (cvv.length !== 3 || isNaN(cvv)) {
            showError("cvvError", "Enter a valid CVV."); valid = false;
        }
        if (!valid) return;

        const $pay = $(".pay-button");
        $pay.text("Processing...").prop("disabled", true);

        setTimeout(function () {
            premiumUser = true;
            $("#paymentForm").hide();
            $("#paymentSuccess").addClass("show");
            activatePremium();
        }, 1500);
    });

    function activatePremium() {
        $("#userStatus").text("Premium User");
        $("#statusDot").addClass("premium");
        $("#upgradeButton").text("Premium Activated").prop("disabled", true);
        $(".premium-option").removeClass("locked").addClass("unlocked")
            .find("b").text("UNLOCKED");
    }

    $(".premium-option").on("click", function () {
        if (!premiumUser) { $modal.addClass("show"); return; }
        const type = $(this).data("premium");

        if (type === "gold") {
            setColor("#c49a4a", "#8f6a2d");
            showMessage("Gold theme activated!");
        } else if (type === "purple") {
            setColor("#6d4b83", "#432c55");
            showMessage("Royal Purple activated!");
        } else if (type === "glow") {
            $productCard.css("filter", "drop-shadow(0 0 25px #b28a45)");
            showMessage("Premium glow activated!");
        }
        selectedPremium = type;
    });

    $("#successClose").on("click", function () {
        $modal.removeClass("show");
        $("#paymentSuccess").removeClass("show");
        $("#paymentForm").show()[0].reset();
        $(".pay-button").text("Pay $9.99").prop("disabled", false);
    });

    /* Input formatting */

    $("#cardNumber").on("input", function () {
        const v = $(this).val().replace(/\D/g, "").substring(0, 16);
        const parts = v.match(/.{1,4}/g);
        $(this).val(parts ? parts.join(" ") : "");
    });

    $("#expiry").on("input", function () {
        let v = $(this).val().replace(/\D/g, "").substring(0, 4);
        if (v.length > 2) v = v.substring(0, 2) + "/" + v.substring(2);
        $(this).val(v);
    });


    /* =====================================================
       QUESTION 2 - PUBLIC API (DummyJSON) via jQuery AJAX GET
    ===================================================== */

    $("#loadPublicProduct").on("click", function () {
        const id = Math.floor(Math.random() * 100) + 1;
        const $out = $("#publicProduct");
        $out.html("Loading...");

        $.ajax({
            url: "https://dummyjson.com/products/" + id,
            method: "GET",
            dataType: "json",
            success: function (product) {
                console.log("Public API response:", product);   // visible in DevTools
                $out.html(
                    '<img src="' + product.thumbnail + '" alt="' + product.title + '">' +
                    "<strong>" + product.title + "</strong>" +
                    "<div>Price: $" + product.price + "</div>" +
                    "<div>Category: " + product.category + "</div>" +
                    "<div>" + product.description + "</div>"
                );
            },
            error: function (xhr, status, err) {
                console.log("Public API error:", status, err);
                $out.html('<span class="err">Could not load product (' +
                    (xhr.status || "network error") + "). Check your internet and try again.</span>");
            }
        });
    });


    /* =====================================================
       QUESTION 3 - EXPRESS BACKEND
    ===================================================== */

    // ---- AJAX GET -> Express ----
    $("#loadLocalProducts").on("click", function () {
        const $out = $("#localProducts");
        $out.html("Loading...");

        $.ajax({
            url: API_BASE + "/api/products",
            method: "GET",
            success: function (products) {
                console.log("Express GET response:", products);
                $out.html("");
                $.each(products, function (i, p) {
                    $out.append(
                        '<div class="item"><strong>' + p.name + "</strong> - $" + p.price +
                        "<br>Category: " + p.category +
                        " | Colors: " + p.colors.join(", ") + "</div>"
                    );
                });
            },
            error: function (xhr, status, err) {
                console.log("Express GET error:", status, err);
                $out.html('<span class="err">Cannot reach backend. Is "node server.js" running on port 3000?</span>');
            }
        });
    });

    // ---- AJAX POST -> Express ----
    $("#submitConfig").on("click", function () {
        const $out = $("#serverResponse");

        // JavaScript object
        const config = {
            productName: "Velo Smart Bottle",
            price: 34.99,
            color: $(".color-button.active").data("color"),
            variant: $(".variant.active").data("variant"),
            engraving: $("#engravingInput").val() || "none",
            premiumOption: selectedPremium
        };

        $out.html("Sending...");

        $.ajax({
            url: API_BASE + "/api/configurations",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(config),          // object -> JSON string
            success: function (response) {
                console.log("Express POST response:", response);
                $out.html(
                    "<strong>" + response.message + "</strong>" +
                    "<div>Order ID: " + response.order.orderId + "</div>" +
                    "<pre>" + JSON.stringify(response.order, null, 2) + "</pre>"
                );
            },
            error: function (xhr, status, err) {
                console.log("Express POST error:", status, err);
                const msg = xhr.responseJSON ? xhr.responseJSON.message : "Cannot reach backend on port 3000.";
                $out.html('<span class="err">' + msg + "</span>");
            }
        });
    });

});
