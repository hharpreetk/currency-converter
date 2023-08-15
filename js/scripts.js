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
    clearSearch(); // Clear search input

    $.each(rates, (currency, rate) => {
      const $row = $("<tr>").append(
        $("<td>", { text: currency, class: "text-center" }),
        $("<td>", { text: parseFloat(rate.toFixed(4)), class: "text-center" })
      );
      $ratesTableBody.append($row);
    });
  }

  //Function to search for target currencies in rates table
  function searchRatesTable() {
    // Get the search value
    const $searchInput = $("#searchRatesTable").val().toUpperCase();
    // Filter the table row based on the search value
    $("#ratesTableBody tr").filter(function () {
      // Get the value in the first column (target currency) of each row
      const $targetCurrency = $(this).find("td:eq(0)").text().toUpperCase();
      // Show/hide the row based on whether it matches the search value
      if ($targetCurrency.indexOf($searchInput) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  // Function to clear the search and show all rows in the table
  function clearSearch() {
    $("#searchRatesTable").val(""); // Clear the search input field
    $("#ratesTableBody tr").show(); // Show all rows in the table
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
          `${$amount} ${$baseCurrency} = ${parseFloat(
            $convertedAmount.toFixed(4)
          )} ${$targetCurrency}`
        );

        $targetToBaseRate.text(
          `1 ${$targetCurrency} = ${parseFloat(
            $targetRate.toFixed(4)
          )} ${$baseCurrency}`
        );

        // Show the base converter rate if amount is greater than 1
        if ($amount > 1) {
          $baseToTargetRate
            .text(
              `1 ${$baseCurrency} = ${parseFloat(
                $baseRate.toFixed(4)
              )} ${$targetCurrency}`
            )
            .prop("hidden", false);
        } else {
          $baseToTargetRate.prop("hidden", true);
        }

        // Hide target converter rate if base and target currencies are same
        if ($baseCurrency == $targetCurrency) {
          $targetToBaseRate.prop("hidden", true);
        } else {
          $targetToBaseRate.prop("hidden", false);
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

  // Attach an event listener to base currency, target currency and amount
  $("#baseCurrency, #targetCurrency, #amount").on(
    "input change",
    convertCurrency
  );

  // Attach an event listener to the search input
  $("#searchRatesTable").on("input change keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default behavior
    }
    searchRatesTable();
  });

  // Attach event listener to the search input clear button
  $("#searchRatesTable").on("search", clearSearch);

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
