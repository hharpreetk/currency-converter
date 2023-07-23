$(document).ready(function () {
  // Function to fetch exchange rates data from the ExchangeRate-API
  function fetchExchangeRates(baseCurrency) {
    const API_URL = `https://open.er-api.com/v6/latest/${baseCurrency}`;

    return new Promise((resolve, reject) => {
      $.ajax({
        url: API_URL,
        method: "GET",
        success: resolve,
        error: reject,
      });
    });
  }

  // Function to populate the rates table with data
  function populateRatesTable(rates) {
    const $ratesTableBody = $("#ratesTableBody");
    $ratesTableBody.empty(); // Clear previous data

    $.each(rates, (currency, rate) => {
      const $row = $("<tr>");
      $row.append($("<td>", { text: currency, class: "text-center" }));
      $row.append($("<td>", { text: rate.toFixed(6), class: "text-center" }));
      $ratesTableBody.append($row);
    });
  }

  // Function to populate the currency options in the select elements
  function populateCurrencyOptions(currencyData) {
    const $baseCurrencySelect = $("#baseCurrency");
    const $targetCurrencySelect = $("#targetCurrency");

    $.each(currencyData, (currency, rate) => {
      // For Base Currency Select
      $baseCurrencySelect.append(
        $("<option>", {
          value: currency,
          text: currency,
          selected: currency === "USD" ? true : false,
        })
      );

      // For Target Currency Select
      $targetCurrencySelect.append(
        $("<option>", {
          value: currency,
          text: currency,
          selected: currency === "EUR" ? true : false,
        })
      );
    });
  }

  // Function to convert currency and update the result
  function convertCurrency() {
    const $baseCurrency = $("#baseCurrency").val();
    const $targetCurrency = $("#targetCurrency").val();
    const $amount = parseFloat($("#amount").val());
    const $conversionResult = $("#conversionResult");
    const $baseToTargetRate = $("#baseToTargetRate");
    const $targetToBaseRate = $("#targetToBaseRate");
    const $timeLastUpdate = $("#timeLastUpdate");

    // Input validation for amount field
    if (isNaN($amount) || $amount <= 0) {
      $conversionResult.text("Please enter a valid amount.");
      $baseToTargetRate.text("");
      $baseToTargetRate.prop("hidden", true);
      return;
    }

    fetchExchangeRates($baseCurrency)
      .then((data) => {
        const $rates = data.rates;
        const $rate = $rates[$targetCurrency];

        if (!$rate) {
          throw new Error("Invalid target currency.");
        }

        const $convertedAmount = $amount * $rate;

        $conversionResult.text(
          `${$amount} ${$baseCurrency} = ${$convertedAmount.toFixed(
            6
          )} ${$targetCurrency}`
        );

        if ($amount !== 1) {
          $baseToTargetRate.text(
            `1 ${$baseCurrency} = ${$rate.toFixed(6)} ${$targetCurrency}`
          );
          $baseToTargetRate.prop("hidden", false);
        } else {
          $baseToTargetRate.prop("hidden", true);
        }

        // Update the timeLastUpdate span element
        $timeLastUpdate.text(new Date(data.time_last_update_utc).toUTCString());

        // Update the rates table with the rates data
        populateRatesTable($rates);
      })
      .catch((error) => {
        $conversionResult.text(
          "Error fetching exchange rates: " + error.message
        );
        $baseToTargetRate.text("");
        $baseToTargetRate.prop("hidden", true);
      });

    fetchExchangeRates($targetCurrency)
      .then((data) => {
        const $rates = data.rates;
        const $rate = $rates[$baseCurrency];

        if (!$rate) {
          throw new Error("Invalid target currency.");
        }

        $targetToBaseRate.text(
          `1 ${$targetCurrency} = ${$rate.toFixed(6)} ${$baseCurrency}`
        );
      })
      .catch((error) => {
        $targetToBaseRate.text("Error fetching exchange rates.");
      });
  }

  // Update the result on change of base currency, target currency, or amount
  $("#baseCurrency, #targetCurrency, #amount").on(
    "input change",
    convertCurrency
  );

  // Initial setup

  fetchExchangeRates("USD").then((data) => {
    const $rates = data.rates;
    if ($rates) {
      populateCurrencyOptions($rates);
      convertCurrency();
    }
  });

  // When the user scrolls down 200px from the top of the document, show the button
  $(window).scroll(function () {
    var showAfter = 200;
    if ($(this).scrollTop() > showAfter) {
      $("#backToTop").fadeIn();
    } else {
      $("#backToTop").fadeOut();
    }
  });

  // Click event to scroll to top
  $("#backToTop").click(function () {
    $("html, body").scrollTop(0);
  });
});
