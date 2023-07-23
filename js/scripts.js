$(document).ready(function () {
  // Function to fetch exchange rates data from the ExchangeRate-API
  function fetchExchangeRates(baseCurrency) {
    const API_URL = `https://open.er-api.com/v6/latest/${baseCurrency}`;

    return $.ajax({
      url: API_URL,
      method: "GET",
    });
  }

  // Function to populate the rates table with data
  function populateRatesTable(rates) {
    const $ratesTableBody = $("#ratesTableBody");
    $ratesTableBody.empty(); // Clear previous data

    $.each(rates, (currency, rate) => {
      const $row = $("<tr>").append(
        $("<td>", { text: currency, class: "text-center" }),
        $("<td>", { text: rate.toFixed(6), class: "text-center" })
      );
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
          selected: currency === "USD",
        })
      );

      // For Target Currency Select
      $targetCurrencySelect.append(
        $("<option>", {
          value: currency,
          text: currency,
          selected: currency === "EUR",
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
      $baseToTargetRate.text("").prop("hidden", true);
      return;
    }

    // Asynchronous operation using Promises
    Promise.all([
      fetchExchangeRates($baseCurrency),
      fetchExchangeRates($targetCurrency),
    ])
      .then(([baseData, targetData]) => {
        const $baseRates = baseData.rates;
        const $targetRates = targetData.rates;
        const $baseRate = $baseRates[$targetCurrency];
        const $targetRate = $targetRates[$baseCurrency];

        if (!$baseRate || !$targetRate) {
          throw new Error("Invalid currency.");
        }

        const $convertedAmount = $amount * $baseRate;

        $conversionResult.text(
          `${$amount} ${$baseCurrency} = ${$convertedAmount.toFixed(
            6
          )} ${$targetCurrency}`
        );

        $targetToBaseRate.text(
          `1 ${$targetCurrency} = ${$targetRate.toFixed(6)} ${$baseCurrency}`
        );

        if ($amount !== 1) {
          $baseToTargetRate
            .text(
              `1 ${$baseCurrency} = ${$baseRate.toFixed(6)} ${$targetCurrency}`
            )
            .prop("hidden", false);
        } else {
          $baseToTargetRate.prop("hidden", true);
        }

        // Update the timeLastUpdate span element
        $timeLastUpdate.text(
          new Date(baseData.time_last_update_utc).toUTCString()
        );

        // Update the rates table with the rates data
        populateRatesTable($baseRates);
      })
      .catch((error) => {
        $conversionResult.text(
          "Error fetching exchange rates: " + error.message
        );
        $baseToTargetRate.text("").prop("hidden", true);
      });
  }

  // Event Handling using Method Chaining
  $("#baseCurrency, #targetCurrency, #amount").on(
    "input change",
    convertCurrency
  );

  // Initial setup
  fetchExchangeRates("USD")
    .then((data) => {
      const $rates = data.rates;
      if ($rates) {
        populateCurrencyOptions($rates);
        convertCurrency();
      }
    })
    .catch((error) => {
      console.error("Error fetching exchange rates: " + error.message);
    });

  // When the user scrolls down 200px from the top of the document, show the button
  $(window).scroll(function () {
    var showAfter = 200;
    $("#backToTop").toggle($(this).scrollTop() > showAfter);
  });

  // Click event to scroll to top using Plugin Development
  $("#backToTop").on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
  });
});
