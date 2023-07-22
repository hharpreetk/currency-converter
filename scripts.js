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
        })
      );

      // For Target Currency Select
      $targetCurrencySelect.append(
        $("<option>", {
          value: currency,
          text: currency,
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
            4
          )} ${$targetCurrency}`
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
