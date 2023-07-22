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

    if (isNaN($amount)) {
      alert("Please enter a valid amount.");
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
      })
      .catch((error) => {
        alert("Error fetching exchange rates: " + error.message);
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
        alert("Error fetching exchange rates: " + error.message);
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
});
